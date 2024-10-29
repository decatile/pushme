import { RefreshToken, User } from "../../db/entities";

export interface RefreshTokenService {
  /**
   * @param user - user which owns refresh token
   * @returns User's refresh token
   */
  newToken(user: User): Promise<RefreshToken>;

  /**
   * @param id - refresh token id
   * @returns New refresh token
   * @throws {Error} if no valid refresh token with given ID
   */
  findByIdAndRotate(id: string): Promise<RefreshToken>;
}
