import { requests } from "src";
import { IAuthResponse } from "src/models/Auth";
import { instance_api } from "src/api.conf";
import { mapper } from "src/utils/mapper";
import { AxiosResponse } from "axios";

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
