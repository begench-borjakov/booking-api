import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 254 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(254)
  email!: string

  @ApiProperty({ example: 'Qwerty123', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^\S+$/, { message: 'password must not contain spaces' })
  password!: string

  @ApiProperty({ example: 'John Doe', maxLength: 100, required: false })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string
}
