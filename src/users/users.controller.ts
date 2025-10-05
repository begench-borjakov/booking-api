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
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { toUserResponse } from './mappers/user.mapper'
import { UserResponse } from './rto/user.response'
import { JwtAuthGuard } from '../third-party/jwt/jwt-auth.guard'
import { OwnerGuard } from '../third-party/guards/owner.guard'

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponse> {
    const u = await this.usersService.create(dto.email, dto.password, dto.name)
    return toUserResponse(u)
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserResponse> {
    const u = await this.usersService.getById(id)
    return toUserResponse(u)
  }

  @Get()
  async list(
    @Query('search') search?: string,
    @Query('page') pageQ?: string,
    @Query('limit') limitQ?: string
  ): Promise<{ items: UserResponse[]; total: number; page: number; limit: number }> {
    const page = pageQ ? Number(pageQ) : 1
    const limit = limitQ ? Number(limitQ) : 20
    const { items, total } = await this.usersService.list({ search, page, limit })
    return { items: items.map(toUserResponse), total, page, limit }
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto
  ): Promise<UserResponse> {
    const u = await this.usersService.update(id, dto)
    return toUserResponse(u)
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ status: 'ok' }> {
    await this.usersService.delete(id)
    return { status: 'ok' }
  }
}
