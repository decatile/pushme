# syntax=docker.io/docker/dockerfile:1.7-labs

FROM node:20-alpine

RUN corepack enable pnpm

# RUN addgroup app && adduser -S -G app app

WORKDIR /app

# COPY --exclude=./server --chown=app:app . .

COPY client .

RUN pnpm install

# USER app

EXPOSE 5173

CMD ["pnpm", "run", "dev"]
