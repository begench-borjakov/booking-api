export interface UserEntity {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

/** Для auth-потоков: когда нужен доступ к хешу пароля */
export interface UserWithPassword extends UserEntity {
  passwordHash: string
}
