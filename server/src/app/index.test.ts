import tap from "tap";
import { createApp, Options } from ".";
import { TelegramService } from "./telegram/index";
import { UsersService } from "./users/index";
import { User } from "../db/entities";

const testingOptions = { logLevel: "warn", secret: "secret" } satisfies Options;

tap.test("noop", (t) => {
  createApp({}, testingOptions);
  t.end();
});

tap.test("/auth/accept-code", async (t) => {
  {
    const app = createApp(
      {
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
      },
      testingOptions
    );
    await app.ready();
    const resp = (
      await app.inject({
        path: "/auth/accept-code",
        query: { code: "" },
      })
    ).json();
    t.equal((app.jwt.decode(resp.token) as any).user_id, 1);
    t.pass();
  }
  {
    const app = createApp(
      {
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
      },
      testingOptions
    );
    await app.ready();
    const resp = (
      await app.inject({
        path: "/auth/accept-code",
        query: { code: "" },
      })
    ).json();
    t.equal(
      JSON.stringify(resp),
      JSON.stringify({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid telegram code",
      })
    );
    t.pass();
  }
  t.end();
});
