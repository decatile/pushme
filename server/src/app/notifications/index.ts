import { Notification, User } from "../../db/entities";
import { intoSerializedSchedule, SerializedNotificationSchedule } from "../../db/notification-schedule";

export type NotificationDto = {
  id: number;
  title: string;
  body: string;
  schedule: SerializedNotificationSchedule;
};

export function intoNotificationDto(x: Notification): NotificationDto {
  return {
    id: x.id,
    title: x.contentTitle,
    body: x.contentBody,
    schedule: intoSerializedSchedule(x.schedule),
  };
}

export interface NotificationService {
  /**
   * @param userId - User's ID that owns notification
   * @param title - Notification's title
   * @param body - Notification's body
   * @param schedule - Notification's schedule
   * @returns Notification object
   */
  newNotification(
    userId: number,
    title: string,
    body: string,
    schedule: SerializedNotificationSchedule
  ): Promise<Notification>;

  /**
   * @param notification - Notification to edit
   * @param edit - Changed params
   * @returns Notification object
   */
  editNotification(
    notification: Notification,
    edit: Partial<
      Pick<Notification, "contentTitle" | "contentBody"> & {
        schedule: SerializedNotificationSchedule;
      }
    >
  ): Promise<Notification>;

  /**
   * @param id - Notification ID
   * @returns Notification object if present
   */
  getById(id: number): Promise<Notification | null>;

  /**
   * @param userId - User that owns all notifications
   * @returns Notification DTO's which ready to be sent as response
   */
  getAll(userId: number): Promise<NotificationDto[]>;
}
