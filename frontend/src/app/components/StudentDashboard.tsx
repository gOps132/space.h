import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Clock, Filter, MapPin, Search, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  enhancedAttendanceLogs,
  enhancedReservations,
  enhancedResources,
  defaultLibraryHours,
  type AttendanceLogTransaction,
  type LibraryHours,
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
  getLibraryHours,
  getReservations,
  getResources,
  type CurrentUser,
} from "../api/client";
import {
  getBlockingReservationsForResource,
  isSameInputDate,
  ReservationTimePicker,
  toDatetimeLocalForDateAndTime,
  todayInputDate,
  toDatetimeLocalInput,
  toTimeInput,
  validateReservationWindow,
} from "./ReservationTimePicker";
import {
  buildReservationRequest,
  formatReservationRange,
  hasReservationConflict,
  isReservationOwner,
  parseCoBookerIds,
  reservationIncludesUser,
} from "../reservations/reservationWorkflow";
import { ReservationResourceCard } from "./ReservationResourceCard";

export default function StudentDashboard() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [resources, setResources] = useState<StudyResource[]>(enhancedResources);
  const [reservations, setReservations] = useState<ReservationTransaction[]>(enhancedReservations);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogTransaction[]>(enhancedAttendanceLogs);
  const [libraryHours, setLibraryHours] = useState<LibraryHours>(defaultLibraryHours);
  const [isLoading, setIsLoading] = useState(true);
  const [filterFloor, setFilterFloor] = useState("all");
  const [filterZone, setFilterZone] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [powerOnly, setPowerOnly] = useState(false);
  const [selectedResource, setSelectedResource] = useState("");
  const [bookingDate, setBookingDate] = useState(todayInputDate());
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [coBookers, setCoBookers] = useState("");

  const refresh = async () => {
    const [user, nextResources, nextReservations, nextAttendanceLogs, nextLibraryHours] = await Promise.all([
      fetchCurrentUser(),
      getResources(),
      getReservations(),
      getAttendanceLogs(),
      getLibraryHours(),
    ]);
    setCurrentUser(user);
    setResources(nextResources.length > 0 ? nextResources : enhancedResources);
    setReservations(nextReservations);
    setAttendanceLogs(nextAttendanceLogs);
    setLibraryHours(nextLibraryHours);
  };

  useEffect(() => {
    refresh()
      .catch(() => {
        toast.error("Could not refresh reservations. Showing latest saved data.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const activeReservation = reservations.find(
    (reservation) =>
      reservationIncludesUser(reservation, currentUser) &&
      (reservation.booking_status === "Pending" || reservation.booking_status === "Active")
  );
  const canManageActiveReservation = activeReservation ? isReservationOwner(activeReservation, currentUser) : false;

  const activeCheckIn = attendanceLogs.find((log) => {
    const reservation = reservations.find((item) => item.reservation_id === log.reservation_id);
    return Boolean(reservation && reservationIncludesUser(reservation, currentUser) && log.actual_check_out === null);
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

  const reservableResources = resources.filter((resource) => !isMaintenanceStatus(resource) && !isFacultyOnlyResource(resource));
  const selectedResourceDetails = selectedResource ? resources.find((resource) => resource.resource_id === selectedResource) : undefined;
  const selectedResourceReservations = useMemo(() => getBlockingReservationsForResource(reservations, selectedResource, bookingDate), [bookingDate, reservations, selectedResource]);

  const handleBookingDateChange = (value: string) => {
    setBookingDate(value);
    setStartTime("");
    setEndTime("");
  };

  const handleSlotDurationChange = (minutes: number) => {
    setSlotDurationMinutes(minutes);
    if (!startTime) return;

    const start = new Date(startTime);
    if (Number.isNaN(start.getTime()) || !isSameInputDate(start, bookingDate)) {
      setStartTime("");
      setEndTime("");
      return;
    }

    setEndTime(toDatetimeLocalInput(new Date(start.getTime() + minutes * 60 * 1000)));
  };

  const handleTimelineSlotSelect = (slotStart: Date) => {
    if (!selectedResourceDetails) {
      toast.error("Choose a space before selecting a time.");
      return;
    }

    const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60 * 1000);
    setStartTime(toDatetimeLocalInput(slotStart));
    setEndTime(toDatetimeLocalInput(slotEnd));
  };

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
    if (!resource || isMaintenanceStatus(resource)) {
      toast.error("That space is under maintenance.");
      return;
    }

    if (isFacultyOnlyResource(resource)) {
      toast.error("Consultation and faculty-exclusive rooms require faculty access.");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      toast.error("Choose a valid time range.");
      return;
    }

    const windowError = validateReservationWindow(start, end, libraryHours);
    if (windowError !== null) {
      toast.error(windowError);
      return;
    }

    if (resource.resource_type === "Individual Seat") {
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (hours > 4) {
        toast.error("Individual seats can only be booked for a maximum of 4 hours.");
        return;
      }
    }

    const coBookerIds = parseCoBookerIds(coBookers);
    const minimumParticipants = resource.min_participants ?? (resource.resource_type === "Group Study Room" ? 3 : 1);
    if (coBookerIds.length + 1 < minimumParticipants) {
      toast.error(`This room requires at least ${minimumParticipants} participants: you plus ${minimumParticipants - 1} others.`);
      return;
    }

    if (hasReservationConflict(reservations, resourceId, start, end)) {
      toast.error("This space is already booked during the selected time.");
      return;
    }

    try {
      await createReservation(buildReservationRequest({
        resourceId,
        startTime,
        endTime,
        coBookers: coBookerIds,
      }));
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
    return <div className="mx-auto max-w-7xl px-4 py-12 text-sm italic text-walnut/50 sm:px-6 lg:px-8">Loading your reservations...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-4xl font-serif">Student Reservations</h1>
          <p className="font-serif text-lg italic leading-none text-walnut/60">Welcome back, {currentUser.fullName}.</p>
        </div>
        <div className="academic-border grid w-full grid-cols-[1fr_auto_1fr] gap-4 rounded-xl bg-walnut/5 p-3 md:w-auto">
          <StatusMetric label="Account Status" value={currentUser.accountStatus} tone="moss" />
          <div className="w-px bg-walnut/10" />
          <StatusMetric label="Booking Hold" value={isBanned ? "Active" : "None"} tone={isBanned ? "oxblood" : "walnut"} />
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
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
                    <p className="font-mono text-lg tabular-nums">{formatReservationRange(activeReservation.start_time, activeReservation.end_time)}</p>
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
                {canManageActiveReservation ? (
                  activeCheckIn ? (
                    <button type="button" onClick={handleCheckOut} className="rounded-xl bg-oxblood py-4 font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candlelight/40">
                      Check Out Now
                    </button>
                  ) : (
                    <button type="button" onClick={handleCheckIn} className="rounded-xl bg-oxblood py-4 font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candlelight/40">
                      Check In
                    </button>
                  )
                ) : (
                  <p className="rounded-xl border border-parchment/15 bg-parchment/10 p-4 text-sm leading-relaxed text-parchment/70">
                    Group booking managed by {activeReservation.user_name ?? activeReservation.user_id}.
                  </p>
                )}
                {canManageActiveReservation && (
                  <button type="button" onClick={handleCancelReservation} className="rounded-xl border border-parchment/20 bg-parchment/10 py-4 font-medium text-parchment/80 transition-colors hover:bg-parchment/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candlelight/40">
                    Cancel Reservation
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-walnut/20 bg-walnut/5 p-12 text-center">
            <p className="italic text-walnut/45">No active reservations. Use the booking panel below to secure a space.</p>
          </div>
        )}
      </section>

      <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h2 className="flex items-center gap-2 text-2xl font-serif">
                <Search className="h-5 w-5 text-oxblood" aria-hidden="true" />
                Find an available seat
              </h2>
              <p className="text-sm text-walnut/45">{filteredResources.length} spaces match your filters</p>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
              <div className="w-full xl:max-w-md">
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

              <div className="flex flex-wrap items-end gap-3">
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
          </div>

          <div className="academic-border max-h-[38rem] overflow-y-auto rounded-2xl bg-parchment">
            {filteredResources.map((resource) => (
              <ReservationResourceCard
                key={resource.resource_id}
                resource={resource}
                selected={selectedResource === resource.resource_id}
                unavailableReason={isMaintenanceStatus(resource) ? "Maintenance" : isFacultyOnlyResource(resource) ? "Faculty only" : undefined}
                onSelect={() => setSelectedResource((current) => current === resource.resource_id ? "" : resource.resource_id)}
              />
            ))}
          </div>
        </div>

        <aside className="academic-border h-fit rounded-2xl bg-parchment p-6 shadow-[0_4px_20px_rgba(45,36,30,0.06)] lg:sticky lg:top-24">
          <h2 className="mb-2 text-xl font-serif">Reserve a Space</h2>
          <p className="mb-6 text-sm text-walnut/60">Choose an open space and the time you plan to use it.</p>

          <div className="space-y-4">
            <SelectField label="Resource" value={selectedResource} onChange={setSelectedResource}>
              <option value="">Choose a space</option>
              {reservableResources.map((resource) => (
                <option key={resource.resource_id} value={resource.resource_id}>
                  {resource.resource_name}
                </option>
              ))}
            </SelectField>

            <ReservationTimePicker
              bookingDate={bookingDate}
              libraryHours={libraryHours}
              reservations={selectedResourceReservations}
              resourceSelected={Boolean(selectedResourceDetails)}
              selectedEnd={endTime}
              selectedStart={startTime}
              slotDurationMinutes={slotDurationMinutes}
              onBookingDateChange={handleBookingDateChange}
              onSelectSlot={handleTimelineSlotSelect}
              onSlotDurationChange={handleSlotDurationChange}
            />

            <TextField
              id="student-start"
              label="Start Time"
              type="time"
              value={toTimeInput(startTime)}
              min={libraryHours.openTime}
              max={libraryHours.closeTime}
              step={libraryHours.slotMinutes * 60}
              onChange={(value) => setStartTime(toDatetimeLocalForDateAndTime(bookingDate, value))}
            />
            <TextField
              id="student-end"
              label="End Time"
              type="time"
              value={toTimeInput(endTime)}
              min={libraryHours.openTime}
              max={libraryHours.closeTime}
              step={libraryHours.slotMinutes * 60}
              onChange={(value) => setEndTime(toDatetimeLocalForDateAndTime(bookingDate, value))}
            />
            <TextField id="co-bookers" label="Group Member IDs" value={coBookers} onChange={setCoBookers} placeholder="24-0002-01, 24-0003-01" />
            <p className="px-1 text-xs leading-relaxed text-walnut/50">
              Add university IDs for students sharing a group room. Individual seats do not need extra IDs.
            </p>

            <button type="button" onClick={() => handleBooking()} className="w-full rounded-xl bg-oxblood py-3 font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25">
              Reserve Space
            </button>
          </div>
        </aside>
      </section>

      <section className="flex items-start gap-6 rounded-2xl border border-oxblood/10 bg-oxblood/[0.03] p-8">
        <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-oxblood" aria-hidden="true" />
        <div className="space-y-2">
          <h2 className="text-xl font-serif">Before You Book</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-walnut/70">
            Check in within 15 minutes, cancel at least 30 minutes before your start time, and check out when you leave.
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

function TextField({ id, label, value, onChange, type = "text", placeholder, min, max, step }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; min?: string; max?: string; step?: number }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        onInput={(event) => onChange(event.currentTarget.value)}
        onChange={(event) => onChange(event.target.value)}
        className="academic-border w-full rounded-xl bg-parchment px-4 py-3 text-sm transition-colors placeholder:text-walnut/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
      />
    </div>
  );
}

function isFacultyOnlyResource(resource: StudyResource) {
  return Boolean(resource.is_faculty_exclusive) || resource.resource_type === "Consultation Room";
}

function isMaintenanceStatus(resource: StudyResource) {
  return resource.current_status === "Under Maintenance" || resource.current_status === "Maintenance Pending";
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}
