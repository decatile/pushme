import { AxiosResponse } from "axios";
import { requests } from "../index";
import { instance_api } from "../api";
import { mapper } from "../utils/mapper";
import { useAuth } from "@/context/AuthContext/AuthContext";

export namespace CheckService {
  export function checkStatus(): Promise<AxiosResponse> {
    const auth = useAuth();
    const obj = requests.up();
    return instance_api(mapper(obj.withAuth(auth.token)));
  }
}
