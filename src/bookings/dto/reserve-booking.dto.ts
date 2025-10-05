import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ReserveBookingDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  event_id!: number

  @IsUUID('4')
  @IsNotEmpty()
  user_id!: string
}
