import { ConsoleLogger, Injectable } from '@nestjs/common'

@Injectable()
export class AppLogger extends ConsoleLogger {
  protected context?: string
  constructor(context?: string) {
    super(context ?? 'AppLogger')
    this.context = context
  }
  setContext(context: string) {
    this.context = context
  }
  log(message: string, context?: string) {
    super.log(message, context || this.context)
  }
  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context || this.context)
  }
  warn(message: string, context?: string) {
    super.warn(message, context || this.context)
  }
  debug(message: string, context?: string) {
    super.debug(message, context || this.context)
  }
}
