import { DataSource } from "typeorm";
import { UsersService } from ".";
import { User } from "../../db/entities";

export function createUsersService(dataSource: DataSource): UsersService {
  const userRepo = dataSource.getRepository(User);

  return {
    async getOrCreateUserByTelegram(telegramId) {
      let user = await userRepo.findOneBy({ telegram_id: telegramId });
      if (!user) {
        user = userRepo.create(new User(telegramId));
      }
      return user;
    },
  };
}
