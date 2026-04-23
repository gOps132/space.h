import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function BusinessRulesInfo() {
  const rules = [
    {
      id: 1,
      title: "University ID Authentication",
      description: "All users (except Guests) must authenticate using their University ID and password.",
      status: "Implemented in login flow"
    },
    {
      id: 2,
      title: "One Active Reservation",
      description: "A student is limited to a maximum of one (1) active reservation at any given time to prevent hoarding.",
      status: "Active - enforced in booking"
    },
    {
      id: 3,
      title: "4-Hour Maximum Duration",
      description: "Reservations for individual seats can be made for a maximum duration of 4 hours per session.",
      status: "Active - validated on booking"
    },
    {
      id: 4,
      title: "Dashboard Analytics",
      description: "The system displays a dashboard to show summary of statistics of the organization, including the current total occupancy percentage, the most popular study zones, and a bar chart of peak usage hours.",
      status: "Active - visible in Admin Dashboard"
    },
    {
      id: 5,
      title: "15-Minute Auto-Cancel",
      description: "If a user does not \"Check-in\" via the app within 15 minutes of their start time, the reservation is automatically cancelled and the seat is marked \"Available.\"",
      status: "Active - runs in background"
    },
    {
      id: 6,
      title: "Group Room Minimum",
      description: "Group Study Rooms require a minimum of 3 \"Student IDs\" to be entered during the booking process.",
      status: "Active - enforced in booking"
    },
    {
      id: 7,
      title: "30-Minute Cancellation",
      description: "Users can cancel their reservation at least 30 minutes before the start time without penalty.",
      status: "Active - validated on cancel"
    },
    {
      id: 8,
      title: "Prevent Overlapping Bookings",
      description: "The system shall prevent any booking that overlaps with an existing approved reservation for the same resource.",
      status: "Active - checked on booking"
    },
    {
      id: 9,
      title: "Freeze/Maintenance Status",
      description: "Admin users have the authority to \"Freeze\" or mark a seat/room as \"Under Maintenance,\" making it unavailable for booking.",
      status: "Active - available in Admin panel"
    },
    {
      id: 10,
      title: "Check-out Penalty",
      description: "A \"Check-out\" transaction must be completed to end a session; otherwise, the user is barred from booking for the next 24 hours (Penalty rule).",
      status: "Active - enforced on next booking"
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-medium">&lt;Space.h&gt; Business Rules</h2>
      <p className="text-gray-600 mb-6">All 10 business rules are implemented and active in the system</p>
      
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