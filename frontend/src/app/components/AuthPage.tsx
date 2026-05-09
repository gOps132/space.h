import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { BookOpen, GraduationCap, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ApiError, login } from "../api/client";

const rolePresets = [
  { label: "Student", id: "24-0001-01", password: "library-pass", icon: BookOpen, note: "Reserve seats and study rooms." },
  { label: "Faculty", id: "23-1024", password: "compiler-pass", icon: GraduationCap, note: "Book consultation rooms." },
  { label: "Admin", id: "22-7777-03", password: "orbit-pass", icon: Shield, note: "Monitor library operations." },
];

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignup = location.pathname === "/signup";
  const redirectTo = new URLSearchParams(location.search).get("redirect");
  const [universityId, setUniversityId] = useState("");
  const [password, setPassword] = useState("");
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
        setError("Log in failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
      <section className="flex min-h-[480px] flex-col justify-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-oxblood">{isSignup ? "Access desk" : "Library account"}</p>
        <h1 className="mb-6 max-w-2xl text-4xl font-serif leading-tight text-walnut text-balance sm:text-5xl">
          {isSignup ? "Request library access." : "Return to your reservation desk."}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-walnut/65">
          {isSignup ? "Bring your university ID to the library desk so staff can create your account." : "Use your university ID to reserve spaces, check in, and manage bookings."}
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="Demo account presets">
          {rolePresets.map((role) => (
            <RolePreset
              key={role.label}
              {...role}
              disabled={isSignup || isSubmitting}
              onSelect={() => {
                setUniversityId(role.id);
                setPassword(role.password);
                setError("");
                setFieldError("");
              }}
            />
          ))}
        </div>
      </section>

      <aside className="academic-border premium-shadow h-fit rounded-lg bg-card p-8">
        <h2 className="mb-2 text-2xl font-serif">{isSignup ? "Access Request" : "Log In"}</h2>
        <p id="auth-demo-note" className="mb-8 text-sm text-walnut/60">
          {isSignup ? "Online requests are closed for now. Library staff can help in person." : "Sign in with the university ID and password issued by the library."}
        </p>
        <form className="space-y-4" aria-describedby="auth-demo-note auth-error" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">University ID</span>
            <input
              className="academic-border w-full rounded-lg bg-muted/40 px-4 py-3 text-sm text-walnut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="University ID"
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
            {isSignup ? "Request Access In Person" : isSubmitting ? "Logging In..." : "Log In"}
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

function RolePreset({
  disabled,
  icon: Icon,
  label,
  note,
  onSelect,
}: {
  disabled: boolean;
  icon: LucideIcon;
  label: string;
  note: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className="academic-border min-h-24 rounded-xl bg-parchment p-4 text-left transition-colors hover:border-oxblood/30 hover:bg-oxblood/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-walnut">
        <Icon className="h-4 w-4 text-oxblood" aria-hidden="true" />
        {label}
      </span>
      <span className="block text-xs leading-relaxed text-walnut/55">{note}</span>
    </button>
  );
}
