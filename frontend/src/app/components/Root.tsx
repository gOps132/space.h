import { Link, NavLink, Outlet, useLocation } from "react-router";
import { BookOpen, GraduationCap, Library, LogIn, LogOut, Menu, Settings, User, X } from "lucide-react";
import { useState } from "react";
import { clearSession, getStoredUser } from "../api/client";

export default function Root() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentUser = getStoredUser();

  const navItems = [
    { label: "Guest View", to: "/guest", icon: Library },
    { label: "Student", to: "/student", icon: User },
    { label: "Faculty", to: "/faculty", icon: GraduationCap },
    { label: "Admin", to: "/admin", icon: Settings },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);
  const logOut = () => {
    clearSession();
    closeMenu();
  };

  return (
    <div className="min-h-screen bg-parchment text-walnut selection:bg-oxblood/10 selection:text-oxblood">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-walnut focus:px-4 focus:py-2 focus:text-parchment"
      >
        Skip to Main Content
      </a>

      <header className="sticky top-0 z-50 border-b border-walnut/10 bg-parchment shadow-[0_1px_0_rgba(45,36,30,0.03)]">
        <nav aria-label="Primary navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" onClick={closeMenu} className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30">
            <BookOpen className="h-6 w-6 shrink-0 text-oxblood" strokeWidth={1.5} aria-hidden="true" />
            <span className="font-serif text-xl font-semibold tracking-tight text-walnut" translate="no">
              Space.<span className="text-oxblood">h</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30 ${
                    isActive ? "text-oxblood" : "text-walnut/60 hover:text-walnut"
                  }`
                }
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
            {currentUser ? (
              <Link
                to="/login"
                onClick={logOut}
                className="flex items-center gap-2 rounded-xl bg-walnut px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log Out
              </Link>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30 ${
                    isActive || location.pathname === "/signup"
                      ? "bg-oxblood text-parchment"
                      : "bg-walnut text-parchment hover:bg-oxblood"
                  }`
                }
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Log In
              </NavLink>
            )}
          </div>

          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="rounded-full p-2 text-walnut transition-colors hover:bg-walnut/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30 md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </nav>

        {isMobileMenuOpen && (
          <div className="border-t border-walnut/10 bg-parchment px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30 ${
                      isActive ? "bg-oxblood/10 text-oxblood" : "text-walnut/70 hover:bg-walnut/5 hover:text-walnut"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
              {currentUser ? (
                <Link
                  to="/login"
                  onClick={logOut}
                  className="flex items-center gap-2 rounded-lg bg-walnut px-2 py-2 text-sm font-medium text-parchment"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Log Out
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded-lg bg-oxblood px-2 py-2 text-sm font-medium text-parchment"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Log In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="mt-24 bg-walnut py-12 text-parchment/65">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-candlelight" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-serif text-xl font-semibold tracking-tight text-parchment" translate="no">Space.h</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed">
                Real-time library space management for students, faculty, guests, and library operations teams.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-lg text-parchment">Library Hours</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4"><dt>Mon - Fri</dt><dd className="tabular-nums">08:00 - 22:00</dd></div>
                <div className="flex justify-between gap-4"><dt>Sat - Sun</dt><dd className="tabular-nums">10:00 - 18:00</dd></div>
                <div className="flex justify-between gap-4 text-candlelight"><dt>Public Holidays</dt><dd>Closed</dd></div>
              </dl>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-lg text-parchment">Contact & Help</h2>
              <ul className="space-y-2 text-sm">
                <li>Help Desk: <span className="tabular-nums">(555) 0123-4567</span></li>
                <li>Email: library-space@uni.edu</li>
                <li>Location: Central Campus, Bldg 4</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-parchment/10 pt-8 text-xs md:flex-row">
            <p>Copyright 2026 University Library Systems. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/about" className="underline underline-offset-4 transition-colors hover:text-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candlelight/40">
                About Space.h
              </Link>
              <Link to="/guest" className="underline underline-offset-4 transition-colors hover:text-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candlelight/40">
                Live Availability
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
