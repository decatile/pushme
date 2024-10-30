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
    newToken(userId) {
      return tokenRepo.save(
        new RefreshToken(
          { id: userId } as User,
          new Date(Date.now() + options.expiresIn)
        )
      );
    },
    async removeToken(tokenId) {
      await tokenRepo.delete({ id: tokenId });
    },
    findByIdAndRotate(id) {
      return dataSource.transaction(async (em) => {
        const old = await em.findOne(RefreshToken, {
          where: { id },
          relations: { user: true },
        });
        if (!old) {
          throw "not-found";
        }
        await em.delete(RefreshToken, old);
        if (old.expiresAt < new Date()) {
          throw "expired";
        }
        return em.save(
          RefreshToken,
          new RefreshToken(old.user, new Date(Date.now() + options.expiresIn))
        );
      });
    },
  };
}
