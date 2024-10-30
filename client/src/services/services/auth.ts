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
    console.log("send code obj", obj);
    return instance_api<IAuthResponse>(mapper(obj));
  }

  export function logout(): Promise<AxiosResponse> {
    const obj = requests.auth.logout();
    console.log("logout obj", obj);
    return instance_api(mapper(obj));
  }

  export function refreshToken(
    token: string
  ): Promise<AxiosResponse<IAuthResponse>> {
    const obj = requests.auth.refreshToken();
    // console.log("code", code);
    console.log("refreshToken obj", obj);
    return instance_api<IAuthResponse>(mapper(obj.withAuth(token)));
  }
}
