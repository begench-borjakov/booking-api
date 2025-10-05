import { Module } from '@nestjs/common'
import { BookingsController } from './bookings.controller'
import { BookingsService } from './bookings.service'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService, PrismaUnitOfWork],
  exports: [BookingsService],
})
export class BookingsModule {}
