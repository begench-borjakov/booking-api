import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, PrismaUnitOfWork],
  exports: [UsersService],
})
export class UsersModule {}
