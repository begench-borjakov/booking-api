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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger'
import { EventsService } from './events.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { toEventResponse } from './mappers/event.mapper'
import { EventResponse } from './rto/event.response'

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({ summary: 'Create event' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({ status: 201, type: EventResponse })
  @Post()
  async create(@Body() dto: CreateEventDto): Promise<EventResponse> {
    const event = await this.eventsService.create(dto.name, dto.total_seats)
    return toEventResponse(event)
  }

  @ApiOperation({ summary: 'Get event by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: EventResponse })
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<EventResponse> {
    const event = await this.eventsService.getById(id)
    return toEventResponse(event)
  }

  @ApiOperation({ summary: 'List events' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { $ref: getSchemaPath(EventResponse) } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
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

  @ApiOperation({ summary: 'Update event' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({ status: 200, type: EventResponse })
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

  @ApiOperation({ summary: 'Delete event' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ status: 'ok' }> {
    await this.eventsService.delete(id)
    return { status: 'ok' }
  }
}
