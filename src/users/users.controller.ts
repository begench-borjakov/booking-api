import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
  getSchemaPath,
} from '@nestjs/swagger'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { toUserResponse } from './mappers/user.mapper'
import { UserResponse } from './rto/user.response'
import { JwtAuthGuard } from '../third-party/jwt/jwt-auth.guard'
import { OwnerGuard } from '../third-party/guards/owner.guard'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create user (protected)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: UserResponse })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponse> {
    const u = await this.usersService.create(dto.email, dto.password, dto.name)
    return toUserResponse(u)
  }

  @ApiOperation({ summary: 'Get user by id (protected)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: UserResponse })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserResponse> {
    const u = await this.usersService.getById(id)
    return toUserResponse(u)
  }

  @ApiOperation({ summary: 'List users (protected)' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { $ref: getSchemaPath(UserResponse) } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(
    @Query('search') search?: string,
    @Query('page') pageQ?: string,
    @Query('limit') limitQ?: string
  ): Promise<{ items: UserResponse[]; total: number; page: number; limit: number }> {
    const p = Number(pageQ)

    const l = Number(limitQ)

    const page = Number.isFinite(p) && p > 0 ? p : 1

    const limit = Number.isFinite(l) && l > 0 ? Math.min(l, 100) : 20

    const { items, total } = await this.usersService.list({ search, page, limit })
    return { items: items.map(toUserResponse), total, page, limit }
  }

  @ApiOperation({ summary: 'Update own user' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: UserResponse })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto
  ): Promise<UserResponse> {
    const u = await this.usersService.update(id, dto)
    return toUserResponse(u)
  }

  @ApiOperation({ summary: 'Delete own user' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ status: 'ok' }> {
    await this.usersService.delete(id)
    return { status: 'ok' }
  }
}
