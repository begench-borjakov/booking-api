import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HttpLoggerInterceptor } from './common/logger/http-logger.interceptor'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  )

  // глобальный HTTP-логгер (интерцептор должен быть в providers AppModule)
  app.useGlobalInterceptors(app.get(HttpLoggerInterceptor))

  // корректное завершение (нужно для PrismaService.onModuleDestroy)
  app.enableShutdownHooks()

  const config = new DocumentBuilder()
    .setTitle('Booking API')
    .setDescription('Система бронирования мест')
    .setVersion('1.0.0')
    .addBearerAuth() // JWT в Authorization: Bearer <token>
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/json',
  })

  const port = Number(process.env.PORT) || 3000
  await app.listen(port)
  const url = await app.getUrl()
  Logger.log(`🚀 Server is running on ${url}`, 'Bootstrap')
}
bootstrap()
