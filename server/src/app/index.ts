import fastify, { FastifyBaseLogger, FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { TelegramService } from "./telegram/index";
import { UsersService } from "./users/index";

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

export function createApp(
  services: Services,
  options: Options
): FastifyInstance {
  let app = fastify({ logger: { level: options.logLevel } }).register(
    fastifyJwt,
    {
      secret: options.secret,
      sign: { expiresIn: "30m" },
    }
  );
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
          reply.code(400);
          await reply.send({
            error: "Bad Request",
            message: "Invalid telegram code",
          });
          return;
        }
        const user = await users.getOrCreateUserByTelegram(telegramID);
        await reply.send({
          token: app.jwt.sign({ user_id: user.id }),
        });
      }
    );
  });
  return app;
}
