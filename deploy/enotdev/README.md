# Развёртывание enotdev.su

Все команды выполняются из корня проекта enot. Это независимый Compose-проект
enotdev: Next.js / Node.js 24, чат Socket.IO, PostgreSQL 16 и миграции Prisma.
Локальный compose.yaml остаётся без изменений и используется только для разработки.

## Подготовка сервера

Разместите этот проект, например, в /home/it/enot. Нужны Docker Compose v2
с поддержкой up --wait и работающий общий nginx из YouRemoteIT.
В YouRemoteIT один раз примените изменение nginx/nginx.conf:
include /var/www/certbot/nginx/enotdev/*.conf;
Пустой glob допустим. Если nginx.conf смонтирован отдельным файлом, копируйте
его через rsync --inplace, чтобы работающий контейнер видел новый файл.
После обновления проверьте docker exec nginx nginx -t.

Узнайте имя существующей сети nginx:

```bash
docker inspect nginx --format '{{range $name, $network := .NetworkSettings.Networks}}{{$name}}{{"\\n"}}{{end}}'
```

В текущей конфигурации nginx использует одну сеть. Её фактическое имя укажите
в ENOTDEV_PROXY_NETWORK. Не создавайте другую сеть с похожим именем.

## Настройки

```bash
cp deploy/enotdev/compose.env.example .env.enotdev
cp deploy/enotdev/app.env.example deploy/enotdev/app.env
chmod 600 .env.enotdev deploy/enotdev/app.env
openssl rand -hex 32
npm run push:keys
```

Замените все CHANGE_ME. Используйте разные случайные значения для пароля базы,
пароля администратора и CHAT_SESSION_SECRET. Пароль базы — в hex-формате,
поскольку он включается в DATABASE_URL. Публичную половину VAPID-пары запишите
в ENOTDEV_VAPID_PUBLIC_KEY, приватную — в VAPID_PRIVATE_KEY.

Секреты передаются только при запуске. Домен https://enotdev.su и URL чата
задаются при сборке и запуске. Dockerfile.dockerignore исключает локальные
.env, .env.local, generated, node_modules и .next из контекста сборки.
Настройки разработки и fallback enotgo.ru в исходниках не используются в production.

## Первый запуск

```bash
bash deploy/enotdev/deploy.sh
```

Скрипт собирает единый образ сайта/чата, запускает отдельную базу, ждёт готовности,
выполняет prisma migrate deploy и запускает приложение и чат.
Имя Compose-проекта enotdev и том enotdev_enotdev_postgres_data сохранены:
перенос конфигурации между папками не создаёт другую базу. Существующий том
YouRemoteIT postgres_data не используется. На хост новые порты не публикуются.

## Подключение HTTPS один раз

Направьте A-запись enotdev.su на сервер. Если есть AAAA, она также должна вести
на этот сервер. Конфигурация рассчитана на домен без www.
Из корня проекта enot на сервере:

```bash
sudo bash deploy/enotdev/nginx.sh http
sudo certbot certonly --webroot -w /var/www/certbot -d enotdev.su
sudo bash deploy/enotdev/nginx.sh https
```

Предполагается установленный certbot. Используется уже существующий mount
/var/www/certbot. Скрипт проверяет сертификат и nginx -t перед reload, при
ошибке восстанавливает прежний конфиг enotdev. Остальные блоки сайтов не меняются.
При обновлении приложения повторно включать HTTP не нужно.

Проверьте https://enotdev.su, /admin/login, чат и push-уведомления.
Проверьте продление сертификата: sudo certbot renew --dry-run.
В существующем deploy-hook certbot должна быть команда:

```bash
docker exec nginx nginx -t && docker exec nginx nginx -s reload
```

## Обновления из папки enot

Обновите код приложения на сервере и выполните:

```bash
cd /home/it/enot
bash deploy/enotdev/deploy.sh
```

YouRemoteIT при этих обновлениях не используется. Nginx разрешает адреса
контейнеров через Docker DNS, поэтому reload при обычном обновлении не нужен.
При пересоздании контейнеров только enotdev может кратковременно быть недоступен.
CPU, RAM и диск сервера общие для всех сайтов.

Для ручных команд используйте всегда:
docker compose -p enotdev --env-file .env.enotdev -f docker-compose.enotdev.yml
Не используйте down -v: это удалит данные enotdev. Перед обновлениями с миграциями
сделайте резервную копию базы. Workflow Deploy enotdev запускается вручную через
GitHub Actions → Run workflow на ветке main; workflow YouRemoteIT не управляет этим стеком.

## GitHub Actions

Repository secrets: SSH_HOST, SSH_USER, SSH_PORT, SSH_PRIVATE_KEY, SSH_KNOWN_HOSTS,
ENOTDEV_POSTGRES_PASSWORD, ENOTDEV_VAPID_PUBLIC_KEY, CHAT_ADMIN_PASSWORD,
CHAT_SESSION_SECRET, VAPID_PRIVATE_KEY.

Repository variables: DEPLOY_PATH=/home/it/enot,
ENOTDEV_PROXY_NETWORK=app_app-network, VAPID_SUBJECT=mailto:ваш-email.
Пароль PostgreSQL должен быть hex, остальные значения env — без пробелов,
кавычек и символов интерполяции. Используйте сгенерированные hex-секреты и VAPID-пару.

SSH_KNOWN_HOSTS получите через уже проверенное SSH-подключение на сервере:

```bash
printf '45.67.59.159 '; cat /etc/ssh/ssh_host_ed25519_key.pub
```

Workflow создаёт env-файлы на runner, передаёт их отдельно с правами 600 и
запускает deploy.sh. Первый запуск не выпускает сертификат и не меняет nginx:
после успешного деплоя выполните команды из раздела HTTPS выше.
