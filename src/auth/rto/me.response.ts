import { ApiProperty } from '@nestjs/swagger'
export class MeResponse {
  @ApiProperty({ example: 'a3a6b2d0-9a7b-4e7b-9c1e-2a5d6e1c9f10' })
  id!: string
  @ApiProperty({ example: 'user@example.com' })
  email!: string
  @ApiProperty({ example: 'John Doe', required: false })
  name?: string
}
