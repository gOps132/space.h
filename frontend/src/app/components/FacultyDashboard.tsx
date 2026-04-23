import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus, Calendar, Users, Clock, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { ThemeToggle } from "./ui/ThemeToggle";
import {
  enhancedUsers,
  enhancedResources,
  enhancedReservations,
  type User,
  type StudyResource,
  type ReservationTransaction,
} from "../data/enhancedMockData";

export default function FacultyDashboard() {
  const currentUser = enhancedUsers.find(u => u.role === 'Faculty') || enhancedUsers[2];
  const [resources, setResources] = useState<StudyResource[]>(enhancedResources);
  const [reservations, setReservations] = useState<ReservationTransaction[]>(enhancedReservations);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");

  // Faculty-exclusive rooms
  const facultyRooms = resources.filter(
    r => r.resource_type === 'Group Study Room' && r.is_faculty_exclusive
  );

  // All meeting rooms (including non-exclusive)
  const allMeetingRooms = resources.filter(r => r.resource_type === 'Group Study Room');

  // Faculty's reservations
  const facultyReservations = reservations.filter(r => r.user_id === currentUser.user_id);

  const handleBookRoom = () => {
    if (!selectedRoom || !startTime || !endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check for conflicts
    const hasConflict = reservations.some(
      r =>
        r.resource_id === selectedRoom &&
        r.booking_status !== 'Cancelled' &&
        r.booking_status !== 'No-show' &&
        ((startTime >= r.start_time && startTime < r.end_time) ||
          (endTime > r.start_time && endTime <= r.end_time))
    );

    if (hasConflict) {
      toast.error("This room is already booked during the selected time");
      return;
    }

    const newReservation: ReservationTransaction = {
      reservation_id: `RES${String(reservations.length + 1).padStart(3, '0')}`,
      user_id: currentUser.user_id,
      resource_id: selectedRoom,
      start_time: startTime,
      end_time: endTime,
      booking_status: 'Pending',
      created_at: new Date().toISOString(),
    };

    setReservations([...reservations, newReservation]);
    setResources(
      resources.map(r =>
        r.resource_id === selectedRoom ? { ...r, current_status: 'Reserved' } : r
      )
    );

    toast.success("Meeting room reserved successfully!");
    setDialogOpen(false);
    setSelectedRoom("");
    setStartTime("");
    setEndTime("");
    setPurpose("");
  };

  const upcomingReservations = facultyReservations
    .filter(r => new Date(r.start_time) >= new Date() && r.booking_status !== 'Cancelled')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <div className="min-h-screen bg-background paper-texture relative overflow-hidden">
      {/* Global Grain/Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-[100] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      {/* Floating atmospheric gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-oxblood/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-candlelight/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="bg-walnut/90 backdrop-blur-md text-parchment shadow-md border-b-2 border-candlelight/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-parchment hover:bg-parchment/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>Faculty Portal</h1>
                <p className="text-parchment/70 text-xs italic" style={{ fontFamily: 'var(--font-script)' }}>Priority Booking Access</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="text-right">
                <p className="text-[10px] text-parchment/50 uppercase tracking-widest font-sans">Credentialed as</p>
                <p className="font-medium text-candlelight">{currentUser.full_name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Room Booking */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-oxblood/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>Reserve Meeting Room</CardTitle>
                    <CardDescription>
                      Book rooms for department meetings, consultations, and academic activities
                    </CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-oxblood hover:bg-oxblood/90 text-parchment border border-candlelight/30 shadow-md">
                        <Plus className="mr-2 h-4 w-4" />
                        New Reservation
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle style={{ fontFamily: 'var(--font-heading)' }}>Reserve Meeting Room</DialogTitle>
                        <DialogDescription>
                          Schedule a room for your meeting or consultation
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="room">Select Room</Label>
                          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                            <SelectTrigger id="room">
                              <SelectValue placeholder="Choose a room" />
                            </SelectTrigger>
                            <SelectContent>
                              <optgroup label="Faculty Exclusive">
                                {facultyRooms
                                  .filter(r => r.current_status === 'Available')
                                  .map(room => (
                                    <SelectItem key={room.resource_id} value={room.resource_id}>
                                      {room.resource_name} (Capacity: {room.capacity})
                                    </SelectItem>
                                  ))}
                              </optgroup>
                              <optgroup label="General Meeting Rooms">
                                {allMeetingRooms
                                  .filter(r => !r.is_faculty_exclusive && r.current_status === 'Available')
                                  .map(room => (
                                    <SelectItem key={room.resource_id} value={room.resource_id}>
                                      {room.resource_name} (Capacity: {room.capacity})
                                    </SelectItem>
                                  ))}
                              </optgroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="purpose">Purpose</Label>
                          <Input
                            id="purpose"
                            placeholder="e.g., Department Meeting, Student Consultation"
                            value={purpose}
                            onChange={e => setPurpose(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="faculty-start">Start Time</Label>
                          <Input
                            id="faculty-start"
                            type="datetime-local"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="faculty-end">End Time</Label>
                          <Input
                            id="faculty-end"
                            type="datetime-local"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleBookRoom} className="w-full bg-oxblood hover:bg-oxblood/90 text-parchment border border-candlelight/30">
                          Confirm Reservation
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                    <Users className="h-4 w-4" />
                    Faculty Exclusive Rooms
                  </h3>
                  {facultyRooms.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border/20 rounded-xl bg-muted/5">
                      <p className="text-muted-foreground text-sm italic">No faculty-exclusive rooms available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {facultyRooms.map(room => (
                        <div
                          key={room.resource_id}
                          className="flex items-center justify-between p-5 border border-oxblood/20 rounded-xl bg-oxblood/5 hover:bg-oxblood/10 transition-all group"
                        >
                          <div>
                            <p className="font-medium text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{room.resource_name}</p>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {room.zone_location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                Capacity: {room.capacity}
                              </span>
                            </div>
                          </div>
                          <Badge
                            className={
                              room.current_status === 'Available'
                                ? 'bg-moss/20 text-moss border-moss/30'
                                : room.current_status === 'Occupied'
                                  ? 'bg-destructive/20 text-destructive border-destructive/30'
                                  : 'bg-candlelight/20 text-walnut border-candlelight/30'
                            }
                          >
                            {room.current_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calendar View */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Calendar className="h-5 w-5" />
                  All Meeting Rooms
                </CardTitle>
                <CardDescription>View availability of all group study and meeting rooms</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {allMeetingRooms.map(room => (
                    <div
                      key={room.resource_id}
                      className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium" style={{ fontFamily: 'var(--font-heading)' }}>{room.resource_name}</p>
                          {room.is_faculty_exclusive && (
                            <Badge className="text-[10px] bg-oxblood/10 text-oxblood border-oxblood/20 uppercase tracking-tighter">
                              Faculty Only
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Floor {room.floor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {room.capacity} people
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={
                          room.current_status === 'Available'
                            ? 'bg-moss/20 text-moss border-moss/30'
                            : room.current_status === 'Occupied'
                              ? 'bg-destructive/20 text-destructive border-destructive/30'
                              : room.current_status === 'Reserved'
                                ? 'bg-candlelight/20 text-walnut border-candlelight/30'
                                : 'bg-muted/50 text-muted-foreground border-border/50'
                        }
                      >
                        {room.current_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Upcoming Reservations */}
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>Upcoming Bookings</CardTitle>
                <CardDescription>Your scheduled meetings and consultations</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {upcomingReservations.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border/20 rounded-xl bg-muted/5">
                      <p className="text-muted-foreground text-sm italic">No upcoming reservations</p>
                    </div>
                  ) : (
                    upcomingReservations.map(reservation => {
                      const room = resources.find(r => r.resource_id === reservation.resource_id);
                      return (
                        <div
                          key={reservation.reservation_id}
                          className="p-5 border border-border/50 rounded-xl bg-card/30 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <p className="font-medium text-lg leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>{room?.resource_name}</p>
                            <Badge className="bg-oxblood text-parchment border-none text-[10px] uppercase tracking-wider">{reservation.booking_status}</Badge>
                          </div>
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5" />
                              <span className="font-medium">{new Date(reservation.start_time).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {new Date(reservation.start_time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                -{' '}
                                {new Date(reservation.end_time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{room?.zone_location}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-heading)' }}>Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20 border border-border/30">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Bookings</span>
                    <span className="text-2xl font-medium text-primary">{facultyReservations.length}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-moss/10 border border-moss/20 text-center">
                      <p className="text-[10px] text-moss uppercase tracking-widest font-medium mb-1">Upcoming</p>
                      <p className="text-2xl font-medium text-moss">{upcomingReservations.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-center">
                      <p className="text-[10px] text-accent uppercase tracking-widest font-medium mb-1">Completed</p>
                      <p className="text-2xl font-medium text-accent">
                        {facultyReservations.filter(r => r.booking_status === 'Completed').length}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
