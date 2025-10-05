import { Module } from '@nestjs/common'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'

@Module({
  controllers: [EventsController],
  providers: [EventsService, PrismaService, PrismaUnitOfWork],
  exports: [EventsService],
})
export class EventsModule {}
