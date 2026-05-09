import { CheckCircle2 } from "lucide-react";

export default function BusinessRulesInfo() {
  const rules = [
    {
      id: 1,
      title: "University ID Login",
      description: "Students, faculty, and staff sign in with their university ID before making reservations.",
      status: "Required to reserve"
    },
    {
      id: 2,
      title: "One Active Reservation",
      description: "Students can hold one active reservation at a time, keeping seats available for others.",
      status: "Checked before booking"
    },
    {
      id: 3,
      title: "4-Hour Maximum Duration",
      description: "Individual seats can be reserved for up to 4 hours per session.",
      status: "Checked before booking"
    },
    {
      id: 4,
      title: "Occupancy Reports",
      description: "Library staff can see current occupancy, busy zones, and peak usage hours.",
      status: "Visible to staff"
    },
    {
      id: 5,
      title: "15-Minute Auto-Cancel",
      description: "Reservations are released if the user does not check in within 15 minutes of the start time.",
      status: "Releases unused spaces"
    },
    {
      id: 6,
      title: "Group Room Minimum",
      description: "Group study rooms require enough student IDs to meet the room minimum.",
      status: "Checked before booking"
    },
    {
      id: 7,
      title: "30-Minute Cancellation",
      description: "Users can cancel their reservation at least 30 minutes before the start time without penalty.",
      status: "Checked before cancellation"
    },
    {
      id: 8,
      title: "No Overlapping Bookings",
      description: "A space cannot be reserved for two groups at the same time.",
      status: "Checked before booking"
    },
    {
      id: 9,
      title: "Maintenance Status",
      description: "Staff can mark a seat or room as under maintenance so it cannot be booked.",
      status: "Managed by staff"
    },
    {
      id: 10,
      title: "Check-Out Required",
      description: "Users who forget to check out can be blocked from booking for 24 hours.",
      status: "Checked before next booking"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif">Library Access Rules</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-walnut/60">Rules are checked before booking, cancellation, and check-in so availability stays fair during busy hours.</p>
      </div>

      <div className="academic-border overflow-hidden rounded-2xl bg-parchment">
        {rules.map(rule => (
          <article key={rule.id} className="grid gap-3 border-b border-walnut/5 p-5 last:border-b-0 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-walnut/5 font-mono text-xs text-walnut/55">
              {rule.id.toString().padStart(2, "0")}
            </div>
            <div>
              <h3 className="font-serif text-lg text-walnut">{rule.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-walnut/60">{rule.description}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-moss/10 px-3 py-2 text-xs font-semibold text-moss sm:justify-self-end">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>{rule.status}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
