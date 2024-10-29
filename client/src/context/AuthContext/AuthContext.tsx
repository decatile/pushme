import { AuthService } from "@/services/services/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IAuthContext, IAuthProvider } from "./types";

const AuthContext = createContext<IAuthContext>({
  token: "",
  login: () => {},
  logout: () => {},
  isAuthorized: () => {},
});

export function AuthProvider({ children }: IAuthProvider) {
  const [token, setToken] = useState<string>(
    localStorage.getItem("pushme-token") || ""
  );
  const navigate = useNavigate();

  const isAuthorized = () => {
    if (!token) {
      navigate("/login");
    } else {
      return token;
    }
  };

  const login = async ({ credentials }: { credentials: string }) => {
    const response = await AuthService.sendCode(credentials);
    setToken(response.data.token);
    localStorage.setItem("pushme-token", response.data.token);
    navigate("/");
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("pushme-token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
