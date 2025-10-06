import { Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', maxLength: 100 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value))
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ example: 'Qwerty123', minLength: 8, maxLength: 128 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^\S+$/, { message: 'password must not contain spaces' })
  password?: string
}
