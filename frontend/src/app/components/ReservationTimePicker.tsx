import type { ReservationTransaction } from "../data/enhancedMockData";

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const SLOT_MINUTES = 30;
const DURATION_OPTIONS = [30, 60, 120, 240];

type ReservationTimePickerProps = {
  bookingDate: string;
  onBookingDateChange: (value: string) => void;
  onSelectSlot: (slotStart: Date) => void;
  onSlotDurationChange: (minutes: number) => void;
  reservations: ReservationTransaction[];
  resourceSelected: boolean;
  selectedEnd: string;
  selectedStart: string;
  slotDurationMinutes: number;
};

export function ReservationTimePicker({
  bookingDate,
  onBookingDateChange,
  onSelectSlot,
  onSlotDurationChange,
  reservations,
  resourceSelected,
  selectedEnd,
  selectedStart,
  slotDurationMinutes,
}: ReservationTimePickerProps) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="reservation-date" className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">Reservation Date</label>
        <input
          id="reservation-date"
          name="reservation-date"
          type="date"
          value={bookingDate}
          onChange={(event) => onBookingDateChange(event.target.value)}
          className="academic-border w-full rounded-xl bg-parchment px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
        />
      </div>

      <div className="space-y-3 rounded-xl border border-walnut/10 bg-walnut/[0.03] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-walnut/40">Day Schedule</p>
          <span className="font-mono text-[10px] text-walnut/35">{DAY_START_HOUR}:00-{DAY_END_HOUR}:00</span>
        </div>

        <div className="space-y-2">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/35">Duration</p>
          <div className="grid grid-cols-4 gap-2">
            {DURATION_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => onSlotDurationChange(minutes)}
                className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 ${
                  slotDurationMinutes === minutes ? "bg-walnut text-parchment" : "bg-parchment text-walnut/60 hover:bg-walnut/5"
                }`}
              >
                {formatDuration(minutes)}
              </button>
            ))}
          </div>
        </div>

        <AvailabilityTimeline
          bookingDate={bookingDate}
          reservations={reservations}
          resourceSelected={resourceSelected}
          selectedEnd={selectedEnd}
          selectedStart={selectedStart}
          slotDurationMinutes={slotDurationMinutes}
          onSelectSlot={onSelectSlot}
        />
      </div>
    </>
  );
}

function AvailabilityTimeline({
  bookingDate,
  onSelectSlot,
  reservations,
  resourceSelected,
  selectedEnd,
  selectedStart,
  slotDurationMinutes,
}: {
  bookingDate: string;
  onSelectSlot: (slotStart: Date) => void;
  reservations: ReservationTransaction[];
  resourceSelected: boolean;
  selectedEnd: string;
  selectedStart: string;
  slotDurationMinutes: number;
}) {
  const slots = buildTimelineSlots(bookingDate);
  const selectedStartDate = selectedStart ? new Date(selectedStart) : null;
  const selectedEndDate = selectedEnd ? new Date(selectedEnd) : null;

  return (
    <div className="space-y-3">
      <div className="relative h-8 overflow-hidden rounded-lg bg-parchment">
        <div className="absolute inset-y-1 left-0 right-0">
          {[0, 25, 50, 75, 100].map((left) => (
            <span key={left} className="absolute top-0 h-full w-px bg-walnut/5" style={{ left: `${left}%` }} />
          ))}
        </div>

        {reservations.map((reservation) => {
          const position = timelinePosition(new Date(reservation.start_time), new Date(reservation.end_time));

          return (
            <div
              key={reservation.reservation_id}
              className="absolute top-1 h-6 rounded-md bg-oxblood/20 ring-1 ring-inset ring-oxblood/25"
              style={{ left: `${position.left}%`, width: `${position.width}%` }}
              title={`${reservation.reservation_id}: ${formatShortTime(reservation.start_time)} to ${formatShortTime(reservation.end_time)}`}
            />
          );
        })}

        {selectedStartDate && selectedEndDate && isSameInputDate(selectedStartDate, bookingDate) && (
          <div
            className="absolute top-1 h-6 rounded-md bg-moss/20 ring-1 ring-inset ring-moss/35"
            style={{
              left: `${timelinePosition(selectedStartDate, selectedEndDate).left}%`,
              width: `${timelinePosition(selectedStartDate, selectedEndDate).width}%`,
            }}
          />
        )}

        {!resourceSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-parchment/90 text-[10px] font-semibold uppercase tracking-widest text-walnut/35">
            Choose a space
          </div>
        )}
      </div>

      <div className="flex justify-between px-1 font-mono text-[9px] text-walnut/30">
        <span>8 AM</span>
        <span>12 PM</span>
        <span>4 PM</span>
        <span>8 PM</span>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {slots.map((slot) => {
          const slotEnd = new Date(slot.getTime() + slotDurationMinutes * 60 * 1000);
          const isPast = slot.getTime() <= Date.now();
          const occupied = reservations.some((reservation) => rangesOverlap(slot, slotEnd, new Date(reservation.start_time), new Date(reservation.end_time)));
          const beyondHours = isBeyondHours(slot, slotEnd);
          const disabled = !resourceSelected || isPast || occupied || beyondHours;
          const selected = Boolean(
            selectedStartDate &&
            selectedEndDate &&
            slot >= selectedStartDate &&
            slot < selectedEndDate
          );

          return (
            <button
              key={slot.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSlot(slot)}
              aria-label={`Select ${formatSlotLabel(slot)} for ${formatDuration(slotDurationMinutes)}`}
              className={`min-h-9 rounded-md px-1 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 ${
                selected
                  ? "bg-moss text-parchment"
                  : occupied
                    ? "cursor-not-allowed bg-oxblood/10 text-oxblood/65"
                    : disabled
                      ? "cursor-not-allowed bg-walnut/5 text-walnut/25"
                      : "bg-parchment text-walnut/60 hover:bg-moss/10 hover:text-moss"
              }`}
            >
              {formatSlotLabel(slot)}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-widest text-walnut/35">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-parchment ring-1 ring-walnut/10" /> Open</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-oxblood/20 ring-1 ring-oxblood/25" /> Reserved</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-moss/20 ring-1 ring-moss/35" /> Selection</span>
      </div>
    </div>
  );
}

export function getBlockingReservationsForResource(reservations: ReservationTransaction[], resourceId: string, bookingDate: string) {
  return reservations.filter((reservation) => {
    if (reservation.resource_id !== resourceId || !isBlockingReservation(reservation)) {
      return false;
    }

    return isSameInputDate(new Date(reservation.start_time), bookingDate);
  });
}

export function isReservationSlotAvailable(start: Date, end: Date, reservations: ReservationTransaction[]) {
  if (start.getTime() <= Date.now() || isBeyondHours(start, end)) {
    return false;
  }

  return !reservations.some((reservation) => rangesOverlap(start, end, new Date(reservation.start_time), new Date(reservation.end_time)));
}

function buildTimelineSlots(bookingDate: string) {
  const slots: Date[] = [];
  const dayStart = new Date(`${bookingDate}T${String(DAY_START_HOUR).padStart(2, "0")}:00`);
  const slotCount = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES;

  for (let index = 0; index < slotCount; index += 1) {
    slots.push(new Date(dayStart.getTime() + index * SLOT_MINUTES * 60 * 1000));
  }

  return slots;
}

export function isBlockingReservation(reservation: ReservationTransaction) {
  return reservation.booking_status === "Pending" || reservation.booking_status === "Active";
}

export function rangesOverlap(start: Date, end: Date, existingStart: Date, existingEnd: Date) {
  return start < existingEnd && end > existingStart;
}

function isBeyondHours(start: Date, end: Date) {
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  return !isSameInputDate(end, toInputDate(start)) || endMinutes > DAY_END_HOUR * 60;
}

function timelinePosition(start: Date, end: Date) {
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const dayStart = DAY_START_HOUR * 60;
  const dayEnd = DAY_END_HOUR * 60;
  const total = dayEnd - dayStart;
  const left = Math.max(0, Math.min(100, ((startMinutes - dayStart) / total) * 100));
  const right = Math.max(0, Math.min(100, ((endMinutes - dayStart) / total) * 100));

  return { left, width: Math.max(2, right - left) };
}

export function todayInputDate() {
  return toInputDate(new Date());
}

function toInputDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function toDatetimeLocalInput(date: Date) {
  return `${toInputDate(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function isSameInputDate(date: Date, inputDate: string) {
  return toDatetimeLocalInput(date).slice(0, 10) === inputDate;
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  return `${minutes / 60}h`;
}

function formatSlotLabel(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatShortTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
