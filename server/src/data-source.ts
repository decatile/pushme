import "reflect-metadata";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DataSource,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DATABASE,
  POSTGRES_PASSWORD,
  POSTGRES_USERNAME,
} from "./config";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegram_id: number;

  @OneToMany(() => Notification, (photo) => photo.user)
  notifications: Notification[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor(telegram_id: number) {
    this.telegram_id = telegram_id;
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor(user: User, title: string, body: string) {
    this.user = user;
    this.contentTitle = title;
    this.contentBody = body;
  }
}

export default new DataSource({
  type: "postgres",
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  username: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
  entities: [User, Notification],
  synchronize: true,
});
