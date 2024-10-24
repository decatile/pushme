import {
  REDIS_URL,
  SERVER_HOST,
  SERVER_JWT_SECRET,
  SERVER_PORT,
} from "./config";
import { createClient, RedisClientType } from "redis";
import { createApp } from "./app";
import dataSource from "./db";
import { createTelegramService } from "./app/telegram/impl";
import { createUsersService } from "./app/users/impl";

(async () => {
  await dataSource.initialize();
  const redis = createClient({ url: REDIS_URL });
  await redis.connect();
  const telegramService = createTelegramService(redis as RedisClientType);
  const usersService = createUsersService(dataSource);
  await createApp(
    {
      "/up": {},
      "/auth/accept-code": {
        telegram: telegramService,
        users: usersService,
      },
    },
    {
      logLevel: "debug",
      secret: SERVER_JWT_SECRET,
    }
  ).listen({
    host: SERVER_HOST,
    port: SERVER_PORT,
  });
})();
