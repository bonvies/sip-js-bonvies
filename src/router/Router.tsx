import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import Dialer from "../Pages/Dialer";
import Calls from "../Pages/Calls";
import Settings from "../Pages/Settings";



const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Dialer />,
      },
      {
        path: '/calls',
        element: <Calls />,
      },
      {
        path: '/settings',
        element: <Settings />,
      }
    ]
  }
]);

export default function Router() {
  return <RouterProvider router={router} />
}
