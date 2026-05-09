import { Link } from "react-router";
import { BarChart3, BookOpen, Calendar, CheckCircle2, GraduationCap, Library, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BusinessRulesInfo from "./BusinessRulesInfo";

const audiences = [
  { title: "Guests", icon: Library, text: "Check public availability before walking to the library." },
  { title: "Students", icon: BookOpen, text: "Find seats, reserve rooms, check in, and check out." },
  { title: "Faculty", icon: GraduationCap, text: "Reserve consultation rooms for student meetings." },
  { title: "Library Staff", icon: Shield, text: "Monitor occupancy, update status, and release unused bookings." },
];

const actions = [
  { title: "Reserve a space", icon: Calendar, text: "Choose an available seat or room, pick a time, and confirm before it disappears." },
  { title: "Check in and out", icon: CheckCircle2, text: "Confirm actual use when you arrive, then release the space when you leave." },
  { title: "Watch operations", icon: BarChart3, text: "Staff can see occupancy, peak hours, maintenance needs, and space status." },
];

export default function AboutLibSpace() {
  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-end">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-oxblood">About Space.h</p>
          <h1 className="max-w-3xl text-4xl font-serif leading-tight text-walnut text-balance sm:text-5xl">
            Less searching, more studying.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-walnut/65">
            Space.h shows which desks and rooms are available before students walk every floor during midterms, finals, or a crowded afternoon.
          </p>
        </div>

        <aside className="academic-border rounded-2xl bg-walnut p-6 text-parchment/70">
          <div className="mb-5 flex items-center gap-3 text-parchment">
            <BookOpen className="h-5 w-5 text-candlelight" aria-hidden="true" />
            <h2 className="text-xl font-serif">Name note</h2>
          </div>
          <p className="text-sm leading-relaxed">
            In C programming, library headers end in `.h`. Space.h points to library space and the rules that keep shared rooms fair.
          </p>
        </aside>
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)] lg:items-start">
        <div>
          <h2 className="text-3xl font-serif">Who Uses It</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-walnut/60">
            Public browsing, student booking, faculty rooms, and operations work stay distinct.
          </p>
        </div>

        <div className="academic-border overflow-hidden rounded-2xl bg-parchment">
          {audiences.map((audience) => (
            <AudienceRow key={audience.title} {...audience} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {actions.map((action) => (
          <ActionPanel key={action.title} {...action} />
        ))}
      </section>

      <section>
        <BusinessRulesInfo />
      </section>

      <section className="grid gap-8 rounded-2xl bg-walnut/5 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <h2 className="text-2xl font-serif">Open a Workspace</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-walnut/60">
            Start with public availability, or sign in to use role-specific tools.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <WorkspaceLink to="/guest" label="Live Availability" tone="secondary" />
          <WorkspaceLink to="/login" label="Log In" tone="primary" />
        </div>
      </section>
    </div>
  );
}

function AudienceRow({ icon: Icon, text, title }: { icon: LucideIcon; text: string; title: string }) {
  return (
    <article className="grid gap-3 border-b border-walnut/5 p-5 last:border-b-0 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-walnut/5">
        <Icon className="h-5 w-5 text-oxblood" aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-serif text-xl text-walnut">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-walnut/60">{text}</p>
      </div>
    </article>
  );
}

function ActionPanel({ icon: Icon, text, title }: { icon: LucideIcon; text: string; title: string }) {
  return (
    <article className="academic-border rounded-xl bg-parchment p-5">
      <Icon className="mb-5 h-5 w-5 text-oxblood" aria-hidden="true" />
      <h3 className="font-serif text-xl text-walnut">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-walnut/60">{text}</p>
    </article>
  );
}

function WorkspaceLink({ label, tone, to }: { label: string; tone: "primary" | "secondary"; to: string }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25 ${
        tone === "primary"
          ? "bg-oxblood text-parchment hover:bg-oxblood/90"
          : "border border-walnut/15 text-walnut hover:border-walnut/30 hover:bg-walnut/5"
      }`}
    >
      {label}
    </Link>
  );
}
