import { Prisma, PrismaClient } from '@prisma/client'
import { UserEntity, UserWithPassword } from './user.entity'

type Client = PrismaClient | Prisma.TransactionClient

export class PrismaUsersRepository {
  constructor(private readonly prisma: Client) {}

  private toEntity(row: {
    id: string
    email: string
    name: string | null
    createdAt: Date
    updatedAt: Date
  }): UserEntity {
    return {
      id: row.id,
      email: row.email,
      name: row.name ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  private toEntityWithPassword(row: {
    id: string
    email: string
    name: string | null
    password: string
    createdAt: Date
    updatedAt: Date
  }): UserWithPassword {
    return {
      id: row.id,
      email: row.email,
      name: row.name ?? undefined,
      passwordHash: row.password,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async existsById(id: string): Promise<boolean> {
    const u = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })
    return !!u
  }

  async create(data: { email: string; name?: string; passwordHash: string }): Promise<UserEntity> {
    const u = await this.prisma.user.create({
      data: { email: data.email, name: data.name, password: data.passwordHash },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    })
    return this.toEntity(u)
  }

  async findById(id: string): Promise<UserEntity | null> {
    const u = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    })
    return u ? this.toEntity(u) : null
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const u = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    })
    return u ? this.toEntity(u) : null
  }

  /** Специально для логина/проверки пароля */
  async findAuthByEmail(email: string): Promise<UserWithPassword | null> {
    const u = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return u ? this.toEntityWithPassword(u) : null
  }

  async update(id: string, patch: { name?: string; passwordHash?: string }): Promise<UserEntity> {
    const data: Prisma.UserUpdateInput = {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.passwordHash !== undefined ? { password: patch.passwordHash } : {}),
    }
    const u = await this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    })
    return this.toEntity(u)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } })
  }

  async findMany(params: {
    search?: string
    skip?: number
    take?: number
  }): Promise<{ items: UserEntity[]; total: number }> {
    const where: Prisma.UserWhereInput =
      params.search && params.search.trim()
        ? {
            OR: [
              { email: { contains: params.search.trim(), mode: 'insensitive' } },
              { name: { contains: params.search.trim(), mode: 'insensitive' } },
            ],
          }
        : {}

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
      }),
      this.prisma.user.count({ where }),
    ])

    return { items: rows.map((r) => this.toEntity(r)), total }
  }
}
