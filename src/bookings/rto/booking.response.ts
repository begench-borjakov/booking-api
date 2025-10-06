import { ApiProperty } from '@nestjs/swagger'

export class BookingResponse {
  @ApiProperty({ example: 42 })
  id!: number

  @ApiProperty({ example: 1 })
  event_id!: number

  @ApiProperty({ example: 'a3a6b2d0-9a7b-4e7b-9c1e-2a5d6e1c9f10', format: 'uuid' })
  user_id!: string

  @ApiProperty({ example: '2025-10-05T20:31:00.000Z', format: 'date-time' })
  created_at!: string
}
