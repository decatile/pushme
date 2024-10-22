# syntax=docker.io/docker/dockerfile:1.7-labs

FROM node:alpine

RUN corepack enable && adduser -DH app app

WORKDIR /app

COPY --chown=app:app --exclude=client . .

RUN pnpm install

WORKDIR /app/server

RUN pnpm build

USER app

CMD [ "node", "out/index.js" ]
