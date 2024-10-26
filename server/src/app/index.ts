import fastify, { FastifyBaseLogger, FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { TelegramService } from "./telegram/index";
import { UsersService } from "./users/index";
import fastifyCookie from "@fastify/cookie";
import { IS_PRODUCTION, SERVER_PORT } from "../config";
import fastifyCors from "@fastify/cors";

function makeUse(services: Services, log: FastifyBaseLogger) {
  return <Path extends keyof Services>(
    path: Path,
    func: (deps: Services[Path] & { url: string }) => any
  ) => {
    const deps = services[path];
    if (deps) {
      log.debug(`Using route ${path}`);
      func({ ...deps, url: path });
    }
  };
}

export type Services = Partial<{
  "/up": {};
  "/auth/accept-code": { telegram: TelegramService; users: UsersService };
}>;

export type Options = { logLevel: string; secret: string };

export function createApp(options: Options): FastifyInstance {
  const app = fastify({
    logger: {
      level: options.logLevel,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    },
  })
    .register(fastifyCookie)
    .register(fastifyJwt, {
      secret: options.secret,
      sign: { expiresIn: "30m" },
      cookie: { cookieName: "token", signed: true },
    })
    .setErrorHandler(({ statusCode, message }, _, reply) => {
      reply.code(statusCode!).send({ error: message });
    });
  if (!IS_PRODUCTION) {
    app.register(fastifyCors, { origin: `*` });
  }
  return app;
}

export function appWithRoutes<IsFull = false>(
  app: FastifyInstance,
  services: IsFull extends true
    ? Services extends Partial<infer ClearServices>
      ? ClearServices
      : never
    : IsFull extends false
    ? Services
    : never
) {
  const use = makeUse(services, app.log);
  use("/up", ({ url }) => app.get(url, (_, reply) => reply.send()));
  use("/auth/accept-code", ({ telegram, users, url }) => {
    app.get(
      url,
      {
        schema: {
          querystring: {
            type: "object",
            required: ["code"],
            additionalProperties: false,
            properties: {
              code: {
                type: "string",
              },
            },
          },
        },
      },
      async (request, reply) => {
        let telegramID: number;
        try {
          telegramID = await telegram.acceptCode((request.query as any).code);
        } catch {
          throw { statusCode: 400, message: "invalid-telegram-code" };
        }
        const user = await users.getOrCreateUserByTelegram(telegramID);
        const token = await reply.jwtSign({ uid: user.id });
        await reply
          .cookie(
            "token",
            token,
            IS_PRODUCTION ? { httpOnly: true, sameSite: true } : undefined
          )
          .send();
      }
    );
  });
}
