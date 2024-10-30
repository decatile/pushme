import { useAuth } from "@/context/AuthContext/AuthContext";
import { CheckService } from "@/services/services/check";
import { Button } from "@/ui/button";

const Main = () => {
  const auth = useAuth();
  const handleCheckStatus = async () => {
    const a = await CheckService.checkStatus(auth.token);
    console.log("res", a);
  };
  const handleLogout = () => {
    auth.logout();
  };
  return (
    <div>
      <Button onClick={handleCheckStatus}>UP</Button>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default Main;
