import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import type { JwtPayload } from '../../third-party/jwt/jwt.payload'

type AuthedRequest = Request & { user?: JwtPayload }

export const CurrentUser = createParamDecorator((_, ctx: ExecutionContext): JwtPayload => {
  const req = ctx.switchToHttp().getRequest<AuthedRequest>()
  if (!req.user) throw new UnauthorizedException('Missing authenticated user')
  return req.user
})

export const CurrentUserId = createParamDecorator((_, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<AuthedRequest>()
  if (!req.user?.sub) throw new UnauthorizedException('Missing authenticated user')
  return req.user.sub
})
