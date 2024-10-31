export type NotificationSchedule = {
  kind: "fixed";
  when: Date[];
};

export type SerializedNotificationSchedule = {
  kind: "fixed";
  when: string[];
};

export const notificationScheduleTransformer = {
  from(value: string): NotificationSchedule {
    const { kind, ...schedule } = JSON.parse(value) as any & { kind: string };
    switch (kind) {
      case "fixed":
        return {
          kind,
          when: schedule.when.map((x: string) => new Date(x)),
        };
    }
    throw Error(`inimplemented kind: ${kind}`);
  },
  to(value: NotificationSchedule): string {
    return JSON.stringify(value);
  },
};

export function fromSerializedSchedule(
  schedule: SerializedNotificationSchedule
): NotificationSchedule {
  switch (schedule.kind) {
    case "fixed":
      const when = schedule.when.map((x) => new Date(x));
      if (when[0] < new Date()) throw Error("invalid-schedule");
      return { kind: "fixed", when: when };
  }
}

export function intoSerializedSchedule(
  schedule: NotificationSchedule
): SerializedNotificationSchedule {
  switch (schedule.kind) {
    case "fixed":
      return {
        kind: "fixed",
        when: schedule.when.map((x) => x.toJSON()),
      };
  }
}
