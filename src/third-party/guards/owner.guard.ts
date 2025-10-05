import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import type { Request } from 'express'
import type { JwtPayload } from '../../third-party/jwt/jwt.payload'

type AuthedRequest = Request & { user?: JwtPayload; params: { id?: string } }

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>()
    const userSub = req.user?.sub
    const paramId = req.params?.id
    if (!userSub || !paramId)
      throw new ForbiddenException('Missing authentication or resource identifier')
    if (String(userSub) !== String(paramId))
      throw new ForbiddenException('You can only access your own data')
    return true
  }
}
