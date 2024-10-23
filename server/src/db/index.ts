import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DATABASE,
  POSTGRES_PASSWORD,
  POSTGRES_USERNAME,
} from "../config";
import { User, Notification } from "./entities";

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
