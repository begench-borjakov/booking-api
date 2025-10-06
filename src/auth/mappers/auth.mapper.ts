import type { MeResponse } from '../rto/me.response'
import type { TokenResponse } from '../rto/token.response'
import type { UserEntity } from '../../database/users/user.entity'

export const toTokenResponse = (accessToken: string): TokenResponse => ({
  access_token: accessToken,
})

export const toMeResponse = (
  u: UserEntity | { id: string; email: string; name?: string; createdAt?: Date; updatedAt?: Date }
): MeResponse => ({
  id: u.id,
  email: u.email,
  name: u.name,
})
