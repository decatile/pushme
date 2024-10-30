import { User } from "../../db/entities";

export interface UsersService {
  /**
   * @param id - User ID
   * @returns User object
   */
  getById(id: number): Promise<User | null>;

  /**
   * @param telegramId - Telegram ID
   * @returns User object (created if not exist)
   */
  getOrCreateUserByTelegram(telegramId: string): Promise<User>;
}
