import { InjectOptions } from "fastify";

export function mapper(obj: InjectOptions) {
  return {
    method: obj.method,
    url: obj.path as string,
    params: obj.query,
  };
}
