import { User } from "../../db/entities";

export interface UsersService {
  /**
   * @param telegramId - Telegram ID
   * @returns User object (created if not exist)
   */
  getOrCreateUserByTelegram(telegramId: string): Promise<User>;
}
