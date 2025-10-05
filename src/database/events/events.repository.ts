import { Prisma, PrismaClient } from '@prisma/client'
import { EventEntity } from './event.entity'

type Client = PrismaClient | Prisma.TransactionClient

export class PrismaEventsRepository {
  constructor(private readonly prisma: Client) {}

  private toEntity(row: {
    id: number
    name: string
    total_seats: number
    createdAt: Date
    updatedAt: Date
  }): EventEntity {
    return {
      id: row.id,
      name: row.name,
      totalSeats: row.total_seats, // snake -> camel
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async create(name: string, totalSeats: number): Promise<EventEntity> {
    const e = await this.prisma.event.create({
      data: { name, total_seats: totalSeats },
      select: { id: true, name: true, total_seats: true, createdAt: true, updatedAt: true },
    })
    return this.toEntity(e)
  }

  async findById(id: number): Promise<EventEntity | null> {
    const e = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true, name: true, total_seats: true, createdAt: true, updatedAt: true },
    })
    return e ? this.toEntity(e) : null
  }

  async update(id: number, patch: { name?: string; totalSeats?: number }): Promise<EventEntity> {
    const data: Prisma.EventUpdateInput = {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.totalSeats !== undefined ? { total_seats: patch.totalSeats } : {}),
    }
    const e = await this.prisma.event.update({
      where: { id },
      data,
      select: { id: true, name: true, total_seats: true, createdAt: true, updatedAt: true },
    })
    return this.toEntity(e)
  }

  async delete(id: number): Promise<void> {
    await this.prisma.event.delete({ where: { id } })
  }

  async findMany(params: {
    search?: string
    skip?: number
    take?: number
  }): Promise<{ items: EventEntity[]; total: number }> {
    const where: Prisma.EventWhereInput =
      params.search && params.search.trim()
        ? { name: { contains: params.search.trim(), mode: 'insensitive' } }
        : {}

    const [rows, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { id: 'desc' },
        select: { id: true, name: true, total_seats: true, createdAt: true, updatedAt: true },
      }),
      this.prisma.event.count({ where }),
    ])

    return { items: rows.map((r) => this.toEntity(r)), total }
  }

  async getTotalSeats(id: number): Promise<number | null> {
    const e = await this.prisma.event.findUnique({
      where: { id },
      select: { total_seats: true },
    })
    return e ? e.total_seats : null
  }
}
