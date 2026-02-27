import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Trash2, LogIn, LogOut, Search, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { toast } from "sonner";
import {
  mockResources,
  mockReservations,
  mockUsageLogs,
  mockUsers,
  type Resource,
  type Reservation,
  type UsageLog,
} from "../data/mockData";

export default function StudentView() {
  const currentUser = mockUsers[0]; // John Doe as logged in user
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>(mockUsageLogs);
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const zones = ["all", "Quiet Zone", "Group Study", "Computer Zone", "Private Rooms"];

  // Get user's reservations
  const userReservations = reservations.filter((r) => r.user_id === currentUser.user_id);

  // Get user's active check-ins
  const activeCheckIns = usageLogs.filter(
    (log) => log.user_id === currentUser.user_id && log.check_out_time === null
  );

  // Filter available resources
  const filteredResources = resources.filter((r) => {
    if (r.status !== "Available") return false;
    
    const matchesSearch = r.resource_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = filterZone === "all" || r.zone === filterZone;
    const matchesType = filterType === "all" || r.resource_type === filterType;
    
    return matchesSearch && matchesZone && matchesType;
  });

  // CREATE - Book a resource
  const handleBooking = () => {
    if (!selectedResource || !startTime || !endTime) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check if resource is available
    const resource = resources.find((r) => r.resource_id === selectedResource);
    if (!resource) {
      toast.error("Resource not found");
      return;
    }

    // Check for conflicts
    const hasConflict = reservations.some(
      (r) =>
        r.resource_id === selectedResource &&
        r.status !== "Cancelled" &&
        ((startTime >= r.start_time && startTime < r.end_time) ||
          (endTime > r.start_time && endTime <= r.end_time))
    );

    if (hasConflict) {
      toast.error("This resource is already booked during the selected time");
      return;
    }

    // Create new reservation
    const newReservation: Reservation = {
      reservation_id: `RES${String(reservations.length + 1).padStart(3, "0")}`,
      user_id: currentUser.user_id,
      resource_id: selectedResource,
      start_time: startTime,
      end_time: endTime,
      status: "Pending",
    };

    setReservations([...reservations, newReservation]);

    // Update resource status to Reserved
    setResources(
      resources.map((r) =>
        r.resource_id === selectedResource ? { ...r, status: "Reserved" } : r
      )
    );

    toast.success("Reservation created successfully!");
    setDialogOpen(false);
    setSelectedResource("");
    setStartTime("");
    setEndTime("");
  };

  // UPDATE - Check-in
  const handleCheckIn = (reservationId: string) => {
    const reservation = reservations.find((r) => r.reservation_id === reservationId);
    if (!reservation) return;

    // Create usage log
    const newLog: UsageLog = {
      log_id: `LOG${String(usageLogs.length + 1).padStart(3, "0")}`,
      reservation_id: reservationId,
      user_id: currentUser.user_id,
      resource_id: reservation.resource_id,
      check_in_time: new Date().toISOString(),
      check_out_time: null,
    };

    setUsageLogs([...usageLogs, newLog]);

    // Update reservation status
    setReservations(
      reservations.map((r) =>
        r.reservation_id === reservationId ? { ...r, status: "Confirmed" } : r
      )
    );

    // Update resource status to Occupied
    setResources(
      resources.map((r) =>
        r.resource_id === reservation.resource_id ? { ...r, status: "Occupied" } : r
      )
    );

    toast.success("Checked in successfully!");
  };

  // UPDATE - Check-out
  const handleCheckOut = (logId: string) => {
    const log = usageLogs.find((l) => l.log_id === logId);
    if (!log) return;

    // Update usage log with check-out time
    setUsageLogs(
      usageLogs.map((l) =>
        l.log_id === logId ? { ...l, check_out_time: new Date().toISOString() } : l
      )
    );

    // Update resource status back to Available
    setResources(
      resources.map((r) =>
        r.resource_id === log.resource_id ? { ...r, status: "Available" } : r
      )
    );

    toast.success("Checked out successfully!");
  };

  // DELETE - Cancel reservation
  const handleCancelReservation = (reservationId: string) => {
    const reservation = reservations.find((r) => r.reservation_id === reservationId);
    if (!reservation) return;

    // Update reservation status to Cancelled
    setReservations(
      reservations.map((r) =>
        r.reservation_id === reservationId ? { ...r, status: "Cancelled" } : r
      )
    );

    // Update resource status back to Available
    setResources(
      resources.map((r) =>
        r.resource_id === reservation.resource_id ? { ...r, status: "Available" } : r
      )
    );

    toast.success("Reservation cancelled");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl">Student Portal</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p>{currentUser.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Booking */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Make a Reservation</CardTitle>
                    <CardDescription>Browse and book available resources</CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Booking
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Reservation</DialogTitle>
                        <DialogDescription>
                          Select a resource and time slot for your booking
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="resource">Resource</Label>
                          <Select value={selectedResource} onValueChange={setSelectedResource}>
                            <SelectTrigger id="resource">
                              <SelectValue placeholder="Select a resource" />
                            </SelectTrigger>
                            <SelectContent>
                              {resources
                                .filter((r) => r.status === "Available")
                                .map((resource) => (
                                  <SelectItem key={resource.resource_id} value={resource.resource_id}>
                                    {resource.resource_name} ({resource.zone})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="start-time">Start Time</Label>
                          <Input
                            id="start-time"
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-time">End Time</Label>
                          <Input
                            id="end-time"
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleBooking} className="w-full">
                          Confirm Booking
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-medium">Available Resources</h3>
                  
                  {/* Search and Filter */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={filterZone} onValueChange={setFilterZone}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Filter by zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone} value={zone}>
                              {zone === "all" ? "All Zones" : zone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Seat">Seats</SelectItem>
                          <SelectItem value="Room">Rooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredResources.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No resources match your filters</p>
                    ) : (
                      filteredResources.map((resource) => (
                        <div
                          key={resource.resource_id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <p>{resource.resource_name}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {resource.zone}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {resource.resource_type}
                              </Badge>
                            </div>
                          </div>
                          <Badge className="bg-green-500">Available</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Reservations & Check-ins */}
          <div className="space-y-6">
            {/* My Reservations */}
            <Card>
              <CardHeader>
                <CardTitle>My Reservations</CardTitle>
                <CardDescription>View and manage your bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {userReservations.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No reservations yet</p>
                  ) : (
                    userReservations.map((reservation) => {
                      const resource = resources.find((r) => r.resource_id === reservation.resource_id);
                      const isCheckedIn = activeCheckIns.some(
                        (log) => log.reservation_id === reservation.reservation_id
                      );

                      return (
                        <div
                          key={reservation.reservation_id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p>{resource?.resource_name}</p>
                            <div className="flex gap-2 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(reservation.start_time).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(reservation.start_time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                -
                                {new Date(reservation.end_time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {reservation.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {!isCheckedIn && reservation.status === "Pending" && (
                              <Button
                                size="sm"
                                onClick={() => handleCheckIn(reservation.reservation_id)}
                              >
                                <LogIn className="h-4 w-4" />
                              </Button>
                            )}
                            {reservation.status !== "Cancelled" && reservation.status !== "No-show" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelReservation(reservation.reservation_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Check-ins */}
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Currently checked-in resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeCheckIns.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No active sessions</p>
                  ) : (
                    activeCheckIns.map((log) => {
                      const resource = resources.find((r) => r.resource_id === log.resource_id);
                      return (
                        <div
                          key={log.log_id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-blue-50"
                        >
                          <div>
                            <p>{resource?.resource_name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Checked in at{" "}
                              {new Date(log.check_in_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Button size="sm" onClick={() => handleCheckOut(log.log_id)}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Check Out
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}