import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[560px] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 rounded-full bg-oxblood/10 p-4 text-oxblood">
        <ShieldAlert className="h-10 w-10" aria-hidden="true" />
      </div>
      <h1 className="mb-4 text-4xl font-serif text-walnut">Access restricted</h1>
      <p className="mb-8 max-w-xl leading-relaxed text-walnut/60">
        This area needs a different library role. Sign in with an authorized account or return to public availability.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/login" className="rounded-xl bg-oxblood px-6 py-3 text-sm font-medium text-parchment transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25">
          Log In
        </Link>
        <Link to="/guest" className="rounded-xl border border-walnut/15 px-6 py-3 text-sm font-medium text-walnut transition-colors hover:border-walnut/30 hover:bg-walnut/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25">
          Live Availability
        </Link>
      </div>
    </div>
  );
}
