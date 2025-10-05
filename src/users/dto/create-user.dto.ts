import { Transform } from 'class-transformer'
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  password!: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  name?: string
}
