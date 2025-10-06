import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { ThirdPartyJwtModule } from '../third-party/jwt/jwt.module'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'
import { AppLogger } from '../common/logger/app-logger.service'

@Module({
  imports: [ThirdPartyJwtModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, PrismaUnitOfWork, AppLogger],
  exports: [AuthService],
})
export class AuthModule {}
