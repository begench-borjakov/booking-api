import { UserEntity } from '../../database/users/user.entity'
import { UserResponse } from '../rto/user.response'

export const toUserResponse = (u: UserEntity): UserResponse => ({
  id: u.id,
  email: u.email,
  name: u.name,
  created_at: u.createdAt.toISOString(),
  updated_at: u.updatedAt.toISOString(),
})

export const toUsersResponse = (arr: UserEntity[]): UserResponse[] => arr.map(toUserResponse)
