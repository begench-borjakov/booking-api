import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'
import type { EventEntity } from '../database/events/event.entity'
import { AppLogger } from '../common/logger/app-logger.service'

@Injectable()
export class EventsService {
  constructor(
    private readonly uow: PrismaUnitOfWork,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext?.(EventsService.name)
  }

  async create(name: string, total_seats: number): Promise<EventEntity> {
    this.logger.debug(`create: try name="${name}" seats=${total_seats}`)
    const event = await this.uow.withTransaction(({ events }) => events.create(name, total_seats))
    this.logger.log(`create: ok event=${event.id}`)
    return event
  }

  async getById(id: number): Promise<EventEntity> {
    this.logger.debug(`getById: ${id}`)
    const { events } = this.uow.repos()
    const event = await events.findById(id)
    if (!event) {
      this.logger.warn(`getById: not found event=${id}`)
      throw new NotFoundException('Event not found')
    }
    this.logger.debug(`getById: ok event=${id}`)
    return event
  }

  async list(params: {
    search?: string
    page?: number
    limit?: number
  }): Promise<{ items: EventEntity[]; total: number; page: number; limit: number }> {
    const page = params.page && params.page > 0 ? params.page : 1
    const limit = params.limit && params.limit > 0 && params.limit <= 100 ? params.limit : 20
    const skip = (page - 1) * limit

    this.logger.debug(`list: search=${params.search ?? '-'} page=${page} limit=${limit}`)

    const { events } = this.uow.repos()
    const { items, total } = await events.findMany({
      search: params.search,
      skip,
      take: limit,
    })

    this.logger.debug(`list: ok total=${total}`)
    return { items, total, page, limit }
  }

  async update(id: number, patch: { name?: string; total_seats?: number }): Promise<EventEntity> {
    this.logger.debug(`update: try event=${id}`)
    return this.uow.withTransaction(async ({ events }) => {
      const existing = await events.findById(id)
      if (!existing) {
        this.logger.warn(`update: not found event=${id}`)
        throw new NotFoundException('Event not found')
      }
      const event = await events.update(id, { name: patch.name, totalSeats: patch.total_seats })
      this.logger.log(`update: ok event=${id}`)
      return event
    })
  }

  async delete(id: number): Promise<void> {
    this.logger.debug(`delete: try event=${id}`)
    return this.uow.withTransaction(async ({ events }) => {
      const existing = await events.findById(id)
      if (!existing) {
        this.logger.warn(`delete: not found event=${id}`)
        throw new NotFoundException('Event not found')
      }
      await events.delete(id)
      this.logger.log(`delete: ok event=${id}`)
    })
  }
}
