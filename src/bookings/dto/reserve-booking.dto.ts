import { Type, Transform } from 'class-transformer'
import { IsInt, IsPositive, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ReserveBookingDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  event_id!: number

  @ApiProperty({ example: 'a3a6b2d0-9a7b-4e7b-9c1e-2a5d6e1c9f10', description: 'User UUID v4' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsUUID('4', { message: 'user_id must be a valid UUID v4' })
  user_id!: string
}
