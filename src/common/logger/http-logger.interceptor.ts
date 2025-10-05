import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import type { Request, Response } from 'express'
import { Observable } from 'rxjs'
import { finalize } from 'rxjs/operators'
import { AppLogger } from './app-logger.service'

type JwtUser = { sub: string; email: string }
type AuthedRequest = Request & { user?: JwtUser }

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext?.('HTTP')
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle()

    const http = context.switchToHttp()
    const req = http.getRequest<AuthedRequest>()
    const res = http.getResponse<Response>()

    const start = Date.now()
    const method = req.method
    const url = req.originalUrl
    const user = req.user?.sub ?? '-'

    const ip = (() => {
      const xfwd = req.headers['x-forwarded-for']
      if (Array.isArray(xfwd)) return xfwd[0] ?? ''
      if (typeof xfwd === 'string') return xfwd.split(',')[0]?.trim() ?? ''
      return req.ip || req.socket.remoteAddress || ''
    })()

    return next.handle().pipe(
      finalize(() => {
        const status = res.statusCode
        const durationMs = Date.now() - start
        this.logger.log(
          `[${method}] ${url} ${status} ${durationMs}ms user=${user} ip=${ip}`,
          'HTTP'
        )
      })
    )
  }
}
