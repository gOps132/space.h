import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
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
    <div className="space-y-4">
      <h2 className="text-2xl font-medium">Library Access Rules</h2>
      <p className="text-gray-600 mb-6">These rules keep study spaces available and fair during busy hours.</p>
      
      <div className="grid gap-4">
        {rules.map(rule => (
          <Card key={rule.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                    {rule.id}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{rule.title}</CardTitle>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3">{rule.description}</p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {rule.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
