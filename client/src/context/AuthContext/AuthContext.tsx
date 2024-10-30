import { AuthService } from "@/services/services/auth";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IAuthContext, IAuthProvider } from "./types";

const AuthContext = createContext<IAuthContext>({
  token: "",
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: IAuthProvider) {
  const [token, setToken] = useState<string>(
    localStorage.getItem("pushme-token") || ""
  );
  const navigate = useNavigate();

  const login = async (code: string) => {
    const response = await AuthService.sendCode(code);
    setToken(response.data.token);
    localStorage.setItem("pushme-token", response.data.token);
    console.log("token", response.data);
    navigate("/");
  };

  const logout = async () => {
    const response = await AuthService.logout();
    console.log("logout", response);
    setToken("");
    localStorage.removeItem("pushme-token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
