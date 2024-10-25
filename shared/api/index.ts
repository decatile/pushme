import { InjectOptions } from "fastify";

export namespace requests {
  export function up(): InjectOptions {
    return { method: "get", path: "/up" };
  }

  export namespace auth {
    export function acceptCode(code: string): InjectOptions {
      return { method: "get", path: "/auth/accept-code", query: { code } };
    }
  }
}
