# Енот

Сайт разработчика: услуги, портфолио, информация о Next.js и документы для работы с клиентами. Публичный адрес — https://enotdev.su.

## Стек

Next.js 16, React 19, TypeScript, SCSS, Redux Toolkit, Prisma 7, PostgreSQL, Socket.IO и Web Push. Чат работает через отдельный сервер; административная панель доступна по `/admin/login`.

## Локальный запуск

Требуются Node.js 24 LTS, npm и Docker с Docker Compose либо установленный PostgreSQL.

1. Установите зависимости: `npm ci`.
2. Скопируйте `.env.example` в `.env.local` и задайте собственные пароли и секрет сессии. Для Prisma CLI задайте `DATABASE_URL` в окружении или локальном `.env`: Prisma конфигурация использует `dotenv/config`.
3. Запустите базу: `docker compose up -d postgres`.
4. Примените миграции: `npx prisma migrate deploy`.
5. Для push-уведомлений выполните `npm run push:setup` и установите свой `VAPID_SUBJECT`.
6. В отдельных терминалах запустите `npm run dev` и `npm run chat:dev`.

Сайт: http://localhost:3000. Сервер чата: http://localhost:3001.

Для запуска сервера чата в Docker: `docker compose up -d --build chat-server`.

## Настройки

- Контакты и описание сайта: `config.ts`.
- Основной SEO-домен: `NEXT_PUBLIC_SITE_URL` (по умолчанию https://enotdev.su).
- Яндекс Метрика: `NEXT_PUBLIC_YANDEX_METRIKA_ID` (по умолчанию 113568821). Пустое значение отключает счётчик. После изменения переменной пересоберите сайт.
- Публичный URL сервера чата: `NEXT_PUBLIC_CHAT_SOCKET_URL`.
- Разрешённый origin сайта для сервера чата: `CHAT_ALLOWED_ORIGIN`.
- Origin для серверных запросов: `APP_ORIGIN`.
- Дополнительные домены dev-сервера: `ALLOWED_DEV_ORIGINS`.

Файлы `.env` и `.env.local` не публикуются. Значения в `.env.example` предназначены для примера; в production используйте собственные секреты.

## Проверки и production

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

В production отдельно запустите `npm run chat:start`, примените миграции базы и настройте HTTPS и проксирование Socket.IO. Публичные переменные `NEXT_PUBLIC_*` задавайте перед сборкой.
