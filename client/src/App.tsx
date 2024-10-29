import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Login from "@/pages/Login";
import { AuthProvider } from "./context/AuthContext/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Main from "./pages/Main";

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
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
