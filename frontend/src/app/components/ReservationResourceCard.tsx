import { Users, Zap } from "lucide-react";
import type { StudyResource } from "../data/enhancedMockData";

type ResourceBadge = {
  label: string;
  tone?: "default" | "danger" | "warm";
};

export function ReservationResourceCard({
  extraBadges = [],
  resource,
  selected,
  unavailableReason,
  onSelect,
}: {
  extraBadges?: ResourceBadge[];
  resource: StudyResource;
  selected: boolean;
  unavailableReason?: string;
  onSelect: () => void;
}) {
  const canChoose = !unavailableReason;

  return (
    <article className={`grid gap-4 border-b border-walnut/5 p-4 transition-colors last:border-b-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.8fr)_auto] sm:items-center sm:px-5 ${canChoose ? "bg-parchment hover:bg-walnut/[0.025]" : "bg-walnut/5 opacity-75"} ${selected ? "relative z-10 bg-oxblood/[0.04] ring-2 ring-inset ring-oxblood/25" : ""}`}>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-walnut/40">
            Floor {resource.floor} - {resource.zone_location}
          </p>
          <StatusBadge status={resource.current_status} />
        </div>
        <h3 className="truncate text-xl font-serif">{resource.resource_name}</h3>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-medium text-walnut/60">
        {resource.has_power_outlet && <span className="flex items-center gap-1.5 rounded-md bg-walnut/5 px-2 py-1"><Zap className="h-3.5 w-3.5 fill-candlelight text-candlelight" aria-hidden="true" /> Power Ready</span>}
        {resource.capacity && <span className="flex items-center gap-1.5 rounded-md bg-walnut/5 px-2 py-1"><Users className="h-3.5 w-3.5" aria-hidden="true" /> Fits {resource.capacity}</span>}
        {resource.min_participants && resource.min_participants > 1 && <span className="flex items-center gap-1.5 rounded-md bg-walnut/5 px-2 py-1"><Users className="h-3.5 w-3.5" aria-hidden="true" /> Min {resource.min_participants}</span>}
        {extraBadges.map((badge) => <ResourceBadgePill key={badge.label} badge={badge} />)}
        {unavailableReason && <span className="rounded-md bg-oxblood/10 px-2 py-1 text-oxblood">{unavailableReason}</span>}
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="text-[10px] uppercase tracking-widest text-walnut/35">{resource.resource_id}</span>
        <button
          type="button"
          onClick={onSelect}
          disabled={!canChoose}
          className={`rounded-lg px-5 py-2 text-sm font-semibold tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 ${
            canChoose ? "bg-walnut text-parchment hover:bg-oxblood" : "cursor-not-allowed bg-walnut/10 text-walnut/40"
          }`}
        >
          {selected ? "Selected" : canChoose ? "Select" : unavailableReason ?? "Locked"}
        </button>
      </div>
    </article>
  );
}

function ResourceBadgePill({ badge }: { badge: ResourceBadge }) {
  const styles = {
    default: "bg-walnut/5 text-walnut/60",
    danger: "bg-oxblood/10 text-oxblood",
    warm: "bg-candlelight/15 text-walnut",
  }[badge.tone ?? "default"];

  return <span className={`rounded-md px-2 py-1 ${styles}`}>{badge.label}</span>;
}

function StatusBadge({ status }: { status: StudyResource["current_status"] }) {
  const styles: Record<StudyResource["current_status"], string> = {
    Available: "bg-moss/10 text-moss",
    Occupied: "bg-walnut/10 text-walnut/50",
    Reserved: "bg-oxblood/10 text-oxblood",
    "Under Maintenance": "bg-candlelight/15 text-walnut",
    "Maintenance Pending": "bg-candlelight/15 text-walnut",
  };

  return <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${styles[status]}`}>{status}</span>;
}
