import { AxiosResponse } from "axios";
import { requests } from "..";
import { instance_api } from "../api.conf";
import { mapper } from "../utils/mapper";

export namespace CheckService {
  export function checkStatus(): Promise<AxiosResponse> {
    const obj = requests.up();
    return instance_api(mapper(obj));
  }
}
