import { DataSource } from "typeorm";
import { NotificationService } from ".";
import { Notification } from "../../db/entities";
import {
  fromSerializedSchedule,
  intoSerializedSchedule,
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
    editNotification(notification, { schedule, ...edit }) {
      return notificationRepo.save({
        ...notification,
        ...edit,
        schedule: schedule && fromSerializedSchedule(schedule),
      });
    },
    getById(id: number): Promise<Notification | null> {
      return notificationRepo.findOne({
        where: { id },
        relations: { user: true },
      });
    },
    async getAll(userId) {
      const resp = await notificationRepo.findBy({ user: { id: userId } });
      return resp.map((x) => ({
        id: x.id,
        title: x.contentTitle,
        body: x.contentBody,
        schedule: intoSerializedSchedule(x.schedule),
      }));
    },
  };
}
