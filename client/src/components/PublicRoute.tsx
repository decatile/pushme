import { useAuth } from "@/context/AuthContext/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = ({ restricted = false }) => {
  const auth = useAuth();
  if (auth.token && restricted) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PublicRoute;
