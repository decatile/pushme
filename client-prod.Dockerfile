# syntax=docker.io/docker/dockerfile:1.7-labs

# Этап 1: Сборка приложения
FROM node:20-alpine AS build

# Включаем Corepack для управления пакетами
RUN corepack enable

# Настройка пользователя и рабочей директории
RUN addgroup app && adduser -S -G app app
USER root
WORKDIR /app

# Копируем файлы и устанавливаем зависимости
COPY client/package*.json client/pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

# Копируем остальные файлы и собираем проект
COPY client/ ./
RUN pnpm build

# Этап 2: Финальный образ с Nginx
FROM nginx:alpine

# Копируем собранные статические файлы из этапа сборки
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем кастомный конфиг Nginx, если необходимо
COPY nginx.conf /etc/nginx/nginx.conf

# Указываем рабочий порт и команду запуска
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
