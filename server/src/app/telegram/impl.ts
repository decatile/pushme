import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_TOKEN } from "../../config";
import { RedisClientType } from "redis";
import { uuidv7 } from "uuidv7";
import { TelegramService } from ".";

const replyMarkup = { keyboard: [[{ text: "Send me code" }]] };

export function createTelegramService(redis: RedisClientType): TelegramService {
  const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
  bot.onText(/\/start/, async (msg) => {
    await bot.sendMessage(
      msg.chat.id,
      "Hello! To retrieve code use keyboard below.",
      { reply_markup: replyMarkup }
    );
  });
  bot.onText(/Send me code/, async (msg) => {
    const codePair = Object.entries(await redis.hGetAll("telegram-code")).find(
      ([_, v]) => v === String(msg.from!.id)
    );
    if (codePair) {
      await bot.sendMessage(
        msg.chat.id,
        "Your code:\n```" + codePair[0] + "```\nIt is valid for 5 minutes",
        {
          reply_to_message_id: msg.message_id,
          reply_markup: replyMarkup,
          parse_mode: "Markdown",
        }
      );
      return;
    }
    const code = uuidv7().replaceAll("-", "");
    await redis
      .multi()
      .hSet("telegram-code", code, msg.from!.id)
      .hExpire("telegram-code", code, 5 * 300)
      .exec();
    await bot.sendMessage(
      msg.chat.id,
      "Your code:\n```" + code + "```\nIt is valid for 5 minutes",
      {
        reply_to_message_id: msg.message_id,
        reply_markup: replyMarkup,
        parse_mode: "Markdown",
      }
    );
  });
  return {
    async acceptCode(code) {
      const telegramID = (
        await redis
          .multi()
          .hGet("telegram-code", code)
          .hDel("telegram-code", code)
          .exec()
      )[0] as string;
      if (!telegramID) {
        throw Error("Invalid code");
      }
      return +telegramID;
    },
  };
}