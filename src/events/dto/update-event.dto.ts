import { Transform, Type } from 'class-transformer'
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator'

export class UpdateEventDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  total_seats?: number
}
