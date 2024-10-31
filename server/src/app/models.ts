import { z } from "zod";

const schedule = z.object({
  kind: z.literal("fixed"),
  when: z.array(z.string().datetime()).min(1),
});

export const authAcceptCodeQuery = z.object({ code: z.string() });

export const notificationNewBody = z.object({
  notification: z.object({
    title: z.string(),
    body: z.string(),
    schedule,
  }),
});

export const notificationEditBody = z.object({
  notification: notificationNewBody.shape.notification
    .partial()
    .extend({ id: z.number() }),
});

export const tokenResponse = z.object({ token: z.string() });

export const notificationDtosResponse = z.array(
  z.object({ id: z.number(), title: z.string(), body: z.string(), schedule })
);

export const sseQuerySchema = tokenResponse;
