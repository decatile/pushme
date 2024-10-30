import { AxiosResponse } from "axios";
import { requests } from "../index";
import { instance_api } from "../api";
import { mapper } from "../utils/mapper";

export namespace CheckService {
  export function checkStatus(token: string): Promise<AxiosResponse> {
    const obj = requests.up();
    return instance_api(mapper(obj.withAuth(token)));
  }
}
