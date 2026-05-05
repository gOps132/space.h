import { Link, useLocation } from "react-router";
import { BookOpen, GraduationCap, Library, Shield } from "lucide-react";

export default function AuthPage() {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <section className="flex min-h-[520px] flex-col justify-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-oxblood">{isSignup ? "Request Access" : "Welcome Back"}</p>
        <h1 className="mb-6 max-w-2xl text-5xl font-serif leading-tight text-walnut text-balance">
          {isSignup ? "Join the library space system." : "Return to your reservation desk."}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-walnut/65">
          This is a demo auth surface. Use the role shortcuts to preview each library workflow while account sign-in is connected.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <RoleLink to="/student" icon={BookOpen} label="Student" />
          <RoleLink to="/faculty" icon={GraduationCap} label="Faculty" />
          <RoleLink to="/admin" icon={Shield} label="Admin" />
        </div>
      </section>

      <aside className="academic-border premium-shadow h-fit rounded-lg bg-card p-8">
        <h2 className="mb-2 text-2xl font-serif">{isSignup ? "Access Request" : "Log In"}</h2>
        <p id="auth-demo-note" className="mb-8 text-sm text-walnut/60">
          Form submission is disabled in this demo build. Role portals remain available for review.
        </p>
        <form className="space-y-4" aria-describedby="auth-demo-note" onSubmit={(event) => event.preventDefault()}>
          <label className="block space-y-2">
            <span className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">University Email</span>
            <input
              className="academic-border w-full rounded-lg bg-muted/40 px-4 py-3 text-sm text-walnut/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="name@univ.edu"
              disabled
            />
          </label>
          <label className="block space-y-2">
            <span className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">Password</span>
            <input
              type="password"
              className="academic-border w-full rounded-lg bg-muted/40 px-4 py-3 text-sm text-walnut/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="Password"
              disabled
            />
          </label>
          <button
            type="submit"
            className="w-full cursor-not-allowed rounded-lg border border-walnut/10 bg-muted py-3 font-medium text-walnut/45"
            disabled
          >
            {isSignup ? "Access Requests Disabled" : "Demo Sign-In Disabled"}
          </button>
        </form>
        <p className="mt-6 text-sm text-walnut/60">
          {isSignup ? "Already have access?" : "Need an account?"}{" "}
          <Link to={isSignup ? "/login" : "/signup"} className="font-medium text-oxblood underline underline-offset-4">
            {isSignup ? "Log in" : "Request access"}
          </Link>
        </p>
      </aside>
    </div>
  );
}

function RoleLink({ to, icon: Icon, label }: { to: string; icon: typeof Library; label: string }) {
  return (
    <Link to={to} className="academic-border flex items-center gap-3 rounded-2xl bg-parchment p-4 text-sm font-medium text-walnut transition-colors hover:border-oxblood/30 hover:bg-oxblood/[0.03]">
      <Icon className="h-5 w-5 text-oxblood" aria-hidden="true" />
      {label}
    </Link>
  );
}
