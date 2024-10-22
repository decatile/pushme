# syntax=docker.io/docker/dockerfile:1.7-labs

FROM node:latest

RUN corepack enable

WORKDIR /app

COPY --exclude=./client . .

RUN pnpm install

WORKDIR /app/server

RUN pnpm build

CMD [ "node", "out/index.js" ]
