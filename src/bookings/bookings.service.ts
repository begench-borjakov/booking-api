import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'
import type { BookingEntity } from '../database/bookings/booking.entity'

@Injectable()
export class BookingsService {
  constructor(private readonly uow: PrismaUnitOfWork) {}

  /** Ключевой use-case: бронь места */
  async reserve(eventId: number, userId: string): Promise<BookingEntity> {
    return this.uow.run(async ({ events, bookings, users }) => {
      const event = await events.findById(eventId)
      if (!event) throw new NotFoundException('Event not found')

      const userExists = await users.existsById(userId)
      if (!userExists) throw new NotFoundException('User not found')

      const taken = await bookings.countByEventId(eventId)
      if (taken >= event.totalSeats) {
        throw new BadRequestException('No seats available')
      }

      const duplicate = await bookings.findByEventAndUser(eventId, userId)
      if (duplicate) {
        throw new ConflictException('User already booked this event')
      }

      return bookings.create(eventId, userId)
    })
  }

  /** Получить бронь по id */
  async getById(id: number): Promise<BookingEntity> {
    const { bookings } = this.uow.repos()
    const b = await bookings.findById(id)
    if (!b) throw new NotFoundException('Booking not found')
    return b
  }

  /** Список броней с фильтрами и пагинацией */
  async list(params: {
    eventId?: number
    userId?: string
    page?: number
    limit?: number
  }): Promise<{ items: BookingEntity[]; total: number; page: number; limit: number }> {
    const page = params.page && params.page > 0 ? params.page : 1
    const limit = params.limit && params.limit > 0 && params.limit <= 100 ? params.limit : 20
    const skip = (page - 1) * limit

    const { bookings } = this.uow.repos()
    const { items, total } = await bookings.findMany({
      eventId: params.eventId,
      userId: params.userId,
      skip,
      take: limit,
    })

    return { items, total, page, limit }
  }

  /** Отмена брони */
  async cancel(id: number): Promise<void> {
    return this.uow.run(async ({ bookings }) => {
      const found = await bookings.findById(id)
      if (!found) throw new NotFoundException('Booking not found')
      await bookings.delete(id)
    })
  }
}
