export interface InjectOptionsExtensions {
  withAuth(token: string): InjectOptionsExtensions;
}

function _(options: any) {
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

    export function logout(): InjectOptionsExtensions {
      return _({
        method: "get",
        path: "/auth/refresh/logout",
      });
    }

    export function refreshToken(): InjectOptionsExtensions {
      return _({
        method: "get",
        path: "/auth/refresh",
      });
    }
  }
}
