// src/main.ts
import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {})

  // Валидация DTO + авто-трансформация типов (string -> number и т.д.)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // отбрасывает неизвестные поля
      forbidNonWhitelisted: true, // 400, если пришли лишние поля
      transform: true, // включает class-transformer
      transformOptions: {
        enableImplicitConversion: true, // позволяет преобразование типов без @Type()
      },
    })
  )

  const portEnv = process.env.PORT
  const port = portEnv ? Number(portEnv) : 3000

  await app.listen(port)
  const url = await app.getUrl()
  Logger.log(`🚀 Server is running on ${url}`, 'Bootstrap')
}

bootstrap()
