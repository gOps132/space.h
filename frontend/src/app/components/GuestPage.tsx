import { Link } from "react-router";
import { LogIn, MapPin, Users } from "lucide-react";
import { enhancedResources, getFloorHeatmap } from "../data/enhancedMockData";

export default function GuestPage() {
  const floorData = getFloorHeatmap();
  const occupied = enhancedResources.filter((resource) => resource.current_status === "Occupied" || resource.current_status === "Reserved").length;
  const occupancyPercent = Math.round((occupied / enhancedResources.length) * 100);
  const availableSeats = enhancedResources.filter((resource) => resource.resource_type === "Individual Seat" && resource.current_status === "Available").length;
  const availableRooms = enhancedResources.filter((resource) => resource.resource_type === "Group Study Room" && resource.current_status === "Available").length;

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <h1 className="mb-6 text-5xl font-serif leading-tight text-walnut text-balance">Library Live Occupancy</h1>
          <p className="text-lg italic text-walnut/60">
            Public real-time dashboard. Last synchronized {new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date())}.
          </p>
        </div>
        <Link
          to="/student"
          className="flex shrink-0 items-center gap-2 rounded-full bg-oxblood px-8 py-4 font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30"
        >
          <LogIn className="h-5 w-5" aria-hidden="true" />
          Log In to Reserve
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="academic-border premium-shadow rounded-2xl bg-parchment p-8 lg:col-span-2">
          <h2 className="mb-8 border-b border-walnut/10 pb-4 text-2xl font-serif">Real-Time Space Availability</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {enhancedResources.map((space) => (
              <div key={space.resource_id} className="rounded-xl border border-walnut/10 bg-walnut/5 p-4 text-center">
                <p className="mb-2 truncate text-xs font-bold uppercase leading-none tracking-widest text-walnut/40">{space.resource_id}</p>
                <p className="line-clamp-1 text-xs text-walnut/50">{space.resource_name}</p>
                <div className={`mt-3 text-xs font-bold uppercase tracking-widest ${space.current_status === "Available" ? "text-moss" : "text-oxblood/60"}`}>
                  {space.current_status === "Available" ? "Open" : space.current_status}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <section className="rounded-2xl bg-walnut p-8 text-parchment/65">
            <h2 className="mb-6 text-xl font-serif text-parchment">Library Stats</h2>
            <div className="space-y-4">
              <StatRow label="Overall Occupancy" value={`${occupancyPercent}%`} />
              <StatRow label="Seats Available" value={availableSeats} />
              <StatRow label="Rooms Available" value={availableRooms} />
              <StatRow label="Next Peak Hour" value="14:00" />
            </div>
            <p className="mt-6 border-t border-parchment/10 pt-6 text-xs italic leading-relaxed">
              Occupancy data refreshes from the reservation and attendance logs used by the student and admin dashboards.
            </p>
          </section>

          <section className="rounded-2xl border border-candlelight/20 bg-candlelight/[0.05] p-8">
            <h2 className="mb-4 text-lg font-serif">Floor Snapshot</h2>
            <div className="space-y-4">
              {floorData.map((floor) => (
                <div key={floor.floor} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-walnut/60">
                      <MapPin className="h-4 w-4 text-oxblood" aria-hidden="true" />
                      Floor {floor.floor}
                    </span>
                    <span className="font-medium tabular-nums">{floor.available} open</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-walnut/10">
                    <div className="h-full rounded-full bg-oxblood" style={{ width: `${floor.occupancyRate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-walnut/10 bg-parchment p-8">
            <h2 className="mb-4 text-lg font-serif">Quick Access</h2>
            <div className="space-y-2 text-sm text-walnut/60">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-oxblood" aria-hidden="true" /> Main Library Center</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4 text-oxblood" aria-hidden="true" /> {enhancedResources.length} Tracked Spaces</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-parchment/5 py-2">
      <span className="text-xs uppercase tracking-widest">{label}</span>
      <span className="font-serif text-xl text-parchment tabular-nums">{value}</span>
    </div>
  );
}
