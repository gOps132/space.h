import { Link } from "react-router";
import { BookOpen, CheckCircle2, Clock, Eye, HelpCircle, LogIn, MapPin, Search } from "lucide-react";
import heroLibraryImage from "../../../assets/girl-reading-1.jpg";

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-24">
      <section className="relative overflow-hidden py-16 sm:py-20 lg:min-h-[calc(100dvh-4rem)] lg:py-0">
        <div className="mx-auto grid min-h-[inherit] w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.85fr)] lg:px-8">
          <div className="max-w-4xl py-8 lg:py-0">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-walnut/10 bg-parchment/70 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-walnut/50">
              <BookOpen className="h-4 w-4 text-oxblood" aria-hidden="true" />
              University Library Space System
            </p>
            <h1 className="mb-8 max-w-5xl text-5xl font-serif leading-[1.05] text-walnut text-balance sm:text-6xl lg:text-7xl">
              Find an open library seat. <br />
              <span className="italic text-oxblood">Right now.</span>
            </h1>
            <p className="mb-12 max-w-2xl text-lg leading-relaxed text-walnut/70 sm:text-xl">
              Check live availability, reserve a desk or room, and keep library spaces moving fairly during peak hours.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/student"
                className="flex items-center gap-2 rounded-full bg-oxblood px-6 py-3 font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30"
              >
                <LogIn className="h-5 w-5" aria-hidden="true" />
                Log In to Reserve
              </Link>
              <Link
                to="/guest"
                className="flex items-center gap-2 rounded-full border border-walnut/20 px-6 py-3 font-medium text-walnut transition-colors hover:border-walnut hover:bg-walnut/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30"
              >
                <Eye className="h-5 w-5" aria-hidden="true" />
                Guest Availability
              </Link>
            </div>
          </div>

          <figure className="academic-border premium-shadow relative min-h-[420px] overflow-hidden rounded-lg bg-walnut text-parchment lg:min-h-[560px]" aria-label="Student reading in a quiet library">
            <img
              src={heroLibraryImage}
              alt="Student reading at a library table."
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(45,36,30,0.04)_0%,rgba(45,36,30,0.12)_48%,rgba(45,36,30,0.82)_100%)]" aria-hidden="true" />

            <figcaption className="absolute inset-x-0 bottom-0 p-6">
              <div className="grid gap-4 border-t border-parchment/25 pt-5 text-sm sm:grid-cols-3">
                <WorkflowNote icon={Search} title="Find" desc="Browse open spaces before walking floors." />
                <WorkflowNote icon={Clock} title="Hold" desc="Reserve a seat or room with clear limits." />
                <WorkflowNote icon={CheckCircle2} title="Release" desc="Check out so the next person can sit." />
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-walnut/5 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-20 max-w-2xl text-center">
            <h2 className="mb-6 text-4xl font-serif">How Space.h Works</h2>
            <p className="text-walnut/60">A simple flow for fair reservations, check-ins, and check-outs.</p>
          </div>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-4">
            <Step icon={Search} title="Find a Space" desc="Filter by floor, zone, or power availability." />
            <Step icon={Clock} title="Reserve Slot" desc="Pick a time. Individual seats are limited to 4 hours." />
            <Step icon={MapPin} title="Check In" desc="Arrive within 15 minutes to secure your reservation." />
            <Step icon={CheckCircle2} title="Check Out" desc="Release the space for the next person when finished." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <h2 className="text-4xl font-serif">Library Rules That Matter</h2>
            <div className="space-y-6">
              <RuleItem title="One Active Reservation" desc="Students can hold one active booking at a time." />
              <RuleItem title="15-Minute Grace Period" desc="Late check-ins are cancelled automatically." />
              <RuleItem title="Maximum 4 Hour Blocks" desc="Individual seats stay fair during peak periods." />
              <RuleItem title="Missed Checkout Penalty" desc="Forgotten check-outs can trigger a 24-hour booking hold." />
            </div>
            <Link to="/about" className="inline-flex font-medium text-oxblood underline underline-offset-4 transition-colors hover:text-walnut">
              Read Full Library Access Policy
            </Link>
          </div>

          <div className="academic-border rounded-2xl bg-walnut p-10 text-parchment/80">
            <div className="mb-8 flex items-center gap-4 text-parchment">
              <HelpCircle className="h-8 w-8 text-candlelight" aria-hidden="true" />
              <h3 className="text-2xl font-serif">Frequently Asked</h3>
            </div>
            <div className="space-y-8">
              <FAQItem q="Can I book for a friend?" a="No. Reservations are tied to individual university accounts for occupancy tracking." />
              <FAQItem q="What if a seat is occupied but shows available?" a="Report it from the student dashboard so library staff can investigate." />
              <FAQItem q="Do guests need an account?" a="Guests can view live occupancy but cannot reserve spaces." />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function WorkflowNote({ icon: Icon, title, desc }: { icon: typeof Search; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-candlelight" strokeWidth={1.75} aria-hidden="true" />
      <div>
        <p className="font-semibold text-parchment">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-parchment/72">{desc}</p>
      </div>
    </div>
  );
}

function Step({ icon: Icon, title, desc }: { icon: typeof Search; title: string; desc: string }) {
  return (
    <div className="academic-border rounded-2xl bg-parchment p-8 text-center shadow-[0_4px_20px_rgba(45,36,30,0.06)] md:border-none md:bg-transparent md:shadow-none">
      <div className="academic-border premium-shadow mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-parchment">
        <Icon className="h-6 w-6 text-oxblood" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="mb-4 text-xl font-serif">{title}</h3>
      <p className="text-sm leading-relaxed text-walnut/60">{desc}</p>
    </div>
  );
}

function RuleItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-oxblood" />
      <div>
        <h3 className="font-sans text-base font-semibold text-walnut">{title}</h3>
        <p className="text-sm text-walnut/60">{desc}</p>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="space-y-2">
      <h4 className="font-serif text-lg text-parchment">{q}</h4>
      <p className="text-sm leading-relaxed text-parchment/60">{a}</p>
    </div>
  );
}
