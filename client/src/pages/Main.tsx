import { CheckService } from "@/services/services/check";
import { Button } from "@/ui/button";
import React from "react";

const Main = () => {
  const handleCheckStatus = async () => {
    const a = await CheckService.checkStatus();
    console.log("res", a);
  };
  return (
    <div>
      <Button onClick={handleCheckStatus}>UP</Button>
    </div>
  );
};

export default Main;
