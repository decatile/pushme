import fastify, { FastifyBaseLogger, FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { TelegramService } from "./telegram";

export type Services = Partial<{
  "/auth/accept-code": { telegram: TelegramService };
}>;

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

export function createApp(services: Services): FastifyInstance {
  let app = fastify({ logger: { level: "debug" } }).register(fastifyJwt, {
    secret: "DO NOT USE IN PRODUCTION",
  });
  const use = makeUse(services, app.log);
  use("/auth/accept-code", ({ telegram, url }) => {
    app.route({
      url,
      method: "get",
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
      handler: async (request, reply) => {
        const telegramID = await telegram.acceptCode(
          (request.query as { code: string }).code
        );
        reply.send("Your telegram ID: " + telegramID);
      },
    });
  });
  return app;
}
