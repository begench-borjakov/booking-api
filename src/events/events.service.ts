import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'
import { EventEntity } from '../database/events/event.entity'

@Injectable()
export class EventsService {
  constructor(private readonly uow: PrismaUnitOfWork) {}

  async create(name: string, total_seats: number): Promise<EventEntity> {
    return this.uow.withTransaction(async ({ events }) => {
      return events.create(name, total_seats)
    })
  }

  async getById(id: number): Promise<EventEntity> {
    const { events } = this.uow.repos()
    const e = await events.findById(id)
    if (!e) throw new NotFoundException('Event not found')
    return e
  }

  async list(params: {
    search?: string
    page?: number
    limit?: number
  }): Promise<{ items: EventEntity[]; total: number; page: number; limit: number }> {
    const page = params.page && params.page > 0 ? params.page : 1
    const limit = params.limit && params.limit > 0 && params.limit <= 100 ? params.limit : 20
    const skip = (page - 1) * limit

    const { events } = this.uow.repos()
    const { items, total } = await events.findMany({
      search: params.search,
      skip,
      take: limit,
    })
    return { items, total, page, limit }
  }

  async update(id: number, patch: { name?: string; total_seats?: number }): Promise<EventEntity> {
    return this.uow.withTransaction(async ({ events }) => {
      const existing = await events.findById(id)
      if (!existing) throw new NotFoundException('Event not found')
      return events.update(id, {
        name: patch.name,
        totalSeats: patch.total_seats,
      })
    })
  }

  async delete(id: number): Promise<void> {
    return this.uow.withTransaction(async ({ events }) => {
      const existing = await events.findById(id)
      if (!existing) throw new NotFoundException('Event not found')
      await events.delete(id)
    })
  }
}
