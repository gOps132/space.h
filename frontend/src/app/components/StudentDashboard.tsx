import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus, LogIn, LogOut, Trash2, MapPin, Clock, Zap, AlertTriangle, History, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner";
import { ThemeToggle } from "./ui/ThemeToggle";
import {
  enhancedUsers,
  enhancedResources,
  enhancedReservations,
  enhancedAttendanceLogs,
  type User,
  type StudyResource,
  type ReservationTransaction,
  type AttendanceLogTransaction,
} from "../data/enhancedMockData";

export default function StudentDashboard() {
  const currentUser = enhancedUsers.find(u => u.role === 'Student') || enhancedUsers[0];
  const [resources, setResources] = useState<StudyResource[]>(enhancedResources);
  const [reservations, setReservations] = useState<ReservationTransaction[]>(enhancedReservations);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogTransaction[]>(enhancedAttendanceLogs);

  // Booking form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [coBookers, setCoBookers] = useState<string>("");

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterFloor, setFilterFloor] = useState<string>("all");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [filterPowerOutlet, setFilterPowerOutlet] = useState<boolean>(false);

  const zones = ["all", "Silent Zone", "Collaborative Zone", "Computer Lab"];
  const floors = ["all", "1", "2", "3"];

  // Get user's active reservation (Business Rule 2: One active reservation max)
  const activeReservation = reservations.find(
    r => r.user_id === currentUser.user_id &&
      (r.booking_status === 'Pending' || r.booking_status === 'Active')
  );

  // Get user's active check-in
  const activeCheckIn = attendanceLogs.find(
    log => {
      const reservation = reservations.find(r => r.reservation_id === log.reservation_id);
      return reservation?.user_id === currentUser.user_id && log.actual_check_out === null;
    }
  );

  // Check if user is banned (Business Rule 10: 24-hour penalty)
  const isBanned = currentUser.is_banned_until
    ? new Date(currentUser.is_banned_until) > new Date()
    : false;

  // Filter available resources
  const availableResources = resources.filter(r => {
    if (r.current_status !== 'Available') return false;

    const matchesSearch = r.resource_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFloor = filterFloor === "all" || r.floor.toString() === filterFloor;
    const matchesZone = filterZone === "all" || r.zone_location === filterZone;
    const matchesPowerOutlet = !filterPowerOutlet || r.has_power_outlet === true;

    return matchesSearch && matchesFloor && matchesZone && matchesPowerOutlet;
  });

  // Auto-cancel reservations if not checked in within 15 minutes (Business Rule 5)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reservations.forEach(reservation => {
        if (reservation.booking_status === 'Pending') {
          const startTime = new Date(reservation.start_time);
          const minutesSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60);

          if (minutesSinceStart > 15) {
            handleAutoCancelReservation(reservation.reservation_id);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reservations]);

  const handleAutoCancelReservation = (reservationId: string) => {
    const reservation = reservations.find(r => r.reservation_id === reservationId);
    if (!reservation) return;

    setReservations(prev =>
      prev.map(r =>
        r.reservation_id === reservationId ? { ...r, booking_status: 'No-show' as const } : r
      )
    );

    setResources(prev =>
      prev.map(r =>
        r.resource_id === reservation.resource_id ? { ...r, current_status: 'Available' as const } : r
      )
    );

    toast.error("Reservation auto-cancelled: No check-in within 15 minutes");
  };

  // CREATE - Book a resource (Transaction 1)
  const handleBooking = () => {
    // Business Rule 2: Check if user already has an active reservation
    if (activeReservation) {
      toast.error("You already have an active reservation. Only one booking at a time is allowed.");
      return;
    }

    // Check if user is banned
    if (isBanned) {
      toast.error("You are temporarily banned from booking due to not checking out from your last session.");
      return;
    }

    if (!selectedResource || !startTime || !endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const resource = resources.find(r => r.resource_id === selectedResource);
    if (!resource) {
      toast.error("Resource not found");
      return;
    }

    // Business Rule 3: Check 4-hour maximum duration for individual seats
    if (resource.resource_type === 'Individual Seat') {
      const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
      if (duration > 4) {
        toast.error("Individual seats can only be booked for a maximum of 4 hours");
        return;
      }
    }

    // Business Rule 6: Group Study Rooms require minimum 3 student IDs
    if (resource.resource_type === 'Group Study Room' && !resource.is_faculty_exclusive) {
      const coBookerIds = coBookers.split(',').map(id => id.trim()).filter(id => id);
      if (coBookerIds.length < 2) {
        toast.error("Group Study Rooms require at least 3 participants (you + 2 others)");
        return;
      }
    }

    // Business Rule 8: Check for overlapping reservations
    const hasConflict = reservations.some(
      r =>
        r.resource_id === selectedResource &&
        r.booking_status !== 'Cancelled' &&
        r.booking_status !== 'No-show' &&
        ((startTime >= r.start_time && startTime < r.end_time) ||
          (endTime > r.start_time && endTime <= r.end_time))
    );

    if (hasConflict) {
      toast.error("This resource is already booked during the selected time");
      return;
    }

    // Create new reservation
    const coBookerIds = coBookers.split(',').map(id => id.trim()).filter(id => id);
    const newReservation: ReservationTransaction = {
      reservation_id: `RES${String(reservations.length + 1).padStart(3, '0')}`,
      user_id: currentUser.user_id,
      resource_id: selectedResource,
      start_time: startTime,
      end_time: endTime,
      booking_status: 'Pending',
      created_at: new Date().toISOString(),
      co_bookers: coBookerIds.length > 0 ? coBookerIds : undefined,
    };

    setReservations([...reservations, newReservation]);
    setResources(
      resources.map(r =>
        r.resource_id === selectedResource ? { ...r, current_status: 'Reserved' } : r
      )
    );

    toast.success("Reservation created successfully!");
    setDialogOpen(false);
    setSelectedResource("");
    setStartTime("");
    setEndTime("");
    setCoBookers("");
  };

  // Check-in (Transaction 2)
  const handleCheckIn = () => {
    if (!activeReservation) return;

    const newLog: AttendanceLogTransaction = {
      log_id: `LOG${String(attendanceLogs.length + 1).padStart(3, '0')}`,
      reservation_id: activeReservation.reservation_id,
      actual_check_in: new Date().toISOString(),
      actual_check_out: null,
    };

    setAttendanceLogs([...attendanceLogs, newLog]);
    setReservations(
      reservations.map(r =>
        r.reservation_id === activeReservation.reservation_id
          ? { ...r, booking_status: 'Active' }
          : r
      )
    );
    setResources(
      resources.map(r =>
        r.resource_id === activeReservation.resource_id
          ? { ...r, current_status: 'Occupied' }
          : r
      )
    );

    toast.success("Checked in successfully!");
  };

  // Check-out (Transaction 2 completion)
  const handleCheckOut = () => {
    if (!activeCheckIn) return;

    const reservation = reservations.find(r => r.reservation_id === activeCheckIn.reservation_id);
    if (!reservation) return;

    setAttendanceLogs(
      attendanceLogs.map(log =>
        log.log_id === activeCheckIn.log_id
          ? { ...log, actual_check_out: new Date().toISOString() }
          : log
      )
    );
    setReservations(
      reservations.map(r =>
        r.reservation_id === activeCheckIn.reservation_id
          ? { ...r, booking_status: 'Completed' }
          : r
      )
    );
    setResources(
      resources.map(r =>
        r.resource_id === reservation.resource_id
          ? { ...r, current_status: 'Available' }
          : r
      )
    );

    toast.success("Checked out successfully!");
  };

  // Business Rule 7: Cancel reservation
  const handleCancelReservation = () => {
    if (!activeReservation) return;

    const now = new Date();
    const startTime = new Date(activeReservation.start_time);
    const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60);

    if (minutesUntilStart < 30) {
      toast.error("Reservations can only be cancelled at least 30 minutes before the start time");
      return;
    }

    setReservations(
      reservations.map(r =>
        r.reservation_id === activeReservation.reservation_id
          ? { ...r, booking_status: 'Cancelled' }
          : r
      )
    );
    setResources(
      resources.map(r =>
        r.resource_id === activeReservation.resource_id
          ? { ...r, current_status: 'Available' }
          : r
      )
    );

    toast.success("Reservation cancelled");
  };

  const activeResource = activeReservation
    ? resources.find(r => r.resource_id === activeReservation.resource_id)
    : null;

  return (
    <div className="min-h-screen bg-background paper-texture relative overflow-hidden">
      {/* Global Grain/Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-[100] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      {/* Floating atmospheric gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>Student Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Chronicle of</p>
                <p className="font-medium text-primary">{currentUser.full_name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Penalty Alert */}
        {isBanned && (
          <Alert className="mb-6 border-destructive bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              You are temporarily banned from booking until{" "}
              {new Date(currentUser.is_banned_until!).toLocaleString()} due to not checking out from your last session.
            </AlertDescription>
          </Alert>
        )}

        {/* Active Booking Card */}
        {activeReservation && (
          <Card className="mb-10 border-moss/30 bg-card/40 backdrop-blur-md shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-moss/5 to-transparent pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center justify-between">
                <span style={{ fontFamily: 'var(--font-heading)' }}>Your Active Booking</span>
                <Badge className="bg-moss/20 text-moss border-moss/30">
                  {activeReservation.booking_status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-medium mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{activeResource?.resource_name}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {activeResource?.zone_location} - Floor {activeResource?.floor}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(activeReservation.start_time).toLocaleString()} -{" "}
                      {new Date(activeReservation.end_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {activeResource?.has_power_outlet && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-candlelight" />
                        Power Outlet
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  {activeReservation.booking_status === 'Pending' && !activeCheckIn && (
                    <>
                      <Button onClick={handleCheckIn} size="lg" className="flex-1">
                        <LogIn className="mr-2 h-5 w-5" />
                        CHECK IN
                      </Button>
                      <Button onClick={handleCancelReservation} variant="destructive" size="lg">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                  {activeCheckIn && (
                    <Button onClick={handleCheckOut} size="lg" className="flex-1 bg-moss hover:bg-moss/90 text-primary-foreground">
                      <LogOut className="mr-2 h-5 w-5" />
                      CHECK OUT
                    </Button>
                  )}
                </div>

                {activeReservation.booking_status === 'Pending' && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Please check in within 15 minutes of your start time, or your reservation will be automatically cancelled.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="find-seat" className="space-y-6">
          <TabsList>
            <TabsTrigger value="find-seat">Find a Seat</TabsTrigger>
            <TabsTrigger value="history">My History</TabsTrigger>
          </TabsList>

          {/* Find a Seat Tab */}
          <TabsContent value="find-seat" className="space-y-6">
            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Find a Seat</CardTitle>
                    <CardDescription>Search and filter available study spaces</CardDescription>
                  </div>
                  {!activeReservation && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={isBanned}>
                          <Plus className="mr-2 h-4 w-4" />
                          New Booking
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create Reservation</DialogTitle>
                          <DialogDescription>
                            Book your study space (Max 4 hours for individual seats)
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
                                {availableResources.map(resource => (
                                  <SelectItem key={resource.resource_id} value={resource.resource_id}>
                                    {resource.resource_name} - {resource.zone_location}
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
                              onChange={e => setStartTime(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-time">End Time</Label>
                            <Input
                              id="end-time"
                              type="datetime-local"
                              value={endTime}
                              onChange={e => setEndTime(e.target.value)}
                            />
                          </div>
                          {selectedResource &&
                            resources.find(r => r.resource_id === selectedResource)?.resource_type ===
                            'Group Study Room' && (
                              <div>
                                <Label htmlFor="co-bookers">
                                  Co-Bookers (Student IDs, comma-separated, min 2)
                                </Label>
                                <Input
                                  id="co-bookers"
                                  placeholder="U002, U003"
                                  value={coBookers}
                                  onChange={e => setCoBookers(e.target.value)}
                                />
                              </div>
                            )}
                          <Button onClick={handleBooking} className="w-full">
                            Confirm Booking
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="space-y-3 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search resources..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Select value={filterFloor} onValueChange={setFilterFloor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {floors.map(floor => (
                          <SelectItem key={floor} value={floor}>
                            {floor === "all" ? "All Floors" : `Floor ${floor}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterZone} onValueChange={setFilterZone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map(zone => (
                          <SelectItem key={zone} value={zone}>
                            {zone === "all" ? "All Zones" : zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={filterPowerOutlet ? "default" : "outline"}
                      onClick={() => setFilterPowerOutlet(!filterPowerOutlet)}
                      className="col-span-2 md:col-span-2"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Power Outlet Only
                    </Button>
                  </div>
                </div>

                {/* Available Resources */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                  {availableResources.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border/30 rounded-xl bg-muted/5">
                      <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground italic">No resources match your filters</p>
                    </div>
                  ) : (
                    availableResources.map(resource => (
                      <div
                        key={resource.resource_id}
                        className="flex items-center justify-between p-5 border border-border/50 rounded-xl bg-card/30 hover:bg-primary/5 transition-all duration-300 group/item hover:border-primary/30"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-lg text-foreground group-hover/item:text-primary transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>{resource.resource_name}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-background/50">
                              {resource.resource_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Floor {resource.floor} • {resource.zone_location}
                            </span>
                            {resource.has_power_outlet && (
                              <span className="text-xs text-candlelight flex items-center gap-1">
                                <Zap className="h-3 w-3 fill-candlelight" />
                                Power
                              </span>
                            )}
                            {resource.capacity && (
                              <span className="text-xs text-muted-foreground">
                                Capacity: {resource.capacity}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-moss/20 text-moss border-moss/30 px-3 py-1 font-medium">Available</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-bl from-accent/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  <History className="h-5 w-5" />
                  My Booking History
                </CardTitle>
                <CardDescription>View all your past and current reservations</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {reservations
                    .filter(r => r.user_id === currentUser.user_id)
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map(reservation => {
                      const resource = resources.find(r => r.resource_id === reservation.resource_id);
                      return (
                        <div key={reservation.reservation_id} className="p-5 border border-border/50 rounded-xl bg-card/30 hover:bg-muted/30 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{resource?.resource_name}</p>
                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(reservation.start_time).toLocaleDateString()} |{" "}
                                  {new Date(reservation.start_time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {" - "}
                                  {new Date(reservation.end_time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                            <Badge
                              className={
                                reservation.booking_status === 'Completed'
                                  ? 'bg-primary/20 text-primary border-primary/30'
                                  : reservation.booking_status === 'Cancelled'
                                    ? 'bg-destructive/20 text-destructive border-destructive/30'
                                    : 'bg-accent/20 text-accent border-accent/30'
                              }
                            >
                              {reservation.booking_status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
