import { ApiProperty } from '@nestjs/swagger'

export class UserResponse {
  @ApiProperty({ example: 'a3a6b2d0-9a7b-4e7b-9c1e-2a5d6e1c9f10', format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'user@example.com' })
  email!: string

  @ApiProperty({ example: 'John Doe', required: false })
  name?: string

  @ApiProperty({ example: '2025-10-05T20:31:00.000Z', format: 'date-time' })
  created_at!: string

  @ApiProperty({ example: '2025-10-05T20:42:15.000Z', format: 'date-time' })
  updated_at!: string
}
