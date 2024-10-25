import { z } from "zod";

export const {
  POSTGRES_DATABASE,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT,
  SERVER_HOST,
  SERVER_PORT,
  SERVER_JWT_SECRET,
  TELEGRAM_TOKEN,
  REDIS_URL,
  IS_PRODUCTION
} = z
  .object({
    POSTGRES_DATABASE: z.string(),
    POSTGRES_USERNAME: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.coerce.number().int(),
    SERVER_HOST: z.string(),
    SERVER_PORT: z.coerce.number().int(),
    SERVER_JWT_SECRET: z.string(),
    TELEGRAM_TOKEN: z.string(),
    REDIS_URL: z.string(),
    IS_PRODUCTION: z.coerce.boolean().default(false)
  })
  .parse(process.env);
