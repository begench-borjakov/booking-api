import { IsInt, IsOptional, IsPositive, IsString, MinLength } from 'class-validator'

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string

  @IsOptional()
  @IsInt()
  @IsPositive()
  total_seats?: number
}
