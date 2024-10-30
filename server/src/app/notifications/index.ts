import { Notification, User } from "../../db/entities";
import { SerializedNotificationSchedule } from "../../db/notification-schedule";

export type NotificationDto = {
  id: number;
  title: string;
  body: string;
  schedule: SerializedNotificationSchedule;
};

export interface NotificationService {
  newNotification(
    user: User,
    title: string,
    body: string,
    schedule: SerializedNotificationSchedule
  ): Promise<Notification>;

  editNotification(
    notification: Notification,
    edit: Partial<
      Pick<Notification, "contentTitle" | "contentBody"> & {
        schedule: SerializedNotificationSchedule;
      }
    >
  ): Promise<Notification>;

  getById(id: number): Promise<Notification | null>;

  getAll(user: User): Promise<NotificationDto[]>;
}
