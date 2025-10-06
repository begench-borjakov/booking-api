import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'
import { hashPassword } from '../common/utils/hash.util'
import type { UserEntity } from '../database/users/user.entity'
import { AppLogger } from '../common/logger/app-logger.service'

@Injectable()
export class UsersService {
  constructor(
    private readonly uow: PrismaUnitOfWork,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext?.(UsersService.name)
  }

  async create(email: string, password: string, name?: string): Promise<UserEntity> {
    this.logger.debug(`create: try email=${email}`)
    const exists = await this.uow.repos().users.findByEmail(email)
    if (exists) {
      this.logger.warn(`create: duplicate email=${email}`)
      throw new ConflictException('Email already in use')
    }

    const passwordHash = await hashPassword(password)
    const user = await this.uow.withTransaction(({ users }) =>
      users.create({ email, name, passwordHash })
    )
    this.logger.log(`create: ok user=${user.id}`)
    return user
  }

  async getById(id: string): Promise<UserEntity> {
    this.logger.debug(`getById: ${id}`)
    const user = await this.uow.repos().users.findById(id)
    if (!user) {
      this.logger.warn(`getById: not found user=${id}`)
      throw new NotFoundException('User not found')
    }
    this.logger.debug(`getById: ok user=${id}`)
    return user
  }

  async list(params: {
    search?: string
    page?: number
    limit?: number
  }): Promise<{ items: UserEntity[]; total: number; page: number; limit: number }> {
    const page = params.page && params.page > 0 ? params.page : 1
    const limit = params.limit && params.limit > 0 && params.limit <= 100 ? params.limit : 20
    const skip = (page - 1) * limit

    this.logger.debug(`list: search=${params.search ?? '-'} page=${page} limit=${limit}`)
    const { items, total } = await this.uow.repos().users.findMany({
      search: params.search,
      skip,
      take: limit,
    })
    this.logger.debug(`list: ok total=${total}`)
    return { items, total, page, limit }
  }

  async update(id: string, patch: { name?: string; password?: string }): Promise<UserEntity> {
    this.logger.debug(`update: try user=${id}`)
    const repo = this.uow.repos().users
    const existing = await repo.findById(id)
    if (!existing) {
      this.logger.warn(`update: not found user=${id}`)
      throw new NotFoundException('User not found')
    }

    const passwordHash =
      patch.password !== undefined ? await hashPassword(patch.password) : undefined

    const user = await this.uow.withTransaction(({ users }) =>
      users.update(id, { name: patch.name, passwordHash })
    )
    this.logger.log(
      `update: ok user=${id} nameChanged=${patch.name !== undefined} passwordChanged=${patch.password !== undefined}`
    )
    return user
  }

  async delete(id: string): Promise<void> {
    this.logger.debug(`delete: try user=${id}`)
    const repo = this.uow.repos().users
    const existing = await repo.findById(id)
    if (!existing) {
      this.logger.warn(`delete: not found user=${id}`)
      throw new NotFoundException('User not found')
    }
    await this.uow.withTransaction(({ users }) => users.delete(id))
    this.logger.log(`delete: ok user=${id}`)
  }
}
