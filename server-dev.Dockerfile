# syntax=docker.io/docker/dockerfile:1.7-labs

FROM node:alpine AS builder

RUN corepack enable pnpm && adduser -DH app app

WORKDIR /app

COPY --chown=app:app server .

RUN pnpm install

RUN pnpm build

USER app

CMD [ "node", "out/index.js" ]
