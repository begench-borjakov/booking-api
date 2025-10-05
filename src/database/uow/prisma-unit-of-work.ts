import { Injectable } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { PrismaEventsRepository } from '../events/events.repository'
import { PrismaBookingsRepository } from '../bookings/bookings.repository'
import { PrismaUsersRepository } from '../users/users.repository'

export interface UnitOfWorkContext {
  events: PrismaEventsRepository
  bookings: PrismaBookingsRepository
  users: PrismaUsersRepository
}

@Injectable()
export class PrismaUnitOfWork {
  // Важно: PrismaService должен наследоваться от PrismaClient
  constructor(private readonly prisma: PrismaService) {}

  async withTransaction<T>(fn: (ctx: UnitOfWorkContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ctx: UnitOfWorkContext = {
        events: new PrismaEventsRepository(tx),
        bookings: new PrismaBookingsRepository(tx),
        users: new PrismaUsersRepository(tx),
      }
      return fn(ctx)
    })
  }

  // Alias, чтобы можно было писать uow.run(...)
  run<T>(fn: (ctx: UnitOfWorkContext) => Promise<T>): Promise<T> {
    return this.withTransaction(fn)
  }

  // Для простых чтений без транзакции
  repos(): UnitOfWorkContext {
    return {
      events: new PrismaEventsRepository(this.prisma),
      bookings: new PrismaBookingsRepository(this.prisma),
      users: new PrismaUsersRepository(this.prisma),
    }
  }
}
