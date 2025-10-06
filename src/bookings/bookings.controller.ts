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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { BookingsService } from './bookings.service'
import { ReserveBookingDto } from './dto/reserve-booking.dto'
import { toBookingResponse } from './mappers/booking.mapper'
import { BookingResponse } from './rto/booking.response'
import { JwtAuthGuard } from '../third-party/jwt/jwt-auth.guard'
import { CurrentUserId } from '../third-party/decorator/current-user.decorator'

@ApiTags('Bookings')
@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiOperation({ summary: 'Reserve a seat (public, per test task)' })
  @ApiBody({ type: ReserveBookingDto })
  @ApiResponse({ status: 201, description: 'Created', type: BookingResponse })
  @Post('reserve')
  async reservePublic(@Body() dto: ReserveBookingDto): Promise<BookingResponse> {
    const b = await this.bookingsService.reserve(dto.event_id, dto.user_id)
    return toBookingResponse(b)
  }

  @ApiOperation({ summary: 'Get booking by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: BookingResponse })
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<BookingResponse> {
    const b = await this.bookingsService.getById(id)
    return toBookingResponse(b)
  }

  @ApiOperation({ summary: 'List bookings' })
  @ApiQuery({ name: 'event_id', required: false, type: Number })
  @ApiQuery({ name: 'user_id', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        items: { type: 'array', items: { $ref: '#/components/schemas/BookingResponse' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @Get()
  async list(
    @Query('event_id') eventIdQ?: string,
    @Query('user_id') userId?: string,
    @Query('page') pageQ?: string,
    @Query('limit') limitQ?: string
  ): Promise<{ items: BookingResponse[]; total: number; page: number; limit: number }> {
    const eventId = eventIdQ ? Number(eventIdQ) : undefined
    const pageNum = Number(pageQ)
    const limitNum = Number(limitQ)
    const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1
    const limit = Number.isFinite(limitNum) && limitNum > 0 ? Math.min(limitNum, 100) : 20

    const { items, total } = await this.bookingsService.list({ eventId, userId, page, limit })
    return { items: items.map(toBookingResponse), total, page, limit }
  }

  @ApiOperation({ summary: 'Cancel own booking' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Cancelled' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: string
  ): Promise<{ status: 'ok' }> {
    await this.bookingsService.cancel(id, userId)
    return { status: 'ok' }
  }
}
