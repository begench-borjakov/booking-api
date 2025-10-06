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
      totalSeats: row.total_seats,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async create(name: string, totalSeats: number): Promise<EventEntity> {
    const event = await this.prisma.event.create({
      data: { name, total_seats: totalSeats },
      select: { id: true, name: true, total_seats: true, createdAt: true, updatedAt: true },
    })
    return this.toEntity(event)
  }

  async findById(id: number): Promise<EventEntity | null> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true, name: true, total_seats: true, createdAt: true, updatedAt: true },
    })
    return event ? this.toEntity(event) : null
  }

  async update(id: number, patch: { name?: string; totalSeats?: number }): Promise<EventEntity> {
    const data: Prisma.EventUpdateInput = {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.totalSeats !== undefined ? { total_seats: patch.totalSeats } : {}),
    }
    const event = await this.prisma.event.update({
      where: { id },
      data,
      select: { id: true, name: true, total_seats: true, createdAt: true, updatedAt: true },
    })
    return this.toEntity(event)
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
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { total_seats: true },
    })
    return event ? event.total_seats : null
  }
}
