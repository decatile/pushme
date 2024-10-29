import { useAuth } from "@/context/AuthContext/AuthContext";
import { FC, ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface IPrivateRoute {
  children: ReactNode;
}

const PrivateRoute = () => {
  const auth = useAuth();
  if (!auth.token) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
