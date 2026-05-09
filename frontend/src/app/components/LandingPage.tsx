import { Link } from "react-router";
import { CheckCircle2, Clock, Eye, HelpCircle, LogIn, MapPin, Search } from "lucide-react";
import girlReadingImage from "../../../assets/girl-reading-1.webp";
import manReadingOneImage from "../../../assets/man-reading-1.webp";
import manReadingTwoImage from "../../../assets/man-reading-2.webp";
import manReadingThreeImage from "../../../assets/man-reading-3.webp";

const heroSlides = [
  girlReadingImage,
  manReadingOneImage,
  manReadingTwoImage,
  manReadingThreeImage,
];

export default function LandingPage() {
  return (
    <div className="pb-24">
      <section className="relative isolate min-h-[720px] overflow-hidden px-4 py-10 sm:min-h-[760px] sm:px-6 lg:min-h-[720px] lg:px-8 xl:min-h-[760px]">
        <div className="spaceh-hero-media absolute inset-x-0 bottom-0 h-[40%] overflow-hidden sm:h-[42%] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[60%]" aria-hidden="true">
          <div className="spaceh-hero-image-pane absolute inset-0">
            {heroSlides.map((slide, index) => (
              <img
                key={slide}
                src={slide}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="spaceh-hero-slide absolute inset-0 h-full w-full object-cover"
                style={{ animationDelay: `${index * 8 - 2}s` }}
              />
            ))}
            <div className="absolute inset-0 bg-parchment/5" />
            <div className="spaceh-hero-photo-bokeh absolute inset-0" />
          </div>
        </div>
        <div className="spaceh-hero-diagonal-blend absolute inset-0" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl items-start sm:min-h-[660px] lg:min-h-[640px] xl:min-h-[680px]">
          <div className="w-full pb-[47dvh] pt-14 sm:pt-16 lg:max-w-[50%] lg:pt-20 xl:max-w-[52%] xl:pt-24">
            <h1 className="spaceh-hero-title mb-7 max-w-3xl font-serif text-walnut text-balance">
              Find an open library seat. <br />
              <span className="italic text-oxblood">Right now.</span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-walnut/70 sm:text-xl">
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
        </div>
      </section>

      <section className="bg-walnut/5 pb-24 pt-14 lg:pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-6 text-4xl font-serif">Reserve a Space</h2>
            <p className="text-walnut/60">Find an open seat, hold it, check in, and release it when you leave.</p>
          </div>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-4">
            <Step icon={Search} title="Find a Space" desc="Filter by floor, zone, or power availability." />
            <Step icon={Clock} title="Reserve Slot" desc="Pick a time. Individual seats are limited to 4 hours." />
            <Step icon={MapPin} title="Check In" desc="Arrive within 15 minutes to secure your reservation." />
            <Step icon={CheckCircle2} title="Check Out" desc="Release the space for the next person when finished." />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
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
              View Library Access Rules
            </Link>
          </div>

          <div className="academic-border rounded-2xl bg-walnut p-10 text-parchment/80">
            <div className="mb-8 flex items-center gap-4 text-parchment">
              <HelpCircle className="h-8 w-8 text-candlelight" aria-hidden="true" />
              <h3 className="text-2xl font-serif">Frequently Asked</h3>
            </div>
            <div className="space-y-8">
              <FAQItem q="Can I book for a friend?" a="No. Reservations are tied to individual university accounts for occupancy tracking." />
              <FAQItem q="What if an open seat is taken?" a="Report the mismatch from your student account so library staff can check the space." />
              <FAQItem q="Do guests need an account?" a="Guests can view live occupancy but cannot reserve spaces." />
            </div>
          </div>
        </div>
      </section>
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
