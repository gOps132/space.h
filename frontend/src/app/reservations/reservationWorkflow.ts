import type { ReservationTransaction } from "../data/enhancedMockData";

export type ReservationRequest = {
  resourceId: string;
  startTime: string;
  endTime: string;
  coBookers?: string[];
};

export function buildReservationRequest({
  coBookers,
  endTime,
  resourceId,
  startTime,
}: {
  coBookers?: string[];
  endTime: string;
  resourceId: string;
  startTime: string;
}): ReservationRequest {
  return {
    resourceId,
    startTime: serializeLocalDateTime(startTime),
    endTime: serializeLocalDateTime(endTime),
    ...(coBookers && coBookers.length > 0 ? { coBookers } : {}),
  };
}

export function hasReservationConflict(
  reservations: ReservationTransaction[],
  resourceId: string,
  start: Date,
  end: Date,
) {
  return reservations.some((reservation) => {
    if (reservation.resource_id !== resourceId || !isBlockingReservation(reservation)) {
      return false;
    }

    return rangesOverlap(start, end, parseReservationDate(reservation.start_time), parseReservationDate(reservation.end_time));
  });
}

export function parseCoBookerIds(value: string) {
  return value.split(",").map((id) => id.trim()).filter(Boolean);
}

export function reservationIncludesUser(
  reservation: ReservationTransaction,
  user: { userId: string; universityId: string } | null | undefined,
) {
  if (!user) {
    return false;
  }

  return (
    reservation.user_id === user.userId ||
    reservation.user_university_id === user.universityId ||
    reservation.current_user_role === "co_booker" ||
    Boolean(reservation.co_bookers?.some((coBooker) => coBooker.university_id === user.universityId))
  );
}

export function isReservationOwner(
  reservation: ReservationTransaction,
  user: { userId: string; universityId: string } | null | undefined,
) {
  if (!user) {
    return false;
  }

  return reservation.user_id === user.userId || reservation.user_university_id === user.universityId || reservation.current_user_role === "owner";
}

export function formatReservationRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatter.format(parseReservationDate(start))} - ${formatter.format(parseReservationDate(end))}`;
}

function serializeLocalDateTime(value: string) {
  const date = parseReservationDate(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
  const offsetRemainder = String(absoluteOffset % 60).padStart(2, "0");

  return `${toLocalDateTimeSeconds(date)}${sign}${offsetHours}:${offsetRemainder}`;
}

function parseReservationDate(value: string) {
  return new Date(value.includes("T") ? value : value.replace(" ", "T"));
}

function isBlockingReservation(reservation: ReservationTransaction) {
  return reservation.booking_status === "Pending" || reservation.booking_status === "Active";
}

function rangesOverlap(start: Date, end: Date, existingStart: Date, existingEnd: Date) {
  return start < existingEnd && end > existingStart;
}

function toLocalDateTimeSeconds(date: Date) {
  return [
    date.getFullYear(),
    "-",
    String(date.getMonth() + 1).padStart(2, "0"),
    "-",
    String(date.getDate()).padStart(2, "0"),
    "T",
    String(date.getHours()).padStart(2, "0"),
    ":",
    String(date.getMinutes()).padStart(2, "0"),
    ":",
    String(date.getSeconds()).padStart(2, "0"),
  ].join("");
}
