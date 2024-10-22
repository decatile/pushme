import { z } from "zod";

const port = z.coerce.number().min(1).max(65535);

export const {
  MONGODB_DATABASE,
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_HOST,
  MONGODB_PORT,
  SERVER_HOST,
  SERVER_PORT,
} = z
  .object({
    MONGODB_DATABASE: z.string(),
    MONGODB_USERNAME: z.string(),
    MONGODB_PASSWORD: z.string(),
    MONGODB_HOST: z.string(),
    MONGODB_PORT: port,
    SERVER_HOST: z.string(),
    SERVER_PORT: port,
  })
  .parse(process.env);
