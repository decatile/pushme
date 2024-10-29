import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import {
  NotificationSchedule,
  notificationScheduleTransformer,
} from "./notification-schedule";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegramId: string;

  @OneToMany(() => Notification, (photo) => photo.user)
  notifications: Notification[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(telegramId: string) {
    this.telegramId = telegramId;
  }
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  @Column()
  contentTitle: string;

  @Column()
  contentBody: string;

  @Column({
    type: "string",
    transformer: notificationScheduleTransformer,
  })
  schedule: NotificationSchedule;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(
    user: User,
    title: string,
    body: string,
    schedule: NotificationSchedule
  ) {
    this.user = user;
    this.contentTitle = title;
    this.contentBody = body;
    this.schedule = schedule;
  }
}

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(user: User, expiresAt: Date) {
    this.user = user;
    this.expiresAt = expiresAt;
  }
}
