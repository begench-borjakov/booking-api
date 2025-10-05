import { Prisma, PrismaClient } from '@prisma/client'
import { BookingEntity } from '../entities/booking.entity'

type Client = PrismaClient | Prisma.TransactionClient

export class PrismaBookingsRepository {
  constructor(private readonly prisma: Client) {}

  countByEventId(eventId: number) {
    return this.prisma.booking.count({ where: { eventId } })
  }

  async create(eventId: number, userId: string): Promise<BookingEntity> {
    const b = await this.prisma.booking.create({
      data: { eventId, userId },
      select: { id: true, eventId: true, userId: true, createdAt: true },
    })
    return { id: b.id, eventId: b.eventId, userId: b.userId, createdAt: b.createdAt }
  }

  async findByEventAndUser(eventId: number, userId: string): Promise<BookingEntity | null> {
    const b = await this.prisma.booking.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { id: true, eventId: true, userId: true, createdAt: true },
    })
    return b ? { id: b.id, eventId: b.eventId, userId: b.userId, createdAt: b.createdAt } : null
  }
}
