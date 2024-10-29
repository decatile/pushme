import { Notification, User } from "../../db/entities";
import { SerializedNotificationSchedule } from "../../db/notification-schedule";

type PickAny<T, K extends keyof T> = Partial<Pick<T, K>>;

export interface NotificationService {
  newNotification(
    user: User,
    title: string,
    body: string,
    schedule: SerializedNotificationSchedule
  ): Promise<Notification>;

  editNotification(
    notification: Notification,
    edit: PickAny<Notification, "contentTitle" | "contentBody" | "schedule">
  ): Promise<Notification>;
}
