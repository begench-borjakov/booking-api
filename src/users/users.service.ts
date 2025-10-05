import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { hashPassword } from '../сommon/utils/hash.util'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'
import { UserEntity } from '../database/users/user.entity'

const SALT_ROUNDS = 12

@Injectable()
export class UsersService {
  constructor(private readonly uow: PrismaUnitOfWork) {}

  async create(email: string, password: string, name?: string): Promise<UserEntity> {
    const passwordHash = await hashPassword(password)
    try {
      return await this.uow.withTransaction(({ users }) =>
        users.create({ email, name, passwordHash })
      )
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        // unique constraint failed on the fields: (`email`)
        throw new ConflictException('Email already in use')
      }
      throw e
    }
  }

  async getById(id: string): Promise<UserEntity> {
    const { users } = this.uow.repos()
    const u = await users.findById(id)
    if (!u) throw new NotFoundException('User not found')
    return u
  }

  async list(params: {
    search?: string
    page?: number
    limit?: number
  }): Promise<{ items: UserEntity[]; total: number; page: number; limit: number }> {
    const page = params.page && params.page > 0 ? params.page : 1
    const limit = params.limit && params.limit > 0 && params.limit <= 100 ? params.limit : 20
    const skip = (page - 1) * limit

    const { users } = this.uow.repos()
    const { items, total } = await users.findMany({ search: params.search, skip, take: limit })
    return { items, total, page, limit }
  }

  async update(id: string, patch: { name?: string; password?: string }): Promise<UserEntity> {
    return this.uow.withTransaction(async ({ users }) => {
      const existing = await users.findById(id)
      if (!existing) throw new NotFoundException('User not found')

      // при обновлении:
      const passwordHash =
        patch.password !== undefined ? await hashPassword(patch.password) : undefined
      return users.update(id, { name: patch.name, passwordHash })
    })
  }

  async delete(id: string): Promise<void> {
    return this.uow.withTransaction(async ({ users }) => {
      const existing = await users.findById(id)
      if (!existing) throw new NotFoundException('User not found')
      await users.delete(id)
    })
  }
}
