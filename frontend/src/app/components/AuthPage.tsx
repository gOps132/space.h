import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { BookOpen, GraduationCap, Library, Shield } from "lucide-react";
import { ApiError, login } from "../api/client";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignup = location.pathname === "/signup";
  const redirectTo = new URLSearchParams(location.search).get("redirect");
  const [universityId, setUniversityId] = useState("24-0001-01");
  const [password, setPassword] = useState("library-pass");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSignup) return;

    setError("");
    setFieldError("");
    setIsSubmitting(true);

    try {
      const session = await login(universityId, password);
      const fallback = session.user.role === "ADMIN" ? "/admin" : session.user.role === "FACULTY" ? "/faculty" : "/student";
      const destination = allowedRedirect(redirectTo, session.user.role) ? redirectTo! : fallback;
      navigate(destination);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setFieldError(caught.fieldErrors?.universityId ?? "");
      } else {
        setError("Sign-in failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <section className="flex min-h-[520px] flex-col justify-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-oxblood">{isSignup ? "Request Access" : "Welcome Back"}</p>
        <h1 className="mb-6 max-w-2xl text-5xl font-serif leading-tight text-walnut text-balance">
          {isSignup ? "Join the library space system." : "Return to your reservation desk."}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-walnut/65">
          {isSignup ? "Access requests still route through library operations." : "Use your university ID to enter the live reservation workflow."}
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
          {isSignup ? "Ask library operations to create your account." : "Demo users are seeded by the PHP backend for local testing."}
        </p>
        <form className="space-y-4" aria-describedby="auth-demo-note auth-error" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">University ID</span>
            <input
              className="academic-border w-full rounded-lg bg-muted/40 px-4 py-3 text-sm text-walnut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="24-0001-01"
              value={universityId}
              onChange={(event) => setUniversityId(event.target.value)}
              disabled={isSignup || isSubmitting}
              aria-invalid={fieldError ? true : undefined}
            />
            {fieldError && <span className="block px-1 text-xs text-oxblood">{fieldError}</span>}
          </label>
          <label className="block space-y-2">
            <span className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">Password</span>
            <input
              type="password"
              className="academic-border w-full rounded-lg bg-muted/40 px-4 py-3 text-sm text-walnut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSignup || isSubmitting}
            />
          </label>
          {error && (
            <p id="auth-error" className="rounded-lg border border-oxblood/20 bg-oxblood/5 px-4 py-3 text-sm text-oxblood">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg border border-walnut/10 bg-oxblood py-3 font-medium text-parchment transition-colors hover:bg-oxblood/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-walnut/45"
            disabled={isSignup || isSubmitting}
          >
            {isSignup ? "Access Requests Disabled" : isSubmitting ? "Signing In..." : "Sign In"}
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

function allowedRedirect(redirectTo: string | null, role: "STUDENT" | "FACULTY" | "ADMIN" | "GUEST") {
  if (!redirectTo?.startsWith("/") || redirectTo.startsWith("//")) {
    return false;
  }

  if (redirectTo.startsWith("/admin")) return role === "ADMIN";
  if (redirectTo.startsWith("/faculty")) return role === "FACULTY" || role === "ADMIN";
  if (redirectTo.startsWith("/student")) return role === "STUDENT" || role === "ADMIN";
  return true;
}

function RoleLink({ to, icon: Icon, label }: { to: string; icon: typeof Library; label: string }) {
  return (
    <Link to={to} className="academic-border flex items-center gap-3 rounded-2xl bg-parchment p-4 text-sm font-medium text-walnut transition-colors hover:border-oxblood/30 hover:bg-oxblood/[0.03]">
      <Icon className="h-5 w-5 text-oxblood" aria-hidden="true" />
      {label}
    </Link>
  );
}
