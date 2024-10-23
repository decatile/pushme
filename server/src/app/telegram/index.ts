export interface TelegramService {
  /**
   * @param code - code that telegram bot sent to user
   * @throws {Error} if code invalid
   * @returns User telegram ID
   */
  acceptCode(code: string): Promise<number>;
}
