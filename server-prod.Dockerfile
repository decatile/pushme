# syntax=docker.io/docker/dockerfile:1.7-labs

FROM node:alpine AS builder

RUN corepack enable pnpm

WORKDIR /build

COPY server .

RUN pnpm install

RUN pnpm build

RUN pnpm test

FROM node:alpine

WORKDIR /app

RUN corepack enable pnpm && adduser -DH app app

COPY --from=builder --chown=app:app /build/server/package.json package.json

RUN pnpm install --production

COPY --from=builder --chown=app:app /build/server/out out

CMD [ "node", "out/index.js" ]
