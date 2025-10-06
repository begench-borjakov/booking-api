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

      const booking = await bookings.create(eventId, userId)
      this.logger.log(`reserve: ok booking=${booking.id} event=${eventId} user=${userId}`)
      return booking
    })
  }

  async getById(id: number): Promise<BookingEntity> {
    this.logger.debug(`getById: try booking=${id}`)
    const { bookings } = this.uow.repos()
    const booking = await bookings.findById(id)
    if (!booking) {
      this.logger.warn(`getById: not found booking=${id}`)
      throw new NotFoundException('Booking not found')
    }
    this.logger.debug(`getById: ok booking=${id}`)
    return booking
  }

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

  async cancel(bookingId: number, userId: string): Promise<void> {
    this.logger.debug(`cancel: try booking=${bookingId} by=${userId}`)

    return this.uow.withTransaction(async ({ bookings }) => {
      const booking = await bookings.findById(bookingId)
      if (!booking) {
        this.logger.warn(`cancel: not found booking=${bookingId}`)
        throw new NotFoundException('Booking not found')
      }
      if (booking.userId !== userId) {
        this.logger.warn(
          `cancel: forbidden booking=${bookingId} owner=${booking.userId} by=${userId}`
        )
        throw new ForbiddenException('You can cancel only your own booking')
      }

      await bookings.delete(bookingId)
      this.logger.log(`cancel: ok booking=${bookingId} by=${userId}`)
    })
  }
}
