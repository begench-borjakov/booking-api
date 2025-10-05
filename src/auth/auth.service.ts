import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'
import { comparePasswords, hashPassword } from '../common/utils/hash.util'
import type { JwtPayload } from '../third-party/jwt/jwt.payload'
import type { UserEntity } from '../database/users/user.entity'
import { AppLogger } from 'src/common/logger/app-logger.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly uow: PrismaUnitOfWork,
    private readonly jwt: JwtService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext?.(AuthService.name)
  }

  private async signFor(user: { id: string; email: string }): Promise<string> {
    const payload: JwtPayload = { sub: user.id, email: user.email }
    this.logger.debug(`sign jwt for user=${user.id}`)
    return this.jwt.signAsync(payload)
  }

  /** Саморегистрация + мгновенная выдача JWT */
  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<{ access_token: string }> {
    this.logger.debug(`register: try email=${email}`)
    const { users } = this.uow.repos()

    // Предварительная проверка (быстро даёт 409 для UX),
    const exists = await users.findByEmail(email)
    if (exists) {
      this.logger.warn(`register: email already used email=${email}`)
      throw new ConflictException('Email already in use')
    }

    const passwordHash = await hashPassword(password)

    try {
      const user = await this.uow.withTransaction(({ users }) =>
        users.create({ email, name, passwordHash })
      )
      this.logger.log(`register: ok user=${user.id}`)
      return { access_token: await this.signFor(user) }
    } catch (err) {
      // если репозиторий пробросит 409 по уникальности — выше перехватит глоабльный фильтр
      this.logger.error(
        `register: failed email=${email}`,
        err instanceof Error ? err.stack : undefined
      )
      throw err
    }
  }

  /** Логин по email/password → JWT */
  async login(email: string, password: string): Promise<{ access_token: string }> {
    this.logger.debug(`login: try email=${email}`)
    const { users } = this.uow.repos()

    const auth = await users.findAuthByEmail(email) // { id, email, passwordHash }
    if (!auth) {
      this.logger.warn(`login: user not found email=${email}`)
      throw new UnauthorizedException('Invalid credentials')
    }

    const ok = await comparePasswords(password, auth.passwordHash)
    if (!ok) {
      this.logger.warn(`login: invalid credentials email=${email}`)
      throw new UnauthorizedException('Invalid credentials')
    }

    this.logger.log(`login: ok user=${auth.id}`)
    return { access_token: await this.signFor(auth) }
  }

  /** Текущий пользователь (по id из токена) */
  async me(userId: string): Promise<UserEntity | { id: string; email: string; name?: string }> {
    this.logger.debug(`me: fetch user=${userId}`)
    const { users } = this.uow.repos()

    const u = await users.findById(userId)
    if (!u) {
      this.logger.warn(`me: user not found user=${userId}`)
      // пользователь мог быть удалён, но токен ещё жив — вернём минимальные данные
      return { id: userId, email: '' }
    }

    this.logger.debug(`me: ok user=${userId}`)
    return u
  }
}
