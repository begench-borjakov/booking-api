import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Global() // чтобы можно было инжектить PrismaService без явного импорта модуля
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
