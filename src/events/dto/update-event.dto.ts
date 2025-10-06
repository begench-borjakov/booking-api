import { Transform, Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsPositive, IsString, MinLength, MaxLength } from 'class-validator'

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'NodeConf 2025', minLength: 2, maxLength: 200 })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value))
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string

  @ApiPropertyOptional({ example: 300, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  total_seats?: number
}
