import { DataSource } from "typeorm";
import { UsersService } from ".";
import { User } from "../../db/entities";

export function createUsersService(dataSource: DataSource): UsersService {
  const userRepo = dataSource.getRepository(User);

  return {
    async getOrCreateUserByTelegram(telegramId) {
      let user = await userRepo.findOneBy({ telegramId });
      if (!user) {
        user = await userRepo.save(new User(telegramId));
      }
      return user;
    },
  };
}
