import { Transform } from 'class-transformer'
import { IsEmail, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class CreateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(254) // RFC-ограничение на email (практичное)
  email!: string

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^\S+$/, { message: 'password must not contain spaces' })
  // (опционально) минимальная сложность:
  // @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'password must contain letters and numbers' })
  password!: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string
}
