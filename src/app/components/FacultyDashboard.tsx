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
    <div className="min-h-screen bg-background paper-texture">
      {/* Header */}
      <header className="bg-walnut text-parchment shadow-md border-b-2 border-candlelight/30">
        <div className="container mx-auto px-4 py-6">
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
                <p className="text-parchment/70 text-sm" style={{ fontFamily: 'var(--font-script)' }}>Priority Booking Access</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-parchment/70">Logged in as</p>
              <p className="font-medium">{currentUser.full_name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Room Booking */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Reserve Meeting Room</CardTitle>
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
              <CardContent>
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    <Users className="h-4 w-4" />
                    Faculty Exclusive Rooms
                  </h3>
                  {facultyRooms.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4">No faculty-exclusive rooms available</p>
                  ) : (
                    <div className="space-y-2">
                      {facultyRooms.map(room => (
                        <div
                          key={room.resource_id}
                          className="flex items-center justify-between p-4 border-2 border-oxblood/30 rounded-lg bg-oxblood/5"
                        >
                          <div>
                            <p className="font-medium" style={{ fontFamily: 'var(--font-heading)' }}>{room.resource_name}</p>
                            <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {room.zone_location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Capacity: {room.capacity}
                              </span>
                            </div>
                          </div>
                          <Badge
                            className={
                              room.current_status === 'Available'
                                ? 'bg-moss text-primary-foreground border-none'
                                : room.current_status === 'Occupied'
                                  ? 'bg-destructive text-destructive-foreground border-none'
                                  : 'bg-candlelight text-walnut border-none'
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  All Meeting Rooms
                </CardTitle>
                <CardDescription>View availability of all group study and meeting rooms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allMeetingRooms.map(room => (
                    <div
                      key={room.resource_id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium" style={{ fontFamily: 'var(--font-heading)' }}>{room.resource_name}</p>
                          {room.is_faculty_exclusive && (
                            <Badge variant="secondary" className="text-xs bg-oxblood/20 text-oxblood border-none">
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
                            ? 'bg-moss text-primary-foreground border-none'
                            : room.current_status === 'Occupied'
                              ? 'bg-destructive text-destructive-foreground border-none'
                              : room.current_status === 'Reserved'
                                ? 'bg-candlelight text-walnut border-none'
                                : 'bg-muted-foreground border-none text-parchment'
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
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Your scheduled meetings and consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingReservations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">No upcoming reservations</p>
                  ) : (
                    upcomingReservations.map(reservation => {
                      const room = resources.find(r => r.resource_id === reservation.resource_id);
                      return (
                        <div
                          key={reservation.reservation_id}
                          className="p-4 border border-oxblood/20 rounded-lg bg-card shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium" style={{ fontFamily: 'var(--font-heading)' }}>{room?.resource_name}</p>
                            <Badge className="bg-oxblood text-parchment border-none">{reservation.booking_status}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(reservation.start_time).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
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
                              <MapPin className="h-3 w-3" />
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
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Bookings</span>
                    <span className="text-xl font-medium">{facultyReservations.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Upcoming</span>
                    <span className="text-xl font-medium">{upcomingReservations.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="text-xl font-medium">
                      {facultyReservations.filter(r => r.booking_status === 'Completed').length}
                    </span>
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
