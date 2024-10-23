# syntax=docker.io/docker/dockerfile:1.7-labs

FROM node:alpine AS builder

RUN corepack enable pnpm && adduser -DH app app

WORKDIR /app

COPY --exclude=client --chown=app:app . .

RUN pnpm install

WORKDIR /app/server

RUN pnpm build

USER app

CMD [ "node", "out/index.js" ]
