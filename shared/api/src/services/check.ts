import { instance_api } from "src/api.conf";
import { mapper } from "src/utils/mapper";
import { requests } from "src";
import { AxiosResponse } from "axios";

export namespace CheckService {
  export function checkStatus(): Promise<AxiosResponse> {
    const obj = requests.up();
    return instance_api(mapper(obj));
  }
}
