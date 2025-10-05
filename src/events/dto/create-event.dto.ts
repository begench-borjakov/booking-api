import { Transform, Type } from 'class-transformer'
import { IsInt, IsPositive, IsString, MinLength, MaxLength, Max } from 'class-validator'

export class CreateEventDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(200) // например
  name!: string

  @Type(() => Number) // если не используешь enableImplicitConversion
  @IsInt()
  @IsPositive()
  @Max(100000) // опционально, разумный верхний предел
  total_seats!: number
}
