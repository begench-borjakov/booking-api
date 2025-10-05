import { Module } from '@nestjs/common'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'
import { AppLogger } from '../common/logger/app-logger.service'

@Module({
  controllers: [EventsController],
  providers: [EventsService, PrismaService, PrismaUnitOfWork, AppLogger],
  exports: [EventsService],
})
export class EventsModule {}
