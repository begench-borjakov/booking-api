import { IsInt, IsPositive, IsString, MinLength } from 'class-validator'

export class CreateEventDto {
  @IsString()
  @MinLength(2)
  name!: string

  @IsInt()
  @IsPositive()
  total_seats!: number
}
