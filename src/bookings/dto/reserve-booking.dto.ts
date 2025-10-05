import { IsInt, IsString, IsNotEmpty, MaxLength, Min, Matches } from 'class-validator'
import { Transform, Type } from 'class-transformer'

export class ReserveBookingDto {
  // Преобразуем строку "1" -> 1 и валидируем как целое >= 1
  @Type(() => Number)
  @IsInt()
  @Min(1)
  event_id!: number

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  @Matches(/^[A-Za-z0-9_.:@\-]+$/u, {
    message: 'user_id may only contain letters, numbers, "_", ".", ":", "@", and "-"',
  })
  user_id!: string
}
