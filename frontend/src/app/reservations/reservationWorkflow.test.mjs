import assert from "node:assert/strict";
import test from "node:test";
import {
  buildReservationRequest,
  formatReservationRange,
  hasReservationConflict,
  parseCoBookerIds,
} from "./reservationWorkflow.ts";

test("buildReservationRequest preserves local wall-clock time with timezone offset", () => {
  const request = buildReservationRequest({
    resourceId: "SR001",
    startTime: "2026-05-11T14:00",
    endTime: "2026-05-11T15:00",
  });

  assert.match(request.startTime, /^2026-05-11T14:00:00[+-]\d{2}:\d{2}$/);
  assert.match(request.endTime, /^2026-05-11T15:00:00[+-]\d{2}:\d{2}$/);
  assert.ok(!request.startTime.endsWith("Z"));
});

test("formatReservationRange renders stored local reservation times without UTC shift", () => {
  assert.equal(
    formatReservationRange("2026-05-11 14:00:00", "2026-05-11 15:00:00"),
    "May 11, 02:00 PM - May 11, 03:00 PM",
  );
});

test("hasReservationConflict ignores cancelled and no-show reservations", () => {
  const start = new Date("2026-05-11T14:00");
  const end = new Date("2026-05-11T15:00");
  const reservations = [
    {
      reservation_id: "RES001",
      user_id: "U001",
      resource_id: "SR001",
      start_time: "2026-05-11 14:30:00",
      end_time: "2026-05-11 15:30:00",
      booking_status: "Cancelled",
      created_at: "2026-05-01 08:00:00",
    },
    {
      reservation_id: "RES002",
      user_id: "U001",
      resource_id: "SR001",
      start_time: "2026-05-11 13:30:00",
      end_time: "2026-05-11 14:30:00",
      booking_status: "No-show",
      created_at: "2026-05-01 08:00:00",
    },
  ];

  assert.equal(hasReservationConflict(reservations, "SR001", start, end), false);
});

test("hasReservationConflict catches pending overlaps for same resource only", () => {
  const start = new Date("2026-05-11T14:00");
  const end = new Date("2026-05-11T15:00");
  const reservations = [
    {
      reservation_id: "RES001",
      user_id: "U001",
      resource_id: "SR002",
      start_time: "2026-05-11 14:30:00",
      end_time: "2026-05-11 15:30:00",
      booking_status: "Pending",
      created_at: "2026-05-01 08:00:00",
    },
    {
      reservation_id: "RES002",
      user_id: "U001",
      resource_id: "SR001",
      start_time: "2026-05-11 14:30:00",
      end_time: "2026-05-11 15:30:00",
      booking_status: "Pending",
      created_at: "2026-05-01 08:00:00",
    },
  ];

  assert.equal(hasReservationConflict(reservations, "SR001", start, end), true);
});

test("parseCoBookerIds trims blank IDs", () => {
  assert.deepEqual(parseCoBookerIds(" 24-0002-01, ,24-0003-01 "), ["24-0002-01", "24-0003-01"]);
});
