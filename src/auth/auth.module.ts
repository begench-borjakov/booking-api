import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { ThirdPartyJwtModule } from '../third-party/jwt/jwt.module'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaUnitOfWork } from '../database/uow/prisma-unit-of-work'

@Module({
  imports: [
    ThirdPartyJwtModule, // даёт JwtService и регистрирует JwtStrategy
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, PrismaUnitOfWork],
  exports: [AuthService],
})
export class AuthModule {}
