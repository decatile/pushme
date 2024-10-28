import fastify, { FastifyBaseLogger, FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { TelegramService } from "./telegram/index";
import { UsersService } from "./users/index";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";

declare module "fastify" {
  interface FastifyInstance {
    readonly isProduction: boolean;
  }
}

function makeUse(services: Services, log: FastifyBaseLogger) {
  return <Path extends keyof Services>(
    path: Path,
    func: (deps: Services[Path] & { url: string }) => any
  ) => {
    const deps = services[path];
    if (deps) {
      log.debug(`Route ${path}`);
      func({ ...deps, url: path });
    }
  };
}

export type Services = Partial<{
  "/up": {};
  "/auth/accept-code": { telegram: TelegramService; users: UsersService };
}>;

export type Options = {
  logLevel: string;
  jwtSecret: string;
  cookieSecret: string;
  isProduction?: boolean;
};

export async function createApp(options: Options): Promise<FastifyInstance> {
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
  });
  await app
    .decorate("isProduction", options.isProduction ?? false)
    .register(fastifyCookie, { secret: options.cookieSecret })
    .register(fastifyJwt, {
      secret: options.jwtSecret,
      sign: { expiresIn: "30m" },
    })
    .register(fastifySwagger, {
      openapi: {
        components: {
          securitySchemes: {
            jwt: {
              type: "http",
              scheme: "Bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
    })
    .register(fastifySwaggerUi, { routePrefix: "/docs" })
    .register(fastifyCors, { origin: `*` });
  app.setErrorHandler((error, _, reply) => {
    if (!error.statusCode) {
      app.log.error(error);
      return reply
        .code(500)
        .send({ error: `Unhandled error: ${error.message}` });
    }
    reply.code(error.statusCode).send({ error: error.message });
  });
  return app;
}

export function appWithRoutes<Full extends boolean = false>(
  app: FastifyInstance,
  services: Full extends true
    ? Services extends Partial<infer ClearServices>
      ? ClearServices
      : never
    : Services
) {
  const use = makeUse(services, app.log);
  use("/up", ({ url }) =>
    app.get(
      url,
      { schema: { security: [{ jwt: [] }] } },
      async (request, reply) => {
        reply.send({
          token: await request
            .jwtVerify()
            .then(() => "ok")
            .catch(({ message }) => message),
        });
      }
    )
  );
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
          response: {
            200: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      async (request, reply) => {
        let telegramID: string;
        try {
          telegramID = await telegram.acceptCode((request.query as any).code);
        } catch {
          throw { statusCode: 400, message: "invalid-telegram-code" };
        }
        const user = await users.getOrCreateUserByTelegram(telegramID);
        const token = await reply.jwtSign({ uid: user.id });
        await reply.send({ token });
      }
    );
  });
}
