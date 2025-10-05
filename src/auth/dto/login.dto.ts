import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(254)
  email!: string

  @ApiProperty({ example: 'Qwerty123' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^\S+$/)
  password!: string
}
