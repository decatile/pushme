import tap from "tap";
import { createApp, appWithRoutes, Services } from ".";
import { User } from "../db/entities";
import { FastifyInstance, InjectOptions } from "fastify";
import { TelegramService } from "./telegram";
import { UsersService } from "./users";
import sinon from "sinon";

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

tap.test("/auth/accept-code returns valid token", async (t) => {
  sinon.define(telegramService, "acceptCode", async () => "1");
  sinon.define(usersService, "getOrCreateUserByTelegram", async () => ({
    ...new User("1"),
    id: 1,
  }));
  const app = await createDefaultApp({
    "/auth/accept-code": {
      telegram: telegramService,
      users: usersService,
    },
  });
  const resp = (
    await request(app, { path: "/auth/accept-code", query: { code: "hey" } })
  ).json();
  t.hasOwnPropsOnly(resp, ["token"]);
  const token = app.jwt.decode<any>(resp.token);
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
        telegram: telegramService,
        users: usersService,
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
