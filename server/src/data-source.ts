import { DataSource } from "typeorm";
import {
  MONGODB_DATABASE,
  MONGODB_HOST,
  MONGODB_PASSWORD,
  MONGODB_PORT,
  MONGODB_USERNAME,
} from "./config";

export default new DataSource({
  type: "mongodb",
  host: MONGODB_HOST,
  port: MONGODB_PORT,
  username: MONGODB_USERNAME,
  password: MONGODB_PASSWORD,
  database: MONGODB_DATABASE,
});
