import {
  IS_PRODUCTION,
  REDIS_URL,
  SERVER_HOST,
  SERVER_JWT_SECRET,
  SERVER_COOKIE_SECRET,
  SERVER_PORT,
  SERVER_ALLOW_ORIGINS,
} from "./config";
import { createClient, RedisClientType } from "redis";
import { createApp, appWithRoutes } from "./app";
import dataSource from "./db";
import { createTelegramService } from "./app/telegram/impl";
import { createUsersService } from "./app/users/impl";
import { createRefreshTokenService } from "./app/refresh-token/impl";
import { createNotificationService } from "./app/notifications/impl";

(async () => {
  await dataSource.initialize();
  const redis = createClient({ url: REDIS_URL });
  await redis.connect();
  const app = await createApp({
    logLevel: "debug",
    jwtSecret: SERVER_JWT_SECRET,
    cookieSecret: SERVER_COOKIE_SECRET,
    origins: SERVER_ALLOW_ORIGINS,
    isProduction: IS_PRODUCTION,
  });
  const telegramService = createTelegramService(
    redis as RedisClientType,
    app.log
  );
  const usersService = createUsersService(dataSource);
  const refreshTokenService = createRefreshTokenService(dataSource, {
    expiresIn: 1000 * 60 * 60 * 24 * 30,
  });
  const notificationService = createNotificationService(dataSource);
  appWithRoutes<true>(app, {
    "/up": {},
    "/auth/refresh": {
      refreshTokenService,
    },
    "/auth/refresh/logout": {
      refreshTokenService,
    },
    "/auth/accept-code": {
      refreshTokenService,
      telegramService,
      usersService,
    },
    "/notification/new": {
      notificationService,
    },
    "/notification/edit": {
      notificationService,
    },
    "/notification/all": {
      notificationService,
    },
    "/notification/sse": {
      notificationService,
    },
  });
  await app.listen({ host: SERVER_HOST, port: SERVER_PORT });
})();
