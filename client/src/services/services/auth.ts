import { AxiosResponse } from "axios";
import { requests } from "../index";
import { mapper } from "../utils/mapper";
import { instance_api } from "../api";

export interface IAuthResponse {
  token: string;
}

export namespace AuthService {
  export function sendCode(
    code: string
  ): Promise<AxiosResponse<IAuthResponse>> {
    const obj = requests.auth.acceptCode(code);
    console.log("code", code);
    console.log("obj", obj);
    return instance_api<IAuthResponse>(mapper(obj));
  }
}
