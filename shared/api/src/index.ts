import { InjectOptions } from "fastify";

export interface InjectOptionsExtensions extends InjectOptions {
  withAuth(token: string): InjectOptionsExtensions;
}

function _(options: InjectOptions) {
  return {
    ...options,
    withAuth(token: string) {
      if (this.headers) {
        this.headers.authorization = "Bearer " + token;
      } else {
        this.headers = { authorization: "Bearer " + token };
      }
      return this;
    },
  };
}

export namespace requests {
  export function up(): InjectOptionsExtensions {
    return _({
      method: "get",
      path: "/up",
    });
  }

  export namespace auth {
    export function acceptCode(code: string): InjectOptionsExtensions {
      return _({
        method: "get",
        path: "/auth/accept-code",
        query: { code },
      });
    }
  }
}
