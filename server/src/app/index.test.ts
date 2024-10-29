import tap from "tap";
import { createApp, appWithRoutes, Services } from ".";
import { RefreshToken, User } from "../db/entities";
import { FastifyInstance, InjectOptions } from "fastify";
import { TelegramService } from "./telegram";
import { UsersService } from "./users";
import sinon from "sinon";
import { RefreshTokenService } from "./refresh-token";

const refreshTokenService: RefreshTokenService = {} as any;
const telegramService: TelegramService = {} as any;
const usersService: UsersService = {} as any;

async function createDefaultApp(services?: Services) {
  const app = await createApp({
    logLevel: "warn",
    jwtSecret: "secret",
    cookieSecret: "secret",
  });
  if (services) appWithRoutes(app, services);
  return app;
}

async function request(app: FastifyInstance, options: InjectOptions) {
  await app.ready();
  return await app.inject(options);
}

tap.afterEach(() => sinon.restore());

tap.test("noop succeeds", async (t) => {
  await createDefaultApp();
  t.end();
});

tap.test("/up not-present", async (t) => {
  const app = await createDefaultApp({ "/up": {} });
  const resp = await request(app, { path: "/up" });
  t.equal(resp.statusCode, 200);
  const json = await resp.json();
  t.hasOwnPropsOnly(json, ["token"]);
  t.equal(json.token, "not-present");
  t.end();
});

tap.test("/up invalid", async (t) => {
  const app = await createDefaultApp({ "/up": {} });
  const resp = await request(app, {
    path: "/up",
    headers: { authorization: "Bearer blabla" },
  });
  t.equal(resp.statusCode, 200);
  const json = await resp.json();
  t.hasOwnPropsOnly(json, ["token"]);
  t.equal(json.token, "invalid");
  t.end();
});

tap.test("/auth/rotate returns valid token", async (t) => {
  sinon.define(refreshTokenService, "findByIdAndRotate", async () => ({
    ...new RefreshToken(
      { ...new User("1"), id: 1 },
      new Date(Date.now() + 1000)
    ),
    id: "hello-world",
  }));
  const app = await createDefaultApp({
    "/auth/refresh": {
      refreshTokenService: refreshTokenService,
    },
  });
  const resp = await request(app, {
    path: "/auth/refresh",
    cookies: { refresh_token: app.signCookie("hello-world") },
  });
  t.equal(resp.statusCode, 200);
  t.end();
});

tap.test("/auth/accept-code returns valid token", async (t) => {
  sinon.define(refreshTokenService, "newToken", async (user: User) => {
    return {
      ...new RefreshToken(user, new Date(Date.now() + 1000)),
      id: "hello-world",
    };
  });
  sinon.define(telegramService, "acceptCode", async () => "1");
  sinon.define(usersService, "getOrCreateUserByTelegram", async () => ({
    ...new User("1"),
    id: 1,
  }));
  const app = await createDefaultApp({
    "/auth/accept-code": {
      refreshTokenService: refreshTokenService,
      telegramService: telegramService,
      usersService: usersService,
    },
  });
  const resp = await request(app, {
    path: "/auth/accept-code",
    query: { code: "hey" },
  });
  const refreshTokenCookie = app.unsignCookie(
    resp.cookies.find((x) => x.name === "refresh_token")!.value
  ).value;
  t.equal(refreshTokenCookie, "hello-world");
  const body = await resp.json();
  t.hasOwnPropsOnly(body, ["token"]);
  const token = app.jwt.decode<any>(body.token);
  t.hasOwnPropsOnly(token, ["uid", "iat", "exp"]);
  t.end();
});

tap.test("/auth/accept-code handle code not found", async (t) => {
  sinon.define(telegramService, "acceptCode", () => {
    throw Error();
  });
  const resp = await request(
    await createDefaultApp({
      "/auth/accept-code": {
        refreshTokenService: refreshTokenService,
        telegramService: telegramService,
        usersService: usersService,
      },
    }),
    { path: "/auth/accept-code", query: { code: "not" } }
  );
  t.equal(resp.statusCode, 400);
  t.equal(
    JSON.stringify(resp.json()),
    JSON.stringify({ error: "invalid-telegram-code" })
  );
  t.end();
});
