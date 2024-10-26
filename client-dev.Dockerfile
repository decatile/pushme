# syntax=docker.io/docker/dockerfile:1.7-labs

FROM node:20-alpine

RUN corepack enable pnpm

# RUN addgroup app && adduser -S -G app app

WORKDIR /app

# COPY --exclude=./server --chown=app:app . .

COPY --exclude=./server . .

RUN pnpm install

WORKDIR /app/client

# USER app

EXPOSE 5173

CMD ["pnpm", "run", "dev"]
