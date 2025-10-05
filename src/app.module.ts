import { Module } from '@nestjs/common'
import { AppLogger } from './common/logger/app-logger.service'
import { HttpLoggerInterceptor } from './common/logger/http-logger.interceptor'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { EventsModule } from './events/events.module'
import { BookingsModule } from './bookings/bookings.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [AuthModule, UsersModule, EventsModule, BookingsModule, PrismaModule],
  providers: [AppLogger, HttpLoggerInterceptor],
})
export class AppModule {}
