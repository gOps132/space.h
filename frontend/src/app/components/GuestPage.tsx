import { Link } from "react-router";
import { LogIn, MapPin, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getResources } from "../api/client";
import { enhancedResources, type StudyResource } from "../data/enhancedMockData";
import { LoadMoreFooter } from "./ListControls";

const PUBLIC_RESOURCE_BATCH_SIZE = 10;

export default function GuestPage() {
  const [resources, setResources] = useState<StudyResource[]>(enhancedResources);
  const [syncState, setSyncState] = useState<"live" | "fallback">("fallback");
  const [visibleResourceCount, setVisibleResourceCount] = useState(PUBLIC_RESOURCE_BATCH_SIZE);

  useEffect(() => {
    getResources()
      .then((nextResources) => {
        setResources(nextResources.length > 0 ? nextResources : enhancedResources);
        setSyncState("live");
      })
      .catch(() => {
        setResources(enhancedResources);
        setSyncState("fallback");
      });
  }, []);

  useEffect(() => {
    setVisibleResourceCount(PUBLIC_RESOURCE_BATCH_SIZE);
  }, [resources.length]);

  const floorData = useMemo(() => getFloorHeatmap(resources), [resources]);
  const occupied = resources.filter((resource) => resource.current_status === "Occupied" || resource.current_status === "Reserved" || resource.current_status === "Maintenance Pending").length;
  const occupancyPercent = Math.round((occupied / resources.length) * 100);
  const availableSeats = resources.filter((resource) => resource.resource_type === "Individual Seat" && resource.current_status === "Available").length;
  const availableRooms = resources.filter((resource) => resource.resource_type === "Group Study Room" && resource.current_status === "Available").length;
  const visibleResources = resources.slice(0, visibleResourceCount);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-serif leading-tight text-walnut text-balance sm:text-5xl">Live Space Availability</h1>
          <p className="text-base italic text-walnut/60">
            Last updated {new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date())}.
          </p>
          <p className="mt-3 text-sm text-walnut/45">
            {syncState === "live" ? "Showing live counts" : "Showing latest saved counts"}
          </p>
        </div>
        <Link
          to="/student"
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-oxblood px-6 font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/30"
        >
          <LogIn className="h-5 w-5" aria-hidden="true" />
          Log In to Reserve
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="academic-border premium-shadow overflow-hidden rounded-2xl bg-parchment lg:col-span-2">
          <div className="flex items-center justify-between gap-4 border-b border-walnut/10 p-5 sm:p-6">
            <h2 className="text-2xl font-serif">Open Seats and Rooms</h2>
            <span className="text-sm text-walnut/45">{resources.length} tracked</span>
          </div>
          <div className="max-h-[42rem] divide-y divide-walnut/5 overflow-y-auto">
            {visibleResources.map((space) => (
              <SpaceRow key={space.resource_id} space={space} />
            ))}
            <LoadMoreFooter
              label="spaces"
              totalItems={resources.length}
              visibleItems={visibleResources.length}
              onLoadMore={() => setVisibleResourceCount((count) => count + PUBLIC_RESOURCE_BATCH_SIZE)}
            />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl bg-walnut p-6 text-parchment/65">
            <h2 className="mb-6 text-xl font-serif text-parchment">Today at a Glance</h2>
            <div className="space-y-4">
              <StatRow label="Overall Occupancy" value={`${occupancyPercent}%`} />
              <StatRow label="Seats Available" value={availableSeats} />
              <StatRow label="Rooms Available" value={availableRooms} />
              <StatRow label="Busiest Later" value="14:00" />
            </div>
            <p className="mt-6 border-t border-parchment/10 pt-6 text-xs italic leading-relaxed">
              Counts update as people reserve, check in, and check out.
            </p>
          </section>

          <section className="rounded-2xl border border-candlelight/20 bg-candlelight/[0.05] p-6">
            <h2 className="mb-4 text-lg font-serif">Floor Snapshot</h2>
            <div className="max-h-[22rem] space-y-4 overflow-y-auto pr-1">
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

          <section className="rounded-2xl border border-walnut/10 bg-parchment p-6">
            <h2 className="mb-4 text-lg font-serif">Library</h2>
            <div className="space-y-2 text-sm text-walnut/60">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-oxblood" aria-hidden="true" /> Main Library Center</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4 text-oxblood" aria-hidden="true" /> {resources.length} Tracked Spaces</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SpaceRow({ space }: { space: StudyResource }) {
  const open = space.current_status === "Available";

  return (
    <article className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="font-mono text-xs text-walnut/45">{space.resource_id}</p>
          <span className="text-xs text-walnut/35">Level {space.floor}</span>
        </div>
        <h3 className="truncate font-serif text-lg text-walnut">{space.resource_name}</h3>
        <p className="mt-1 text-sm text-walnut/50">{space.zone_location}</p>
      </div>
      <div className={`w-fit rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest ${open ? "bg-moss/10 text-moss" : "bg-oxblood/10 text-oxblood"}`}>
        {open ? "Open" : space.current_status}
      </div>
    </article>
  );
}

function getFloorHeatmap(resources: StudyResource[]) {
  const floors = Array.from(new Set(resources.map((resource) => resource.floor))).sort((a, b) => a - b);
  return floors.map((floor) => {
    const floorResources = resources.filter((resource) => resource.floor === floor);
    const total = floorResources.length;
    const occupied = floorResources.filter((resource) => resource.current_status === "Occupied" || resource.current_status === "Reserved" || resource.current_status === "Maintenance Pending").length;
    const available = floorResources.filter((resource) => resource.current_status === "Available").length;
    const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;

    return { floor, total, occupied, available, occupancyRate };
  });
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-parchment/5 py-2">
      <span className="text-xs uppercase tracking-widest">{label}</span>
      <span className="font-serif text-xl text-parchment tabular-nums">{value}</span>
    </div>
  );
}
