import { Prisma, PrismaClient } from '@prisma/client'
import { BookingEntity } from './booking.entity'

type Client = PrismaClient | Prisma.TransactionClient

export class PrismaBookingsRepository {
  constructor(private readonly prisma: Client) {}

  private toEntity(row: {
    id: number
    eventId: number
    userId: string
    createdAt: Date
  }): BookingEntity {
    return {
      id: row.id,
      eventId: row.eventId,
      userId: row.userId,
      createdAt: row.createdAt,
    }
  }

  countByEventId(eventId: number): Promise<number> {
    return this.prisma.booking.count({ where: { eventId } })
  }

  async create(eventId: number, userId: string): Promise<BookingEntity> {
    const b = await this.prisma.booking.create({
      data: { eventId, userId },
      select: { id: true, eventId: true, userId: true, createdAt: true },
    })
    return this.toEntity(b)
  }

  async findByEventAndUser(eventId: number, userId: string): Promise<BookingEntity | null> {
    const b = await this.prisma.booking.findFirst({
      where: { eventId, userId },
      select: { id: true, eventId: true, userId: true, createdAt: true },
    })
    return b ? { id: b.id, eventId: b.eventId, userId: b.userId, createdAt: b.createdAt } : null
  }

  async findById(id: number): Promise<BookingEntity | null> {
    const b = await this.prisma.booking.findUnique({
      where: { id },
      select: { id: true, eventId: true, userId: true, createdAt: true },
    })
    return b ? this.toEntity(b) : null
  }

  async findMany(params: {
    eventId?: number
    userId?: string
    skip?: number
    take?: number
  }): Promise<{ items: BookingEntity[]; total: number }> {
    const where: Prisma.BookingWhereInput = {
      ...(params.eventId !== undefined ? { eventId: params.eventId } : {}),
      ...(params.userId !== undefined ? { userId: params.userId } : {}),
    }

    // Никаких вложенных транзакций внутри репозитория!
    const [rows, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { id: 'desc' },
        select: { id: true, eventId: true, userId: true, createdAt: true },
      }),
      this.prisma.booking.count({ where }),
    ])

    return {
      items: rows.map((r) => ({
        id: r.id,
        eventId: r.eventId,
        userId: r.userId,
        createdAt: r.createdAt,
      })),
      total,
    }
  }

  async delete(id: number): Promise<void> {
    await this.prisma.booking.delete({ where: { id } })
  }
}
