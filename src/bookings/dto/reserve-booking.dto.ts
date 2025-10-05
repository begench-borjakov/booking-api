import { Type, Transform } from 'class-transformer'
import { IsInt, IsPositive, IsUUID } from 'class-validator'

export class ReserveBookingDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  event_id!: number

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUUID('4', { message: 'user_id must be a valid UUID v4' })
  user_id!: string
}
