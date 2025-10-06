export interface UserEntity {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserWithPassword extends UserEntity {
  passwordHash: string
}
