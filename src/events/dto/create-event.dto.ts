import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsPositive, IsString, MinLength, MaxLength, Max } from 'class-validator'

export class CreateEventDto {
  @ApiProperty({ example: 'NodeConf 2025', minLength: 2, maxLength: 200 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value))
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string

  @ApiProperty({ example: 250, minimum: 1, maximum: 100000 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100000)
  total_seats!: number
}
