import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'
import type { BookingEntity } from '../database/bookings/booking.entity'
import { AppLogger } from '../common/logger/app-logger.service'

@Injectable()
export class BookingsService {
  constructor(
    private readonly uow: PrismaUnitOfWork,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext?.(BookingsService.name)
  }

  /** Ключевой use-case: бронь места */
  async reserve(eventId: number, userId: string): Promise<BookingEntity> {
    this.logger.debug(`reserve: try event=${eventId} user=${userId}`)

    return this.uow.run(async ({ events, bookings, users }) => {
      const event = await events.findById(eventId)
      if (!event) {
        this.logger.warn(`reserve: event not found event=${eventId} user=${userId}`)
        throw new NotFoundException('Event not found')
      }

      const userExists = await users.existsById(userId)
      if (!userExists) {
        this.logger.warn(`reserve: user not found user=${userId}`)
        throw new NotFoundException('User not found')
      }

      const taken = await bookings.countByEventId(eventId)
      if (taken >= event.totalSeats) {
        this.logger.warn(
          `reserve: no seats event=${eventId} taken=${taken}/${event.totalSeats} user=${userId}`
        )
        throw new BadRequestException('No seats available')
      }

      const duplicate = await bookings.findByEventAndUser(eventId, userId)
      if (duplicate) {
        this.logger.warn(`reserve: duplicate event=${eventId} user=${userId}`)
        throw new ConflictException('User already booked this event')
      }

      const b = await bookings.create(eventId, userId)
      this.logger.log(`reserve: ok booking=${b.id} event=${eventId} user=${userId}`)
      return b
    })
  }

  /** Получить бронь по id */
  async getById(id: number): Promise<BookingEntity> {
    this.logger.debug(`getById: try booking=${id}`)
    const { bookings } = this.uow.repos()
    const b = await bookings.findById(id)
    if (!b) {
      this.logger.warn(`getById: not found booking=${id}`)
      throw new NotFoundException('Booking not found')
    }
    this.logger.debug(`getById: ok booking=${id}`)
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

    this.logger.debug(
      `list: event=${params.eventId ?? '-'} user=${params.userId ?? '-'} page=${page} limit=${limit}`
    )

    const { bookings } = this.uow.repos()
    const { items, total } = await bookings.findMany({
      eventId: params.eventId,
      userId: params.userId,
      skip,
      take: limit,
    })

    this.logger.debug(`list: ok total=${total}`)
    return { items, total, page, limit }
  }

  /** Отмена брони */
  async cancel(bookingId: number, userId: string): Promise<void> {
    this.logger.debug(`cancel: try booking=${bookingId} by=${userId}`)

    return this.uow.withTransaction(async ({ bookings }) => {
      const b = await bookings.findById(bookingId)
      if (!b) {
        this.logger.warn(`cancel: not found booking=${bookingId}`)
        throw new NotFoundException('Booking not found')
      }
      if (b.userId !== userId) {
        this.logger.warn(`cancel: forbidden booking=${bookingId} owner=${b.userId} by=${userId}`)
        throw new ForbiddenException('You can cancel only your own booking')
      }

      await bookings.delete(bookingId)
      this.logger.log(`cancel: ok booking=${bookingId} by=${userId}`)
    })
  }
}
