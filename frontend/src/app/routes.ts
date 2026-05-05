import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import Root from "./components/Root";

type RouteModule = { default: ComponentType };

const routeComponent = (loader: () => Promise<RouteModule>) => async () => {
  const module = await loader();
  return { Component: module.default };
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, lazy: routeComponent(() => import("./components/LandingPage")) },
      { path: "guest", lazy: routeComponent(() => import("./components/GuestPage")) },
      { path: "student", lazy: routeComponent(() => import("./components/StudentDashboard")) },
      { path: "faculty", lazy: routeComponent(() => import("./components/FacultyDashboard")) },
      { path: "admin", lazy: routeComponent(() => import("./components/EnhancedAdminDashboard")) },
      { path: "about", lazy: routeComponent(() => import("./components/AboutLibSpace")) },
      { path: "login", lazy: routeComponent(() => import("./components/AuthPage")) },
      { path: "signup", lazy: routeComponent(() => import("./components/AuthPage")) },
    ],
  },
]);
