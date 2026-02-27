import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, User, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { mockReservations, mockResources, mockUsers, type Reservation } from "../data/mockData";

export default function ReservationCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 27)); // Feb 27, 2026
  const [selectedZone, setSelectedZone] = useState<string>("all");

  const zones = ["all", "Quiet Zone", "Group Study", "Computer Zone", "Private Rooms"];

  // Generate time slots (8 AM to 8 PM)
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return {
      time: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
      hour24: `${String(hour).padStart(2, "0")}:00`,
    };
  });

  // Filter resources by zone
  const filteredResources = useMemo(() => {
    return selectedZone === "all"
      ? mockResources
      : mockResources.filter((r) => r.zone === selectedZone);
  }, [selectedZone]);

  // Get reservations for selected date
  const dayReservations = useMemo(() => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    return mockReservations.filter((r) => r.start_time.startsWith(dateStr));
  }, [selectedDate]);

  // Check if a resource is reserved at a specific time
  const isReserved = (resourceId: string, timeSlot: string) => {
    return dayReservations.find((r) => {
      const startHour = new Date(r.start_time).getHours();
      const endHour = new Date(r.end_time).getHours();
      const slotHour = parseInt(timeSlot.split(":")[0]);
      return (
        r.resource_id === resourceId &&
        slotHour >= startHour &&
        slotHour < endHour &&
        r.status !== "Cancelled"
      );
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Reservation Calendar</CardTitle>
          <CardDescription>View all reservations in a timeline format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Date Navigator */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => changeDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-2 bg-muted rounded-lg text-center min-w-[180px]">
                <p className="text-sm text-muted-foreground">Selected Date</p>
                <p className="font-medium">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => changeDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Zone Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Filter by Zone:</label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone === "all" ? "All Zones" : zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-[200px_repeat(13,1fr)] border-b bg-muted/50">
                <div className="p-3 font-medium border-r">Resource</div>
                {timeSlots.map((slot) => (
                  <div key={slot.time} className="p-2 text-center text-sm font-medium border-r">
                    {slot.time}
                  </div>
                ))}
              </div>

              {/* Resource Rows */}
              {filteredResources.map((resource) => (
                <div
                  key={resource.resource_id}
                  className="grid grid-cols-[200px_repeat(13,1fr)] border-b hover:bg-muted/50 transition-colors"
                >
                  {/* Resource Name */}
                  <div className="p-3 border-r">
                    <p className="text-sm font-medium truncate">{resource.resource_name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground">{resource.zone}</span>
                    </div>
                  </div>

                  {/* Time Slots */}
                  {timeSlots.map((slot) => {
                    const reservation = isReserved(resource.resource_id, slot.hour24);
                    return (
                      <div
                        key={slot.time}
                        className="p-1 border-r relative group"
                        title={
                          reservation
                            ? `Reserved by ${mockUsers.find((u) => u.user_id === reservation.user_id)?.name
                            }`
                            : "Available"
                        }
                      >
                        {reservation && (
                          <div
                            className={`h-full rounded ${reservation.status === "Confirmed"
                                ? "bg-moss"
                                : reservation.status === "Pending"
                                  ? "bg-candlelight"
                                  : "bg-muted-foreground"
                              } flex items-center justify-center cursor-pointer transition-opacity group-hover:opacity-80`}
                          >
                            <User className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 p-4 bg-muted/30 border-t">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-moss rounded" />
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-candlelight rounded" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-muted rounded" />
              <span>Available</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Reservations ({dayReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dayReservations.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No reservations for this date</p>
            ) : (
              dayReservations.map((reservation) => {
                const resource = mockResources.find((r) => r.resource_id === reservation.resource_id);
                const user = mockUsers.find((u) => u.user_id === reservation.user_id);
                return (
                  <div
                    key={reservation.reservation_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{resource?.resource_name}</p>
                        <Badge
                          variant={
                            reservation.status === "Confirmed"
                              ? "default"
                              : reservation.status === "Pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {reservation.status}
                        </Badge>
                      </div>
                      <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {user?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(reservation.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(reservation.end_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
