import { DataSource } from "typeorm";
import { intoNotificationDto, NotificationService } from ".";
import { Notification, User } from "../../db/entities";
import {
  fromSerializedSchedule,
  intoSerializedSchedule,
} from "../../db/notification-schedule";

export function createNotificationService(
  dataSource: DataSource
): NotificationService {
  const notificationRepo = dataSource.getRepository(Notification);

  return {
    newNotification(userId, title, body, schedule) {
      return notificationRepo.save(
        new Notification(
          { id: userId } as User,
          title,
          body,
          fromSerializedSchedule(schedule)
        )
      );
    },
    editNotification(notification, { schedule, ...edit }) {
      const data = {
        ...notification,
        ...edit,
      };
      if (schedule) {
        data.schedule = fromSerializedSchedule(schedule);
      }
      return notificationRepo.save(data);
    },
    getById(id: number): Promise<Notification | null> {
      return notificationRepo.findOne({
        where: { id },
        relations: { user: true },
      });
    },
    async getAll(userId) {
      const resp = await notificationRepo.findBy({ user: { id: userId } });
      return resp.map(intoNotificationDto);
    },
  };
}
