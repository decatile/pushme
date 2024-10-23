import { REDIS_URL, SERVER_HOST, SERVER_PORT } from "./config";
import { createApp } from "./app";
import dataSource from "./db";
import { createClient, RedisClientType } from "redis";
import { connectToTelegram as startTelegram } from "./app/telegram";

(async () => {
  await dataSource.initialize();

  const redis = createClient({ url: REDIS_URL });
  await redis.connect();

  const telegramService = startTelegram(redis as RedisClientType);

  await createApp({
    "/auth/accept-code": {
      telegram: telegramService,
    },
  }).listen({
    host: SERVER_HOST,
    port: SERVER_PORT,
  });
})();
