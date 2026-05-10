import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BookOpen, Calendar, ChevronDown, Clock, Info, MapPin, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import {
  defaultLibraryHours,
  enhancedReservations,
  enhancedResources,
  type LibraryHours,
  type ReservationTransaction,
  type StudyResource,
} from "../data/enhancedMockData";
import {
  ApiError,
  createReservation,
  currentUser as fetchCurrentUser,
  getLibraryHours,
  getReservations,
  getResources,
  type CurrentUser,
} from "../api/client";
import {
  getBlockingReservationsForResource,
  isBlockingReservation,
  isSameInputDate,
  rangesOverlap,
  ReservationTimePicker,
  toDatetimeLocalForDateAndTime,
  todayInputDate,
  toDatetimeLocalInput,
  toTimeInput,
  validateReservationWindow,
} from "./ReservationTimePicker";

export default function FacultyDashboard() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [resources, setResources] = useState<StudyResource[]>(enhancedResources);
  const [reservations, setReservations] = useState<ReservationTransaction[]>(enhancedReservations);
  const [libraryHours, setLibraryHours] = useState<LibraryHours>(defaultLibraryHours);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [bookingDate, setBookingDate] = useState(todayInputDate());
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const refresh = async () => {
    const [user, nextResources, nextReservations, nextLibraryHours] = await Promise.all([
      fetchCurrentUser(),
      getResources(),
      getReservations(),
      getLibraryHours(),
    ]);
    setCurrentUser(user);
    setResources(nextResources.length > 0 ? nextResources : enhancedResources);
    setReservations(nextReservations);
    setLibraryHours(nextLibraryHours);
  };

  useEffect(() => {
    refresh()
      .catch(() => {
        toast.error("Could not refresh room data. Showing latest saved room list.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const groupRooms = resources.filter((resource) => resource.resource_type === "Group Study Room" || resource.resource_type === "Consultation Room");
  const facultyReservations = reservations.filter((reservation) => reservation.user_id === currentUser?.userId);
  const selectedRoomDetails = selectedRoom ? resources.find((resource) => resource.resource_id === selectedRoom) : undefined;
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

    const hasConflict = reservations.some((reservation) => {
      if (reservation.resource_id !== roomId || !isBlockingReservation(reservation)) {
        return false;
      }

      return rangesOverlap(start, end, new Date(reservation.start_time), new Date(reservation.end_time));
    });

    if (hasConflict) {
      toast.error("This room is already booked during the selected time.");
      return;
    }

    try {
      await createReservation({
        resourceId: roomId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      await refresh();
      setSelectedRoom("");
      setStartTime("");
      setEndTime("");
      setPurpose("");
      toast.success(purpose ? `Room reserved for ${purpose}.` : "Meeting room reserved successfully.");
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Room reservation failed.");
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
          <p className="font-serif text-lg italic leading-none text-walnut/60">Book consultation and research rooms.</p>
        </div>
        <div className="academic-border flex items-center gap-2 rounded-xl bg-parchment px-4 py-3">
          <BookOpen className="h-4 w-4 text-oxblood" aria-hidden="true" />
          <span className="text-sm font-medium">Signed in as {currentUser.fullName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <section className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="text-2xl font-serif">Available Group Rooms</h2>
              <a href="#faculty-booking" className="flex items-center gap-1 text-sm font-semibold text-oxblood hover:underline">
                New Reservation <Plus className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="academic-border max-h-[34rem] overflow-y-auto rounded-2xl bg-parchment">
              {groupRooms.map((room) => (
                <RoomCard key={room.resource_id} room={room} onSelect={() => setSelectedRoom(room.resource_id)} selected={selectedRoom === room.resource_id} />
              ))}
            </div>
          </section>

          <section className="academic-border flex gap-5 rounded-2xl bg-walnut/5 p-5 sm:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-oxblood/10">
              <Info className="h-6 w-6 text-oxblood" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-serif">Faculty Room Access</h2>
              <p className="text-sm leading-relaxed text-walnut/60">
                Faculty-only rooms stay reserved for consultations and research meetings. We check room conflicts before confirming your booking.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <section id="faculty-booking" className="academic-border premium-shadow rounded-2xl bg-parchment p-6">
            <h2 className="mb-2 flex items-center gap-2 text-xl font-serif">
              <Calendar className="h-5 w-5 text-oxblood" aria-hidden="true" />
              Reserve Room
            </h2>
            <p className="mb-6 text-sm text-walnut/60">Book a group or faculty-exclusive room for consultation or research work.</p>

            <div className="space-y-4">
              <SelectField label="Room" value={selectedRoom} onChange={setSelectedRoom}>
                <option value="">Choose a room</option>
                {groupRooms.filter((room) => !isMaintenanceStatus(room)).map((room) => (
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
                Confirm Reservation
              </button>
            </div>
          </section>

          <section className="academic-border premium-shadow rounded-2xl bg-parchment p-6">
            <h2 className="mb-6 border-b border-walnut/10 pb-4 text-xl font-serif">Upcoming Bookings</h2>
            <div className="max-h-[24rem] space-y-6 overflow-y-auto pr-1">
              {facultyReservations.length > 0 ? (
                facultyReservations.map((reservation) => (
                  <BookingItem
                    key={reservation.reservation_id}
                    title={resources.find((resource) => resource.resource_id === reservation.resource_id)?.resource_name ?? reservation.resource_id}
                    time={formatRange(reservation.start_time, reservation.end_time)}
                    status={reservation.booking_status}
                  />
                ))
              ) : (
                <p className="text-sm italic text-walnut/45">No faculty bookings yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-walnut p-6 text-parchment/65">
            <h2 className="mb-4 text-lg font-serif text-parchment">Room Support</h2>
            <p className="text-xs leading-relaxed">Need a room setup or accessibility accommodation? Contact the library desk.</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-parchment/10">
                <Clock className="h-4 w-4 text-parchment" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-parchment">Ext. 4022</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function RoomCard({ room, selected, onSelect }: { room: StudyResource; selected: boolean; onSelect: () => void }) {
  const canChoose = !isMaintenanceStatus(room);

  return (
    <article className={`grid gap-4 border-b border-walnut/5 p-4 transition-colors last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.75fr)_auto] sm:items-center sm:px-5 ${canChoose ? "hover:bg-walnut/[0.025]" : "bg-walnut/5 opacity-75"} ${selected ? "relative z-10 bg-oxblood/[0.04] ring-2 ring-inset ring-oxblood/25" : ""}`}>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-walnut/40">Level {room.floor} - {room.zone_location}</p>
          <span className={`shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${room.current_status === "Available" ? "bg-moss/10 text-moss" : "bg-oxblood/10 text-oxblood"}`}>
            {room.current_status}
          </span>
        </div>
        <h3 className="truncate text-xl font-serif">{room.resource_name}</h3>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-walnut/60">
        <span className="flex items-center gap-2 rounded-md bg-walnut/5 px-2 py-1"><Users className="h-4 w-4" aria-hidden="true" /> Up to {room.capacity ?? 4}</span>
        <span className="flex items-center gap-2 rounded-md bg-walnut/5 px-2 py-1"><MapPin className="h-4 w-4" aria-hidden="true" /> {room.is_faculty_exclusive ? "Faculty Priority" : "General Room"}</span>
      </div>

      <button
        type="button"
        onClick={onSelect}
        disabled={!canChoose}
        className={`min-h-11 rounded-xl px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25 ${
          canChoose ? "bg-walnut text-parchment hover:bg-oxblood" : "cursor-not-allowed bg-walnut/10 text-walnut/40"
        }`}
      >
        {selected ? "Selected" : canChoose ? "Select" : "Unavailable"}
      </button>
    </article>
  );
}

function isMaintenanceStatus(room: StudyResource) {
  return room.current_status === "Under Maintenance" || room.current_status === "Maintenance Pending";
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
          className="academic-border w-full appearance-none rounded-xl bg-parchment py-3 pl-4 pr-10 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
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
        className="academic-border w-full rounded-xl bg-parchment px-4 py-3 text-sm placeholder:text-walnut/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
      />
    </div>
  );
}

function BookingItem({ title, time, status }: { title: string; time: string; status: string }) {
  return (
    <div>
      <h3 className="font-sans text-base font-semibold text-walnut">{title}</h3>
      <div className="mt-1 space-y-1">
        <p className="flex items-center gap-1.5 text-xs text-walnut/45"><Clock className="h-3 w-3" aria-hidden="true" /> {time}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-oxblood">{status}</p>
      </div>
    </div>
  );
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
