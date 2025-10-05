import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { PrismaEventsRepository } from '../repositories/events.repository'
import { PrismaBookingsRepository } from '../repositories/bookings.repository'

export interface UnitOfWorkContext {
  events: PrismaEventsRepository
  bookings: PrismaBookingsRepository
}

@Injectable()
export class PrismaUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async withTransaction<T>(fn: (ctx: UnitOfWorkContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ctx: UnitOfWorkContext = {
        events: new PrismaEventsRepository(tx),
        bookings: new PrismaBookingsRepository(tx),
      }
      return fn(ctx)
    })
  }
}
