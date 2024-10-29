import { ReactNode } from "react";

export interface IAuthProvider {
  children: ReactNode;
}

export interface IAuthContext {
  token: string;
  login: (credentials: any) => void;
  logout: () => void;
  isAuthorized: () => void | string;
}
