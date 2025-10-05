import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  BadRequestException,
} from '@nestjs/common'
import { EventsService } from './events.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { toEventResponse } from './mappers/event.mapper'
import { EventResponse } from './rto/event.response'

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() dto: CreateEventDto): Promise<EventResponse> {
    const e = await this.eventsService.create(dto.name, dto.total_seats)
    return toEventResponse(e)
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<EventResponse> {
    const e = await this.eventsService.getById(id)
    return toEventResponse(e)
  }

  @Get()
  async list(
    @Query('search') search?: string,
    @Query('page') pageQ?: string,
    @Query('limit') limitQ?: string
  ): Promise<{ items: EventResponse[]; total: number; page: number; limit: number }> {
    const page = Number(pageQ)
    const limit = Number(limitQ)

    const safePage = Number.isFinite(page) && page > 0 ? page : 1
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20

    const { items, total } = await this.eventsService.list({
      search: search?.trim() || undefined,
      page: safePage,
      limit: safeLimit,
    })
    return { items: items.map(toEventResponse), total, page: safePage, limit: safeLimit }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto
  ): Promise<EventResponse> {
    if (dto.name === undefined && dto.total_seats === undefined) {
      throw new BadRequestException('Nothing to update')
    }
    const e = await this.eventsService.update(id, dto)
    return toEventResponse(e)
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ status: 'ok' }> {
    await this.eventsService.delete(id)
    return { status: 'ok' }
  }
}
