import axios from "axios";

export const BASE_URL = "http://localhost:8080";
export const instance_api = axios.create({
  baseURL: BASE_URL,
  timeout: 1000
});
