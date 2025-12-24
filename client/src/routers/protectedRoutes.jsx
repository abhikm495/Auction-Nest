import React from "react";
import Error from "../Error";
import { MainLayout } from "../layout/MainLayout";
import { CreateAuction } from "../pages/CreateAuction";
import { MyAuction } from "../pages/MyAuction";
import Profile from "../pages/Profile";


export const protectedRoutes = [
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "myauction",
        element: <MyAuction />,
        errorElement: <Error />,
      },
      {
        path: "create",
        element: <CreateAuction />,
        errorElement: <Error />,
      },
    

      {
        path: "profile",
        element: <Profile />,
        errorElement: <Error />,
      },
      
    ],
  },
];
