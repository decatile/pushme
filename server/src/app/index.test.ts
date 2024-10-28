import tap from "tap";
import { createApp, appWithRoutes, Services } from ".";
import { User } from "../db/entities";
import { requests } from "@pushme/api";
import { FastifyInstance, InjectOptions } from "fastify";
import { TelegramService } from "./telegram";
import { UsersService } from "./users";
import sinon from "sinon";

const telegramService: TelegramService = {
  acceptCode() {
    throw Error();
  },
};

const usersService: UsersService = {
  getOrCreateUserByTelegram() {
    throw Error();
  },
};

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

tap.test("/up succeeds", async (t) => {
  const resp = await request(
    await createDefaultApp({ "/up": {} }),
    requests.up()
  );
  t.equal(resp.statusCode, 200);
  t.equal(resp.body, "");
  t.end();
});

tap.test("/auth/accept-code returns valid token", async (t) => {
  sinon.replace(telegramService, "acceptCode", async () => 1);
  sinon.replace(usersService, "getOrCreateUserByTelegram", async () => ({
    ...new User(1),
    id: 1,
  }));
  const app = await createDefaultApp({
    "/auth/accept-code": {
      telegram: telegramService,
      users: usersService,
    },
  });
  const resp = await request(app, requests.auth.acceptCode(""));
  const tokenCookie = resp.headers["set-cookie"] as string;
  const token = app.jwt.decode<any>(/token=([^;]+)/.exec(tokenCookie)![1]);
  t.hasOwnPropsOnly(token, ["uid", "iat", "exp"]);
  t.equal(resp.body, "");
  t.end();
});

tap.test("/auth/accept-code handle code not found", async (t) => {
  sinon.replace(telegramService, "acceptCode", () => {
    throw Error();
  });
  const resp = await request(
    await createDefaultApp({
      "/auth/accept-code": {
        telegram: telegramService,
        users: usersService,
      },
    }),
    requests.auth.acceptCode("")
  );
  t.equal(resp.statusCode, 400);
  t.equal(
    JSON.stringify(resp.json()),
    JSON.stringify({ error: "invalid-telegram-code" })
  );
  t.end();
});
