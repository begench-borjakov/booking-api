import { Transform } from 'class-transformer'
import { IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string
}
