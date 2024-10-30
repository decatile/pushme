import fastify, { FastifyBaseLogger, FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { TelegramService } from "./telegram/index";
import { UsersService } from "./users/index";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import { RefreshTokenService } from "./refresh-token";
import { Notification, RefreshToken } from "../db/entities";
import { NotificationService } from "./notifications";
import { buildJsonSchemas, FastifyZod, register } from "fastify-zod";
import * as models from "./models";

declare module "fastify" {
  interface FastifyInstance {
    readonly isProduction: boolean;
    readonly zod: FastifyZod<typeof models>;
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
  "/auth/refresh": {
    refreshTokenService: RefreshTokenService;
  };
  "/auth/accept-code": {
    refreshTokenService: RefreshTokenService;
    telegramService: TelegramService;
    usersService: UsersService;
  };
  "/notification/new": {
    usersService: UsersService;
    notificationService: NotificationService;
  };
  "/notification/edit": {
    notificationService: NotificationService;
  };
  "/notification/all": {
    usersService: UsersService;
    notificationService: NotificationService;
  };
}>;

export interface Options {
  logLevel: string;
  jwtSecret: string;
  cookieSecret: string;
  isProduction?: boolean;
}

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
  await register(app, {
    jsonSchemas: buildJsonSchemas(models),
    swaggerOptions: {
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
    },
    swaggerUiOptions: { routePrefix: "/docs" },
  });
  await app
    .decorate("isProduction", options.isProduction ?? false)
    .register(fastifyCookie, { secret: options.cookieSecret })
    .register(fastifyJwt, {
      secret: options.jwtSecret,
      sign: { expiresIn: "30m" },
    })
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
    app.zod.get(
      url,
      {
        operationId: "up",
        security: [{}, { jwt: [] }],
        response: { 200: "tokenResponse" },
      },
      async (request, reply) => {
        await reply.send({
          token: await request
            .jwtVerify()
            .then(() => "ok")
            .catch((msg) => {
              switch (msg.code) {
                case "FST_JWT_NO_AUTHORIZATION_IN_HEADER":
                  return "not-present";
                default:
                  return "invalid";
              }
            }),
        });
      }
    )
  );
  use("/auth/refresh", ({ refreshTokenService, url }) => {
    app.zod.get(
      url,
      {
        operationId: "authRefresh",
        response: { 200: "tokenResponse" },
      },
      async (request, reply) => {
        const cookie = request.cookies["refresh_token"];
        if (!cookie) {
          throw { statusCode: 400, message: "no-refresh-cookie" };
        }
        const { value, valid } = request.unsignCookie(cookie);
        if (!valid) {
          throw { statusCode: 400, message: "invalid-refresh-cookie" };
        }
        let rToken: RefreshToken;
        try {
          rToken = await refreshTokenService.findByIdAndRotate(value);
        } catch (e) {
          switch (e) {
            case "not-found":
              throw { statusCode: 400, message: "no-refresh-token-id" };
            case "expired":
              throw { statusCode: 400, message: "expired-refresh-token" };
            default:
              throw { message: e };
          }
        }
        const aToken = await reply.jwtSign({ uid: rToken!.user.id });
        await reply
          .cookie("refresh_token", rToken!.id, {
            httpOnly: true,
            expires: rToken!.expiresAt,
            path: "/auth/refresh",
            signed: true,
          })
          .send({ token: aToken });
      }
    );
  });
  use(
    "/auth/accept-code",
    ({ refreshTokenService, telegramService, usersService: users, url }) => {
      app.zod.get(
        url,
        {
          operationId: "authAcceptCode",
          querystring: "authAcceptCodeQuery",
          response: { 200: "tokenResponse" },
        },
        async (request, reply) => {
          let telegramID: string;
          try {
            telegramID = await telegramService.acceptCode(request.query.code);
          } catch (e) {
            switch (e) {
              case "invalid-code":
                throw { statusCode: 400, message: "invalid-telegram-code" };
              default:
                throw { message: e };
            }
          }
          const user = await users.getOrCreateUserByTelegram(telegramID);
          const rToken = await refreshTokenService.newToken(user.id);
          const aToken = await reply.jwtSign({ uid: user.id });
          await reply
            .cookie("refresh_token", rToken.id, {
              httpOnly: true,
              expires: rToken.expiresAt,
              path: "/auth/refresh",
              signed: true,
            })
            .send({ token: aToken });
        }
      );
    }
  );
  use("/notification/new", ({ usersService, notificationService, url }) => {
    app.zod.post(
      url,
      {
        operationId: "notificationNew",
        body: "notificationNewBody",
        security: [{ jwt: [] }],
      },
      async (request, reply) => {
        const { uid } = (await request.jwtDecode()) as { uid: number };
        const user = await usersService.getById(uid);
        if (!user) throw { message: "User not found" };
        const { title, body, schedule } = request.body.notification;
        try {
          await notificationService.newNotification(
            user,
            title,
            body,
            schedule
          );
        } catch (e) {
          switch (e) {
            case "invalid-schedule":
              throw { statusCode: 400, message: e };
            default:
              throw { message: e };
          }
        }
        await reply.send();
      }
    );
  });
  use("/notification/edit", ({ notificationService, url }) => {
    app.zod.post(
      url,
      {
        operationId: "notificationEdit",
        body: "notificationEditBody",
        security: [{ jwt: [] }],
      },
      async (request, reply) => {
        const { uid } = (await request.jwtDecode()) as { uid: number };
        const {
          notification: { id, ...edit },
        } = request.body;
        const notification = await notificationService.getById(id);
        if (!notification) {
          throw { statusCode: 400, message: "notification-not-found" };
        }
        if (notification.user.id !== uid) {
          throw {
            statusCode: 400,
            message: "notification-not-owned-by-user",
          };
        }
        try {
          await notificationService.editNotification(notification, edit);
        } catch (e) {
          switch (e) {
            case "invalid-schedule":
              throw { statusCode: 400, message: e };
            default:
              throw { message: e };
          }
        }
        await reply.send();
      }
    );
  });
  use("/notification/all", ({ usersService, notificationService, url }) => {
    app.zod.get(
      url,
      {
        operationId: "notificationAll",
        security: [{ jwt: [] }],
        response: { 200: "notificationDtosResponse" },
      },
      async (request, reply) => {
        const { uid } = (await request.jwtDecode()) as { uid: number };
        await reply.send(await notificationService.getAll(uid));
      }
    );
  });
}
