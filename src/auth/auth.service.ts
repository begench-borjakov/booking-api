import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'
import { comparePasswords, hashPassword } from '../сommon/utils/hash.util'
import type { JwtPayload } from '../third-party/jwt/jwt.payload'
import type { UserEntity } from '../database/users/user.entity'

@Injectable()
export class AuthService {
  constructor(
    private readonly uow: PrismaUnitOfWork,
    private readonly jwt: JwtService
  ) {}

  private async signFor(user: { id: string; email: string }): Promise<string> {
    const payload: JwtPayload = { sub: user.id, email: user.email }
    return this.jwt.signAsync(payload)
  }

  /** Саморегистрация + мгновенная выдача JWT */
  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<{ access_token: string }> {
    const { users } = this.uow.repos()

    // Простая проверка на дубликат (без привязки к коду P2002).
    const exists = await users.findByEmail(email)
    if (exists) throw new ConflictException('Email already in use')

    const passwordHash = await hashPassword(password)
    const user = await this.uow.withTransaction(({ users }) =>
      users.create({ email, name, passwordHash })
    )

    return { access_token: await this.signFor(user) }
  }

  /** Логин по email/password → JWT */
  async login(email: string, password: string): Promise<{ access_token: string }> {
    const { users } = this.uow.repos()
    const auth = await users.findAuthByEmail(email) // содержит passwordHash
    const ok = auth && (await comparePasswords(password, auth.passwordHash))
    if (!ok) throw new UnauthorizedException('Invalid credentials')

    return { access_token: await this.signFor(auth) }
  }

  /** Текущий пользователь (по id из токена) */
  async me(userId: string): Promise<UserEntity | { id: string; email: string; name?: string }> {
    const { users } = this.uow.repos()
    const u = await users.findById(userId)
    // Если пользователя уже удалили, но токен ещё жив — вернём минимальные данные
    return u ?? { id: userId, email: '' }
  }
}
