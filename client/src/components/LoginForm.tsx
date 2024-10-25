import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Input } from "@/ui/input";
import { Separator } from "@/ui/separator";

const LoginForm = () => {
  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-2xl">Вход</CardTitle>
        <CardDescription className="text-center">
          Введите код полученный от бота или напишите боту для получения кода
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5 mb-4">
              <Input
                className="border-slate-400"
                id="code"
                type="text"
                required
              />
            </div>
          </div>
          <Button className="w-full">Подтвердить код</Button>
          <div className="flex items-center my-2">
            <Separator className="flex-grow max-w-[calc(50%-2rem)]" />
            <span className="mx-4 text-sm text-gray-500">или</span>
            <Separator className="flex-grow max-w-[calc(50%-2rem)]" />
          </div>
          <a
            href="tg://resolve?domain=pushme01bot/"
            className="w-full block text-center border rounded-md px-3 py-1 text-sm"
          >
            Написать боту
          </a>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
