import React from "react"
import Error from "../Error";
import { OpenLayout } from "../layout/OpenLayout";
import { Contact } from "../pages/Contact";
import { Landing } from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import { AuctionList } from "../pages/AuctionList";
import { ViewAuction } from "../pages/ViewAuction";
import Dashboard from "../pages/Dashboard";

export const openRoutes = [
  {
    path: "/",
    element: <OpenLayout />,
    errorElement: <Error />,
    children: [
      {
        index:true,
        element: <Landing />,
        errorElement: <Error />,
      },
      {
        path: "login",
        element: <Login />,
        errorElement: <Error />,
      },
      {
        path: "signup",
        element: <Signup />,
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
      {
        path: "dashboard",
        element: <Dashboard />,
        errorElement: <Error />,
      },
    ],
  },
];
