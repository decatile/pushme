import { User } from "../../db/entities";

export interface UsersService {
  getOrCreateUserByTelegram(telegramId: number): Promise<User>;
}
