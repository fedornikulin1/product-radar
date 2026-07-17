# Навигатор проектов

Каталог проектов Корпорации развития Республики Саха (Якутия) с публичной витриной, карточками проектов, страницами «О нас» и «Контакты», а также административной панелью.

## Обычный запуск для разработки

1. Установите Node.js 22 или новее.
2. Установите зависимости:

```bash
npm install
```

3. Скопируйте `.env.example` в `.env.local` и задайте значения:

```bash
ADMIN_PASSWORD=change-me
JWT_SECRET=replace-with-a-long-random-secret
BITRIX24_WEBHOOK_URL=https://your-portal.bitrix24.ru/rest/user-id/webhook-token/
BITRIX24_CATEGORY_ID=0
```

4. Запустите проект:

```bash
npm run dev
```

5. Откройте сайт:

```text
http://localhost:3000
```

## Запуск через Docker

Этот вариант нужен для деплоя на сервере без ручной установки Node.js и зависимостей.

### Через Docker Compose

1. Подготовьте `.env.local` рядом с `docker-compose.yml`.
2. Запустите:

```bash
docker compose up -d --build
```

3. Откройте:

```text
http://localhost:3000
```

Остановка:

```bash
docker compose down
```

### Через Docker без Compose

Собрать образ:

```bash
docker build -t product-radar .
```

Запустить контейнер:

```bash
docker run -d --name product-radar -p 3000:3000 --env-file .env.local product-radar
```

## Данные и загрузки

- Данные проектов хранятся в `data/projects.json`.
- Загруженные файлы сохраняются в `public/uploads`.
- В `docker-compose.yml` для них подключены отдельные volumes:
  - `product-radar-data`
  - `product-radar-uploads`

Это нужно, чтобы данные и загруженные файлы не пропали после перезапуска контейнера.

## Проверка

```bash
npm run lint
npm run build
```

## Битрикс24

Если задать `BITRIX24_WEBHOOK_URL` и `BITRIX24_CATEGORY_ID`, сайт сможет отправлять и импортировать проекты через API Битрикс24.
