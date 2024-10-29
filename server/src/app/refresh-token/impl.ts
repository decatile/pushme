import { DataSource, EntityManager } from "typeorm";
import { RefreshTokenService } from ".";
import { RefreshToken, User } from "../../db/entities";

export interface Options {
  expiresIn: number;
}

export function createRefreshTokenService(
  dataSource: DataSource,
  options: Options
): RefreshTokenService {
  const tokenRepo = dataSource.getRepository(RefreshToken);

  return {
    newToken(user: User) {
      return tokenRepo.save(
        new RefreshToken(user, new Date(Date.now() + options.expiresIn))
      );
    },
    findByIdAndRotate(id) {
      return dataSource.transaction(async (em) => {
        const old = await em.findOneBy(RefreshToken, { id });
        if (!old) {
          throw Error("not-found");
        }
        await em.delete(RefreshToken, old);
        if (old.expiresAt < new Date()) {
          throw Error("expired");
        }
        return em.save(
          RefreshToken,
          new RefreshToken(old.user, new Date(Date.now() + options.expiresIn))
        );
      });
    },
  };
}
