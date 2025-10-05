import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { ReserveBookingDto } from './dto/reserve-booking.dto'
import { toBookingResponse } from './mappers/booking.mapper'
import type { BookingResponse } from './rto/booking.response'
import { JwtAuthGuard } from '../third-party/jwt/jwt-auth.guard'
import { CurrentUserId } from '../third-party/decorator/current-user.decorator'

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('reserve')
  async reservePublic(@Body() dto: ReserveBookingDto) {
    const b = await this.bookingsService.reserve(dto.event_id, dto.user_id)
    return toBookingResponse(b)
  }
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<BookingResponse> {
    const b = await this.bookingsService.getById(id)
    return toBookingResponse(b)
  }

  @Get()
  async list(
    @Query('event_id') eventIdQ?: string,
    @Query('user_id') userId?: string,
    @Query('page') pageQ?: string,
    @Query('limit') limitQ?: string
  ): Promise<{ items: BookingResponse[]; total: number; page: number; limit: number }> {
    const eventId = eventIdQ ? Number(eventIdQ) : undefined
    const page = pageQ ? Number(pageQ) : 1
    const limit = limitQ ? Number(limitQ) : 20

    const { items, total } = await this.bookingsService.list({ eventId, userId, page, limit })
    return { items: items.map(toBookingResponse), total, page, limit }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: string
  ): Promise<{ status: 'ok' }> {
    await this.bookingsService.cancel(id, userId) // сервис проверит b.userId === userId
    return { status: 'ok' }
  }
}
