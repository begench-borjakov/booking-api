Booking API (NestJS + Prisma + PostgreSQL)

API для бронирования мест на события.
Покрывает требования тестового задания: публичная бронь, защита от двойного бронирования, CRUD для пользователей и событий, JWT-аутентификация, Swagger-документация.

Стек :

NestJS (Controllers/Services/Guards/Interceptors)

Prisma ORM + PostgreSQL

JWT (Passport Strategy, Guard)

class-validator / class-transformer

Swagger UI (/docs)

Логирование: AppLogger + HTTP Interceptor

Быстрый старт

1. Подготовить окружение

# пример .env

DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
PORT=
SWAGGER_ENABLED=

2. Установить зависимости
   npm i

3. Prisma: клиент и миграции

Схема лежит в src/database/prisma/schema.prisma

npx prisma generate --schema "src/database/prisma/schema.prisma"
npx prisma migrate dev --schema "src/database/prisma/schema.prisma" -n init

4. Запустить приложение
   npm run start:dev

# или

npm run start

API: http://localhost:3000

Swagger: http://localhost:3000/docs

Основные сущности и ограничения

Event { id, name, total_seats }

Booking { id, eventId, userId, createdAt }

User { id(uuid), email, passwordHash, name }

Ограничение: один пользователь не может забронировать одно событие дважды
Реализовано на уровне БД (@@unique([eventId,userId])) и логики сервиса.

Архитектурные принципы

Сервисы не знают про БД — доступ к данным через репозитории + Unit of Work.

Строгая типизация — без any и as.

Валидация DTO (class-validator) + трим/каст типов (class-transformer).

Логи — HTTP интерсептор + логи в сервисах.

Ошибки — осмысленные HTTP-коды (400/401/403/404/409) и понятные сообщения.

Полезные скрипты

{
"scripts": {
"start": "nest start",
"start:dev": "nest start --watch",
"prisma:generate": "prisma generate --schema src/database/prisma/schema.prisma",
"prisma:migrate": "prisma migrate dev --schema src/database/prisma/schema.prisma"
}
}

Заметки по защите

Приватные ручки помечены @UseGuards(JwtAuthGuard).

Изменение/удаление пользователя — через OwnerGuard (доступ только себе).

Публичный POST /api/bookings/reserve сохранён, как в ТЗ.

Swagger

UI: GET /docs

JSON: GET /docs/json

Нажми Authorize и вставь Bearer <JWT>.
