import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, BookOpen, CheckCircle2, ChevronDown, Clock, Filter, MapPin, Search, Users } from "lucide-react";
import { toast } from "sonner";
import {
  defaultLibraryHours,
  enhancedAttendanceLogs,
  enhancedReservations,
  enhancedResources,
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
} from "../reservations/reservationWorkflow";

export default function FacultyDashboard() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [resources, setResources] = useState<StudyResource[]>(enhancedResources);
  const [reservations, setReservations] = useState<ReservationTransaction[]>(enhancedReservations);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogTransaction[]>(enhancedAttendanceLogs);
  const [libraryHours, setLibraryHours] = useState<LibraryHours>(defaultLibraryHours);
  const [isLoading, setIsLoading] = useState(true);
  const [filterFloor, setFilterFloor] = useState("all");
  const [filterZone, setFilterZone] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyPriorityOnly, setFacultyPriorityOnly] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [bookingDate, setBookingDate] = useState(todayInputDate());
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");

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
        toast.error("Could not refresh room data. Showing latest saved room list.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const groupRooms = resources.filter(isFacultyReservableResource);
  const facultyReservations = reservations.filter((reservation) => reservation.user_id === currentUser?.userId);
  const activeReservation = facultyReservations.find((reservation) => reservation.booking_status === "Pending" || reservation.booking_status === "Active");
  const activeCheckIn = attendanceLogs.find((log) => {
    const reservation = reservations.find((item) => item.reservation_id === log.reservation_id);
    return reservation?.user_id === currentUser?.userId && log.actual_check_out === null;
  });
  const activeResource = activeReservation
    ? resources.find((resource) => resource.resource_id === activeReservation.resource_id)
    : null;
  const zones = Array.from(new Set(groupRooms.map((resource) => resource.zone_location)));
  const floors = Array.from(new Set(groupRooms.map((resource) => resource.floor))).sort();
  const filteredRooms = useMemo(() => {
    return groupRooms.filter((resource) => {
      const matchesSearch =
        resource.resource_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.resource_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFloor = filterFloor === "all" || resource.floor.toString() === filterFloor;
      const matchesZone = filterZone === "all" || resource.zone_location === filterZone;
      const matchesFacultyPriority = !facultyPriorityOnly || resource.is_faculty_exclusive || resource.resource_type === "Consultation Room";

      return matchesSearch && matchesFloor && matchesZone && matchesFacultyPriority;
    });
  }, [facultyPriorityOnly, filterFloor, filterZone, groupRooms, searchQuery]);
  const reservableRooms = groupRooms.filter((room) => !isMaintenanceStatus(room));
  const selectedRoomDetails = selectedRoom ? groupRooms.find((resource) => resource.resource_id === selectedRoom) : undefined;
  const selectedRoomReservations = useMemo(() => getBlockingReservationsForResource(reservations, selectedRoom, bookingDate), [bookingDate, reservations, selectedRoom]);

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
    if (!selectedRoomDetails) {
      toast.error("Choose a room before selecting a time.");
      return;
    }

    const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60 * 1000);
    setStartTime(toDatetimeLocalInput(slotStart));
    setEndTime(toDatetimeLocalInput(slotEnd));
  };

  const handleBookRoom = async (roomId = selectedRoom) => {
    if (activeReservation) {
      toast.error("You already have an active faculty reservation. Only one booking at a time is allowed.");
      return;
    }

    if (!roomId || !startTime || !endTime) {
      toast.error("Choose a room plus start and end times.");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      toast.error("Choose a valid meeting window.");
      return;
    }

    const windowError = validateReservationWindow(start, end, libraryHours);
    if (windowError !== null) {
      toast.error(windowError);
      return;
    }

    const room = resources.find((resource) => resource.resource_id === roomId);
    if (!room || isMaintenanceStatus(room)) {
      toast.error("That room is under maintenance.");
      return;
    }

    if (hasReservationConflict(reservations, roomId, start, end)) {
      toast.error("This room is already booked during the selected time.");
      return;
    }

    try {
      await createReservation(buildReservationRequest({
        resourceId: roomId,
        startTime,
        endTime,
      }));
      await refresh();
      setSelectedRoom("");
      setStartTime("");
      setEndTime("");
      setPurpose("");
      toast.success(purpose ? `Room reserved for ${purpose}.` : "Meeting room reserved successfully.");
    } catch (caught) {
      toast.error(errorMessage(caught, "Room reservation failed."));
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

  if (isLoading || currentUser === null) {
    return <div className="mx-auto max-w-7xl px-4 py-12 text-sm italic text-walnut/50 sm:px-6 lg:px-8">Loading room reservations...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-4xl font-serif">Faculty Room Reservations</h1>
          <p className="font-serif text-lg italic leading-none text-walnut/60">Welcome back, {currentUser.fullName}.</p>
        </div>
        <div className="academic-border grid w-full grid-cols-[1fr_auto_1fr] gap-4 rounded-xl bg-walnut/5 p-3 md:w-auto">
          <StatusMetric label="Faculty Status" value={currentUser.accountStatus} tone="moss" />
          <div className="w-px bg-walnut/10" />
          <StatusMetric label="Priority Rooms" value={String(groupRooms.filter((room) => room.is_faculty_exclusive || room.resource_type === "Consultation Room").length)} tone="walnut" />
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
                  <p className="mb-2 text-xs uppercase tracking-widest text-parchment/40">Room</p>
                  <h3 className="text-3xl font-serif text-parchment">{activeResource.resource_name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-parchment/60">
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden="true" /> {activeResource.zone_location}</span>
                    {activeResource.capacity && <span className="flex items-center gap-1.5"><Users className="h-4 w-4" aria-hidden="true" /> Fits {activeResource.capacity}</span>}
                    {(activeResource.is_faculty_exclusive || activeResource.resource_type === "Consultation Room") && <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" aria-hidden="true" /> Faculty Priority</span>}
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
            <p className="italic text-walnut/45">No active reservations. Use the booking panel below to secure a faculty room.</p>
          </div>
        )}
      </section>

      <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h2 className="flex items-center gap-2 text-2xl font-serif">
                <Search className="h-5 w-5 text-oxblood" aria-hidden="true" />
                Find an available room
              </h2>
              <p className="text-sm text-walnut/45">{filteredRooms.length} rooms match your filters</p>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
              <div className="w-full xl:max-w-md">
                <label htmlFor="faculty-room-search" className="sr-only">Search by room name or ID</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-walnut/25" aria-hidden="true" />
                  <input
                    id="faculty-room-search"
                    name="faculty-room-search"
                    type="search"
                    placeholder="Search by room number or feature..."
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
                  <input type="checkbox" checked={facultyPriorityOnly} onChange={(event) => setFacultyPriorityOnly(event.target.checked)} className="h-4 w-4 accent-candlelight" />
                  <Filter className="h-4 w-4" aria-hidden="true" />
                  Priority
                </label>
              </div>
            </div>
          </div>

          <div className="academic-border max-h-[38rem] overflow-y-auto rounded-2xl bg-parchment">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.resource_id}
                room={room}
                selected={selectedRoom === room.resource_id}
                unavailableReason={isMaintenanceStatus(room) ? "Maintenance" : undefined}
                onSelect={() => setSelectedRoom((current) => current === room.resource_id ? "" : room.resource_id)}
              />
            ))}
          </div>
        </div>

        <aside id="faculty-booking" className="academic-border h-fit rounded-2xl bg-parchment p-6 shadow-[0_4px_20px_rgba(45,36,30,0.06)] lg:sticky lg:top-24">
          <h2 className="mb-2 text-xl font-serif">Reserve a Room</h2>
          <p className="mb-6 text-sm text-walnut/60">Choose a faculty room and the time you plan to use it.</p>

          <div className="space-y-4">
            <SelectField label="Room" value={selectedRoom} onChange={setSelectedRoom}>
              <option value="">Choose a room</option>
              {reservableRooms.map((room) => (
                <option key={room.resource_id} value={room.resource_id}>{room.resource_name}</option>
              ))}
            </SelectField>
            <TextField id="faculty-purpose" label="Purpose" value={purpose} onChange={setPurpose} placeholder="Department Meeting" />
            <ReservationTimePicker
              bookingDate={bookingDate}
              libraryHours={libraryHours}
              reservations={selectedRoomReservations}
              resourceSelected={Boolean(selectedRoomDetails)}
              selectedEnd={endTime}
              selectedStart={startTime}
              slotDurationMinutes={slotDurationMinutes}
              onBookingDateChange={handleBookingDateChange}
              onSelectSlot={handleTimelineSlotSelect}
              onSlotDurationChange={handleSlotDurationChange}
            />
            <TextField
              id="faculty-start"
              label="Start Time"
              type="time"
              value={toTimeInput(startTime)}
              min={libraryHours.openTime}
              max={libraryHours.closeTime}
              step={libraryHours.slotMinutes * 60}
              onChange={(value) => setStartTime(toDatetimeLocalForDateAndTime(bookingDate, value))}
            />
            <TextField
              id="faculty-end"
              label="End Time"
              type="time"
              value={toTimeInput(endTime)}
              min={libraryHours.openTime}
              max={libraryHours.closeTime}
              step={libraryHours.slotMinutes * 60}
              onChange={(value) => setEndTime(toDatetimeLocalForDateAndTime(bookingDate, value))}
            />
            <button type="button" onClick={() => handleBookRoom()} className="w-full rounded-xl bg-oxblood py-3 font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25">
              Reserve Room
            </button>
          </div>
        </aside>
      </section>

      <section className="flex items-start gap-6 rounded-2xl border border-oxblood/10 bg-oxblood/[0.03] p-8">
        <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-oxblood" aria-hidden="true" />
        <div className="space-y-2">
          <h2 className="text-xl font-serif">Before You Book</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-walnut/70">
            Faculty-only rooms stay reserved for consultations and research meetings. We check room conflicts before confirming your booking.
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

function RoomCard({ room, selected, unavailableReason, onSelect }: { room: StudyResource; selected: boolean; unavailableReason?: string; onSelect: () => void }) {
  const canChoose = !unavailableReason;

  return (
    <article className={`grid gap-4 border-b border-walnut/5 p-4 transition-colors last:border-b-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.8fr)_auto] sm:items-center sm:px-5 ${canChoose ? "bg-parchment hover:bg-walnut/[0.025]" : "bg-walnut/5 opacity-75"} ${selected ? "relative z-10 bg-oxblood/[0.04] ring-2 ring-inset ring-oxblood/25" : ""}`}>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-walnut/40">
            Floor {room.floor} - {room.zone_location}
          </p>
          <StatusBadge status={room.current_status} />
        </div>
        <h3 className="truncate text-xl font-serif">{room.resource_name}</h3>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-medium text-walnut/60">
        {room.capacity && <span className="flex items-center gap-1.5 rounded-md bg-walnut/5 px-2 py-1"><Users className="h-3.5 w-3.5" aria-hidden="true" /> Fits {room.capacity}</span>}
        {room.min_participants && room.min_participants > 1 && <span className="flex items-center gap-1.5 rounded-md bg-walnut/5 px-2 py-1"><Users className="h-3.5 w-3.5" aria-hidden="true" /> Min {room.min_participants}</span>}
        {room.resource_type === "Consultation Room" && <span className="rounded-md bg-oxblood/10 px-2 py-1 text-oxblood">Consultation</span>}
        {room.is_faculty_exclusive && <span className="rounded-md bg-candlelight/15 px-2 py-1 text-walnut">Faculty Priority</span>}
        {!room.is_faculty_exclusive && room.resource_type !== "Consultation Room" && <span className="rounded-md bg-walnut/5 px-2 py-1">General Room</span>}
        {unavailableReason && <span className="rounded-md bg-oxblood/10 px-2 py-1 text-oxblood">{unavailableReason}</span>}
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="text-[10px] uppercase tracking-widest text-walnut/35">{room.resource_id}</span>
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

function isMaintenanceStatus(room: StudyResource) {
  return room.current_status === "Under Maintenance" || room.current_status === "Maintenance Pending";
}

function isFacultyReservableResource(resource: StudyResource) {
  return resource.resource_type === "Group Study Room" || resource.resource_type === "Consultation Room" || Boolean(resource.is_faculty_exclusive);
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

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}
