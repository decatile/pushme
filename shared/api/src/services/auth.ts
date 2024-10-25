import { AxiosResponse } from "axios";
import { requests } from "..";
import { instance_api } from "../api.conf";
import { IAuthResponse } from "../models/Auth";
import { mapper } from "../utils/mapper";

export namespace AuthService {
  export function sendCode(
    code: string
  ): Promise<AxiosResponse<IAuthResponse>> {
    try {
      const obj = requests.auth.acceptCode(code);
      console.log("code", code);
      return instance_api<IAuthResponse>(mapper(obj));
    } catch (error) {
      console.log("Ошибка при запросе:", error);
    }
  }
}
