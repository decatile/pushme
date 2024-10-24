import {
  REDIS_URL,
  SERVER_HOST,
  SERVER_JWT_SECRET,
  SERVER_PORT,
} from "./config";
import { createClient, RedisClientType } from "redis";
import { createApp, withRoutes } from "./app";
import dataSource from "./db";
import { createTelegramService } from "./app/telegram/impl";
import { createUsersService } from "./app/users/impl";

(async () => {
  await dataSource.initialize();
  const redis = createClient({ url: REDIS_URL });
  await redis.connect();
  const app = createApp({
    logLevel: "debug",
    secret: SERVER_JWT_SECRET,
  });
  withRoutes<true>(app, {
    "/up": {},
    "/auth/accept-code": {
      telegram: createTelegramService(redis as RedisClientType, app.log),
      users: createUsersService(dataSource),
    },
  });
  await app.listen({ host: SERVER_HOST, port: SERVER_PORT });
})();
