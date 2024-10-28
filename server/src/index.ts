import {
  IS_PRODUCTION,
  REDIS_URL,
  SERVER_HOST,
  SERVER_JWT_SECRET,
  SERVER_COOKIE_SECRET,
  SERVER_PORT,
} from "./config";
import { createClient, RedisClientType } from "redis";
import { createApp, appWithRoutes } from "./app";
import dataSource from "./db";
import { createTelegramService } from "./app/telegram/impl";
import { createUsersService } from "./app/users/impl";

(async () => {
  await dataSource.initialize();
  const redis = createClient({ url: REDIS_URL });
  await redis.connect();
  const app = await createApp({
    logLevel: "debug",
    jwtSecret: SERVER_JWT_SECRET,
    cookieSecret: SERVER_COOKIE_SECRET,
    isProduction: IS_PRODUCTION,
  });
  appWithRoutes<true>(app, {
    "/up": {},
    "/auth/accept-code": {
      telegram: createTelegramService(redis as RedisClientType, app.log),
      users: createUsersService(dataSource),
    },
  });
  await app.listen({ host: SERVER_HOST, port: SERVER_PORT });
})();
