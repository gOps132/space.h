import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import HiddenArchiveLanding from "./components/HiddenArchiveLanding";
import StudentDashboard from "./components/StudentDashboard";
import FacultyDashboard from "./components/FacultyDashboard";
import EnhancedAdminDashboard from "./components/EnhancedAdminDashboard";
import AboutLibSpace from "./components/AboutLibSpace";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HiddenArchiveLanding },
      { path: "student", Component: StudentDashboard },
      { path: "faculty", Component: FacultyDashboard },
      { path: "admin", Component: EnhancedAdminDashboard },
      { path: "about", Component: AboutLibSpace },
      { path: "login", Component: HiddenArchiveLanding },
      { path: "signup", Component: HiddenArchiveLanding },
    ],
  },
]);