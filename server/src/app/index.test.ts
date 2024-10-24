import tap from "tap";
import { createApp, Options, withRoutes } from ".";
import { User } from "../db/entities";

const testingOptions = { logLevel: "warn", secret: "secret" } satisfies Options;

tap.test("noop", async (t) => {
  await createApp(testingOptions).ready();
  t.end();
});

tap.test("/up", async (t) => {
  const app = createApp(testingOptions);
  withRoutes(app, { "/up": {} });
  const resp = await app.inject({ path: "/up" });
  t.equal(resp.statusCode, 200);
  t.end();
});

tap.test("/auth/accept-code", async (t) => {
  {
    const app = createApp(testingOptions);
    withRoutes(app, {
      "/auth/accept-code": {
        telegram: {
          acceptCode() {
            return Promise.resolve(1);
          },
        },
        users: {
          getOrCreateUserByTelegram(telegramId) {
            const user = new User(telegramId);
            user.id = 1;
            return Promise.resolve(user);
          },
        },
      },
    });
    await app.ready();
    const resp = (
      await app.inject({
        path: "/auth/accept-code",
        query: { code: "" },
      })
    ).json();
    t.equal((app.jwt.decode(resp.token) as any).user_id, 1);
  }
  {
    const app = createApp(testingOptions);
    withRoutes(app, {
      "/auth/accept-code": {
        telegram: {
          acceptCode(code) {
            throw Error();
          },
        },
        users: {
          getOrCreateUserByTelegram(telegramId) {
            throw Error();
          },
        },
      },
    });
    await app.ready();
    const resp = await app.inject({
      path: "/auth/accept-code",
      query: { code: "" },
    });
    t.equal(
      JSON.stringify({ code: resp.statusCode, resp: resp.json() }),
      JSON.stringify({
        code: 400,
        resp: {
          error: "Bad Request",
          message: "Invalid telegram code",
        },
      })
    );
  }
  t.end();
});
