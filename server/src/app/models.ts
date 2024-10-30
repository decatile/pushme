import { z } from "zod";

export const authAcceptCodeQuery = z.object({ code: z.string() });

export const notificationNewBody = z.object({
  notification: z.object({
    title: z.string(),
    body: z.string(),
    schedule: z.object({
      kind: z.literal("fixed"),
      when: z.array(z.string().datetime()).min(1),
    }),
  }),
});

export const notificationEditBody = z.object({
  notification: notificationNewBody.shape.notification
    .partial()
    .extend({ id: z.number() }),
});
