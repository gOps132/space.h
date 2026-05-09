import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Clock, Filter, MapPin, Search, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  enhancedAttendanceLogs,
  enhancedReservations,
  enhancedResources,
  type AttendanceLogTransaction,
  type ReservationTransaction,
  type StudyResource,
} from "../data/enhancedMockData";
import {
  ApiError,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  createReservation,
  currentUser as fetchCurrentUser,
  getAttendanceLogs,
  getReservations,
  getResources,
  type CurrentUser,
} from "../api/client";

export default function StudentDashboard() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [resources, setResources] = useState<StudyResource[]>(enhancedResources);
  const [reservations, setReservations] = useState<ReservationTransaction[]>(enhancedReservations);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogTransaction[]>(enhancedAttendanceLogs);
  const [isLoading, setIsLoading] = useState(true);
  const [filterFloor, setFilterFloor] = useState("all");
  const [filterZone, setFilterZone] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [powerOnly, setPowerOnly] = useState(false);
  const [selectedResource, setSelectedResource] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [coBookers, setCoBookers] = useState("");

  const refresh = async () => {
    const [user, nextResources, nextReservations, nextAttendanceLogs] = await Promise.all([
      fetchCurrentUser(),
      getResources(),
      getReservations(),
      getAttendanceLogs(),
    ]);
    setCurrentUser(user);
    setResources(nextResources.length > 0 ? nextResources : enhancedResources);
    setReservations(nextReservations);
    setAttendanceLogs(nextAttendanceLogs);
  };

  useEffect(() => {
    refresh()
      .catch(() => {
        toast.error("Live reservation data unavailable. Showing local fallback.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const activeReservation = reservations.find(
    (reservation) =>
      reservation.user_id === currentUser?.userId &&
      (reservation.booking_status === "Pending" || reservation.booking_status === "Active")
  );

  const activeCheckIn = attendanceLogs.find((log) => {
    const reservation = reservations.find((item) => item.reservation_id === log.reservation_id);
    return reservation?.user_id === currentUser?.userId && log.actual_check_out === null;
  });

  const activeResource = activeReservation
    ? resources.find((resource) => resource.resource_id === activeReservation.resource_id)
    : null;

  const isBanned = currentUser?.bannedUntil ? new Date(currentUser.bannedUntil) > new Date() : false;

  const zones = Array.from(new Set(resources.map((resource) => resource.zone_location)));
  const floors = Array.from(new Set(resources.map((resource) => resource.floor))).sort();

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.resource_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.resource_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFloor = filterFloor === "all" || resource.floor.toString() === filterFloor;
      const matchesZone = filterZone === "all" || resource.zone_location === filterZone;
      const matchesPower = !powerOnly || resource.has_power_outlet;

      return matchesSearch && matchesFloor && matchesZone && matchesPower;
    });
  }, [filterFloor, filterZone, powerOnly, resources, searchQuery]);

  const reservableResources = resources.filter((resource) => resource.current_status === "Available");

  const handleBooking = async (resourceId = selectedResource) => {
    if (activeReservation) {
      toast.error("You already have an active reservation. Only one booking at a time is allowed.");
      return;
    }

    if (isBanned) {
      toast.error("You are temporarily blocked from booking because of a missed checkout.");
      return;
    }

    if (!resourceId || !startTime || !endTime) {
      toast.error("Choose a resource plus start and end times.");
      return;
    }

    const resource = resources.find((item) => item.resource_id === resourceId);
    if (!resource || resource.current_status !== "Available") {
      toast.error("That space is no longer available.");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      toast.error("Choose a valid time range.");
      return;
    }

    if (resource.resource_type === "Individual Seat") {
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (hours > 4) {
        toast.error("Individual seats can only be booked for a maximum of 4 hours.");
        return;
      }
    }

    const coBookerIds = coBookers.split(",").map((id) => id.trim()).filter(Boolean);
    if (resource.resource_type === "Group Study Room" && !resource.is_faculty_exclusive && coBookerIds.length < 2) {
      toast.error("Group Study Rooms require at least 3 participants: you plus 2 others.");
      return;
    }

    const hasConflict = reservations.some((reservation) => {
      if (reservation.resource_id !== resourceId || reservation.booking_status === "Cancelled" || reservation.booking_status === "No-show") {
        return false;
      }
      const existingStart = new Date(reservation.start_time);
      const existingEnd = new Date(reservation.end_time);
      return start < existingEnd && end > existingStart;
    });

    if (hasConflict) {
      toast.error("This space is already booked during the selected time.");
      return;
    }

    try {
      await createReservation({
        resourceId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        coBookers: coBookerIds,
      });
      await refresh();
      setSelectedResource("");
      setStartTime("");
      setEndTime("");
      setCoBookers("");
      toast.success("Reservation created successfully.");
    } catch (caught) {
      toast.error(errorMessage(caught, "Reservation failed."));
    }
  };

  const handleCheckIn = async () => {
    if (!activeReservation) return;

    try {
      await checkInReservation(activeReservation.reservation_id);
      await refresh();
      toast.success("Checked in successfully.");
    } catch (caught) {
      toast.error(errorMessage(caught, "Check-in failed."));
    }
  };

  const handleCheckOut = async () => {
    if (!activeCheckIn) return;
    const reservation = reservations.find((item) => item.reservation_id === activeCheckIn.reservation_id);
    if (!reservation) return;

    try {
      await checkOutReservation(reservation.reservation_id);
      await refresh();
      toast.success("Checked out successfully.");
    } catch (caught) {
      toast.error(errorMessage(caught, "Check-out failed."));
    }
  };

  const handleCancelReservation = async () => {
    if (!activeReservation) return;
    const minutesUntilStart = (new Date(activeReservation.start_time).getTime() - Date.now()) / (1000 * 60);

    if (minutesUntilStart < 30) {
      toast.error("Reservations can only be cancelled at least 30 minutes before the start time.");
      return;
    }

    try {
      await cancelReservation(activeReservation.reservation_id);
      await refresh();
      toast.success("Reservation cancelled.");
    } catch (caught) {
      toast.error(errorMessage(caught, "Cancellation failed."));
    }
  };

  if (isLoading || currentUser === null) {
    return <div className="mx-auto max-w-7xl px-4 py-12 text-sm italic text-walnut/50 sm:px-6 lg:px-8">Loading live reservation desk...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-4xl font-serif">Student Dashboard</h1>
          <p className="font-serif text-lg italic leading-none text-walnut/60">Welcome back, {currentUser.fullName}.</p>
        </div>
        <div className="academic-border flex gap-4 rounded-2xl bg-walnut/5 p-4">
          <StatusMetric label="Account Status" value={currentUser.accountStatus} tone="moss" />
          <div className="w-px bg-walnut/10" />
          <StatusMetric label="Booking Hold" value={isBanned ? "Active" : "None"} tone={isBanned ? "oxblood" : "walnut"} />
        </div>
      </div>

      <section>
        <div className="mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-oxblood" aria-hidden="true" />
          <h2 className="text-2xl font-serif">Active Reservation</h2>
        </div>

        {activeReservation && activeResource ? (
          <div className="academic-border premium-shadow relative overflow-hidden rounded-2xl bg-walnut p-8 text-parchment">
            <div className="absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-oxblood/10" aria-hidden="true" />
            <div className="relative flex flex-col justify-between gap-12 md:flex-row">
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-widest text-parchment/40">Workspace</p>
                  <h3 className="text-3xl font-serif text-parchment">{activeResource.resource_name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-parchment/60">
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden="true" /> {activeResource.zone_location}</span>
                    {activeResource.has_power_outlet && <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" aria-hidden="true" /> Power Outlet</span>}
                    {activeResource.capacity && <span className="flex items-center gap-1.5"><Users className="h-4 w-4" aria-hidden="true" /> Fits {activeResource.capacity}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-widest text-parchment/40">Reservation Window</p>
                    <p className="font-mono text-lg tabular-nums">{formatRange(activeReservation.start_time, activeReservation.end_time)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-widest text-parchment/40">Status</p>
                    <div className="flex items-center gap-2 text-candlelight">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      <span className="text-sm font-medium">{activeReservation.booking_status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex min-w-[220px] flex-col justify-end gap-3">
                {activeCheckIn ? (
                  <button type="button" onClick={handleCheckOut} className="rounded-xl bg-oxblood py-4 font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candlelight/40">
                    Check Out Now
                  </button>
                ) : (
                  <button type="button" onClick={handleCheckIn} className="rounded-xl bg-oxblood py-4 font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candlelight/40">
                    Check In
                  </button>
                )}
                <button type="button" onClick={handleCancelReservation} className="rounded-xl border border-parchment/20 bg-parchment/10 py-4 font-medium text-parchment/80 transition-colors hover:bg-parchment/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candlelight/40">
                  Cancel Reservation
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-walnut/20 bg-walnut/5 p-12 text-center">
            <p className="italic text-walnut/45">No active reservations. Use the booking panel below to secure a space.</p>
          </div>
        )}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="w-full md:max-w-md">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-serif">
                <Search className="h-5 w-5 text-oxblood" aria-hidden="true" />
                Find an available seat
              </h2>
              <label htmlFor="resource-search" className="sr-only">Search by resource name or ID</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-walnut/25" aria-hidden="true" />
                <input
                  id="resource-search"
                  name="resource-search"
                  type="search"
                  placeholder="Search by seat number or feature..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="academic-border w-full rounded-xl bg-parchment py-4 pl-12 pr-4 transition-colors placeholder:text-walnut/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <SelectField label="Floor" value={filterFloor} onChange={setFilterFloor}>
                <option value="all">All Floors</option>
                {floors.map((floor) => <option key={floor} value={floor}>Floor {floor}</option>)}
              </SelectField>
              <SelectField label="Zone Type" value={filterZone} onChange={setFilterZone}>
                <option value="all">Any Zone</option>
                {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
              </SelectField>
              <label className="flex h-[46px] items-center gap-2 rounded-xl bg-walnut px-4 text-sm font-medium text-parchment">
                <input type="checkbox" checked={powerOnly} onChange={(event) => setPowerOnly(event.target.checked)} className="h-4 w-4 accent-candlelight" />
                <Filter className="h-4 w-4" aria-hidden="true" />
                Power
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((resource) => (
              <SpaceCard
                key={resource.resource_id}
                resource={resource}
                selected={selectedResource === resource.resource_id}
                onSelect={() => setSelectedResource(resource.resource_id)}
              />
            ))}
          </div>
        </div>

        <aside className="academic-border sticky top-24 h-fit rounded-2xl bg-parchment p-6 shadow-[0_4px_20px_rgba(45,36,30,0.06)]">
          <h2 className="mb-2 text-xl font-serif">Create Reservation</h2>
          <p className="mb-6 text-sm text-walnut/60">Select an open space, then choose a reservation window.</p>

          <div className="space-y-4">
            <SelectField label="Resource" value={selectedResource} onChange={setSelectedResource}>
              <option value="">Choose a space</option>
              {reservableResources.map((resource) => (
                <option key={resource.resource_id} value={resource.resource_id}>
                  {resource.resource_name}
                </option>
              ))}
            </SelectField>

            <TextField id="student-start" label="Start Time" type="datetime-local" value={startTime} onChange={setStartTime} />
            <TextField id="student-end" label="End Time" type="datetime-local" value={endTime} onChange={setEndTime} />
            <TextField id="co-bookers" label="Co-booker IDs" value={coBookers} onChange={setCoBookers} placeholder="U005, U009" />

            <button type="button" onClick={() => handleBooking()} className="w-full rounded-xl bg-oxblood py-3 font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25">
              Reserve Space
            </button>
          </div>
        </aside>
      </section>

      <section className="flex items-start gap-6 rounded-2xl border border-oxblood/10 bg-oxblood/[0.03] p-8">
        <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-oxblood" aria-hidden="true" />
        <div className="space-y-2">
          <h2 className="text-xl font-serif">Operational Notice</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-walnut/70">
            Booking a space implies acceptance of the 15-minute grace period, 30-minute cancellation window, and check-out responsibility rules.
          </p>
        </div>
      </section>
    </div>
  );
}

function StatusMetric({ label, value, tone }: { label: string; value: string; tone: "moss" | "oxblood" | "walnut" }) {
  const color = tone === "moss" ? "text-moss" : tone === "oxblood" ? "text-oxblood" : "text-walnut";
  return (
    <div className="text-right">
      <p className="text-[10px] font-medium uppercase tracking-widest text-walnut/40">{label}</p>
      <p className={`text-sm font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">{label}</label>
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="academic-border min-w-[150px] appearance-none rounded-xl bg-parchment py-3 pl-4 pr-10 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-walnut/40" aria-hidden="true" />
      </div>
    </div>
  );
}

function TextField({ id, label, value, onChange, type = "text", placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="academic-border w-full rounded-xl bg-parchment px-4 py-3 text-sm transition-colors placeholder:text-walnut/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
      />
    </div>
  );
}

function SpaceCard({ resource, selected, onSelect }: { resource: StudyResource; selected: boolean; onSelect: () => void }) {
  const isAvailable = resource.current_status === "Available";

  return (
    <article className={`academic-border rounded-2xl p-6 transition-shadow ${isAvailable ? "bg-parchment hover:premium-shadow" : "bg-walnut/5 opacity-75"} ${selected ? "ring-2 ring-oxblood/25" : ""}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-widest text-walnut/40">
            Floor {resource.floor} - {resource.zone_location}
          </p>
          <h3 className="truncate text-xl font-serif">{resource.resource_name}</h3>
        </div>
        <StatusBadge status={resource.current_status} />
      </div>

      <div className="mb-6 flex flex-wrap gap-3 text-xs font-medium text-walnut/60">
        {resource.has_power_outlet && <span className="flex items-center gap-1.5 rounded-md bg-walnut/5 px-2 py-1"><Zap className="h-3.5 w-3.5 fill-candlelight text-candlelight" aria-hidden="true" /> Power Ready</span>}
        {resource.capacity && <span className="flex items-center gap-1.5 rounded-md bg-walnut/5 px-2 py-1"><Users className="h-3.5 w-3.5" aria-hidden="true" /> Fits {resource.capacity}</span>}
      </div>

      <div className="flex items-center justify-between border-t border-walnut/5 pt-6">
        <span className="text-[10px] uppercase tracking-widest text-walnut/35">{resource.resource_id}</span>
        <button
          type="button"
          disabled={!isAvailable}
          onClick={onSelect}
          className={`rounded-lg px-5 py-2 text-sm font-semibold tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 ${
            isAvailable ? "bg-walnut text-parchment hover:bg-oxblood" : "cursor-not-allowed bg-walnut/10 text-walnut/40"
          }`}
        >
          {selected ? "Selected" : isAvailable ? "Select" : "Locked"}
        </button>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: StudyResource["current_status"] }) {
  const styles: Record<StudyResource["current_status"], string> = {
    Available: "bg-moss/10 text-moss",
    Occupied: "bg-walnut/10 text-walnut/50",
    Reserved: "bg-oxblood/10 text-oxblood",
    "Under Maintenance": "bg-candlelight/15 text-walnut",
  };

  return <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${styles[status]}`}>{status}</span>;
}

function formatRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}
