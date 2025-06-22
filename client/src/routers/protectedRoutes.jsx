import React from "react";
import Error from "../Error";
import { ViewAuction } from "../pages/ViewAuction";
import { MainLayout } from "../layout/MainLayout";
import { AuctionList } from "../pages/AuctionList";
import { CreateAuction } from "../pages/CreateAuction";
import { MyAuction } from "../pages/MyAuction";
import Profile from "../pages/Profile";
import Privacy from "../pages/Privacy";
import Dashboard from "../pages/Dashboard";
import { Contact } from "../pages/Contact";

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
      {
        path: "privacy",
        element: <Privacy />,
        errorElement: <Error />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        errorElement: <Error />,
      },
     
      {
        path: "contact",
        element: <Contact />,
        errorElement: <Error />,
      },
      {
        path: "auction",
        element: <AuctionList />,
        errorElement: <Error />,
      },
      {
        path: "auction/:id",
        element: <ViewAuction />,
        errorElement: <Error />,
      },
    ],
  },
];
