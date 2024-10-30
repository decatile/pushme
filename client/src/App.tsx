import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Login from "@/pages/Login";
import { AuthProvider } from "./context/AuthContext/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Main from "./pages/Main";
import PublicRoute from "./components/PublicRoute";

const Layout = () => {
  return (
    <>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      //приватные пути
      {
        path: "/",
        element: <PrivateRoute />,
        children: [
          {
            path: "/",
            element: <Main />,
          },
          {
            path: "/lk",
            element: <h1>Личный кабинет, вы авторизованы</h1>,
          },
        ],
      },
      //ограниченные публичные пути, недоступные авторизованному пользователю
      {
        element: <PublicRoute restricted={true} />,
        children: [
          {
            path: "/login",
            element: <Login />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
