import { DataSource } from "typeorm";
import { NotificationService } from ".";
import { Notification } from "../../db/entities";
import {
  fromSerializedSchedule,
  NotificationSchedule,
} from "../../db/notification-schedule";

export function createNotificationService(
  dataSource: DataSource
): NotificationService {
  const notificationRepo = dataSource.getRepository(Notification);

  return {
    newNotification(user, title, body, schedule) {
      return notificationRepo.save(
        new Notification(user, title, body, fromSerializedSchedule(schedule))
      );
    },
    editNotification(notification, edit) {
      return notificationRepo.save({ ...notification, ...edit });
    },
  };
}
