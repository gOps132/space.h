import type { ComponentType } from "react";
import { createBrowserRouter, redirect } from "react-router";
import Root from "./components/Root";
import { clearSession, currentUser, getStoredToken, type CurrentUser } from "./api/client";

type RouteModule = { default: ComponentType };
type Role = CurrentUser["role"];

const routeComponent = (loader: () => Promise<RouteModule>) => async () => {
  const module = await loader();
  return { Component: module.default };
};

const requireRoles = (roles: Role[]) => async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const redirectTo = `${url.pathname}${url.search}`;

  if (!getStoredToken()) {
    throw redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  let user: CurrentUser;
  try {
    user = await currentUser();
  } catch {
    clearSession();
    throw redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (user.accountStatus !== "ACTIVE") {
    clearSession();
    throw redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (!roles.includes(user.role)) {
    throw redirect("/unauthorized");
  }

  return null;
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, lazy: routeComponent(() => import("./components/LandingPage")) },
      { path: "guest", lazy: routeComponent(() => import("./components/GuestPage")) },
      { path: "student", loader: requireRoles(["STUDENT", "ADMIN"]), lazy: routeComponent(() => import("./components/StudentDashboard")) },
      { path: "faculty", loader: requireRoles(["FACULTY", "ADMIN"]), lazy: routeComponent(() => import("./components/FacultyDashboard")) },
      { path: "admin", loader: requireRoles(["ADMIN"]), lazy: routeComponent(() => import("./components/EnhancedAdminDashboard")) },
      { path: "about", lazy: routeComponent(() => import("./components/AboutLibSpace")) },
      { path: "login", lazy: routeComponent(() => import("./components/AuthPage")) },
      { path: "signup", lazy: routeComponent(() => import("./components/AuthPage")) },
      { path: "unauthorized", lazy: routeComponent(() => import("./components/UnauthorizedPage")) },
    ],
  },
]);
