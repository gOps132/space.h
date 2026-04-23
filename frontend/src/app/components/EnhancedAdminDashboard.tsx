import { useState, useMemo } from "react";
import { Link } from "react-router";
import { ArrowLeft, AlertCircle, TrendingUp, Users, MapPin, Settings, Wrench } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { ThemeToggle } from "./ui/ThemeToggle";
import {
  enhancedUsers,
  enhancedResources,
  enhancedReservations,
  enhancedAttendanceLogs,
  dashboardData,
  type StudyResource,
} from "../data/enhancedMockData";

export default function EnhancedAdminDashboard() {
  const [resources, setResources] = useState<StudyResource[]>(enhancedResources);
  const [selectedResource, setSelectedResource] = useState<StudyResource | null>(null);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);

  const reservations = enhancedReservations;
  const attendanceLogs = enhancedAttendanceLogs;

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalSeats = resources.filter(r => r.resource_type === 'Individual Seat').length;
    const occupiedSeats = resources.filter(
      r => r.resource_type === 'Individual Seat' && r.current_status === 'Occupied'
    ).length;
    const occupancyRate = totalSeats > 0 ? (occupiedSeats / totalSeats) * 100 : 0;

    const pendingReservations = reservations.filter(r => r.booking_status === 'Pending').length;
    const maintenanceAlerts = resources.filter(r => r.current_status === 'Under Maintenance').length;
    const noShows = reservations.filter(r => r.booking_status === 'No-show').length;

    // Zone occupancy data for pie chart
    const zones = ['Silent Zone', 'Collaborative Zone', 'Computer Lab'];
    const zoneData = zones.map(zone => {
      const zoneResources = resources.filter(r => r.zone_location === zone);
      const occupied = zoneResources.filter(r => r.current_status === 'Occupied').length;
      return {
        name: zone,
        value: occupied,
      };
    });

    return {
      totalSeats,
      occupiedSeats,
      occupancyRate: occupancyRate.toFixed(1),
      pendingReservations,
      maintenanceAlerts,
      noShows,
      zoneData,
    };
  }, [resources, reservations]);

  // Toggle maintenance status (Business Rule 9)
  const handleToggleMaintenance = (resourceId: string, newStatus: 'Available' | 'Under Maintenance') => {
    setResources(prev =>
      prev.map(r =>
        r.resource_id === resourceId ? { ...r, current_status: newStatus } : r
      )
    );

    const statusText = newStatus === 'Under Maintenance' ? 'frozen for maintenance' : 'made available';
    toast.success(`Resource ${statusText}`);
    setMaintenanceDialogOpen(false);
    setSelectedResource(null);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-background paper-texture relative overflow-hidden">
      {/* Global Grain/Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-[100] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      {/* Floating atmospheric gradients */}
      <div className="absolute top-[-15%] left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[130px] pointer-events-none" />

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
              <div>
                <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>Admin Dashboard</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">LibSpace Management Console</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-1 border-primary/30 text-primary bg-primary/5">
                <Settings className="mr-1 h-3 w-3" />
                Admin Access
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Top Row - Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-lg group hover:border-primary/30 transition-all duration-300">
            <CardHeader className="pb-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardDescription className="uppercase tracking-widest text-[10px] font-bold">Total Seats</CardDescription>
              <CardTitle className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{metrics.totalSeats}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                Currently Occupied: <span className="font-semibold text-primary">{metrics.occupiedSeats}</span>
              </div>
              <div className="h-3 bg-muted/50 rounded-full overflow-hidden border border-border/30 p-[2px]">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                  style={{ width: `${metrics.occupancyRate}%` }}
                />
              </div>
              <div className="mt-2 text-[10px] text-right font-medium uppercase tracking-tighter text-muted-foreground">
                {metrics.occupancyRate}% Occupancy
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-lg group hover:border-primary/30 transition-all duration-300">
            <CardHeader className="pb-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardDescription className="uppercase tracking-widest text-[10px] font-bold">Pending Reservations</CardDescription>
              <CardTitle className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{metrics.pendingReservations}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground italic">Awaiting check-in</p>
                <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-lg group hover:border-primary/30 transition-all duration-300">
            <CardHeader className="pb-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardDescription className="uppercase tracking-widest text-[10px] font-bold">Maintenance Alerts</CardDescription>
              <CardTitle className="text-4xl font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{metrics.maintenanceAlerts}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground italic">Resources under maintenance</p>
                <Wrench className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-lg group hover:border-destructive/30 transition-all duration-300">
            <CardHeader className="pb-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-destructive/70">No-Shows</CardDescription>
              <CardTitle className="text-4xl font-bold text-destructive" style={{ fontFamily: 'var(--font-heading)' }}>{metrics.noShows}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground italic">Missed reservations</p>
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row - Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* Traffic Flow Line Graph */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>Traffic Flow Throughout the Day</CardTitle>
              <CardDescription>Peak hours analysis from recent logs</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={dashboardData.peak_time_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                  <XAxis
                    dataKey="hour"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(var(--card-rgb), 0.9)',
                      borderColor: 'var(--border)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--primary)"
                    strokeWidth={4}
                    dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--background)' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    name="Student Entrance Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Occupancy by Zone Pie Chart */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-bl from-accent/5 to-transparent pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>Occupancy by Zone</CardTitle>
              <CardDescription>Spatial distribution across active chambers</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 mt-2">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={metrics.zoneData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {metrics.zoneData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 5) + 1})`} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(var(--card-rgb), 0.9)',
                      borderColor: 'var(--border)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Resource Management */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="relative z-10 border-b border-border/30">
            <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>Library Resources Management (CRUD)</CardTitle>
            <CardDescription className="italic">
              Administrative control over study chambers, equipment, and maintenance cycles
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pt-6">
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Resources</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="occupied">Occupied</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {resources.map(resource => (
                    <div
                      key={resource.resource_id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{resource.resource_name}</p>
                          {resource.is_faculty_exclusive && (
                            <Badge variant="secondary" className="text-xs">Faculty Only</Badge>
                          )}
                        </div>
                        <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Floor {resource.floor} - {resource.zone_location}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {resource.resource_type}
                          </Badge>
                          {resource.has_power_outlet && (
                            <span className="text-xs">⚡ Power Outlet</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            resource.current_status === 'Available'
                              ? 'bg-green-500'
                              : resource.current_status === 'Occupied'
                                ? 'bg-red-500'
                                : resource.current_status === 'Reserved'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-500'
                          }
                        >
                          {resource.current_status}
                        </Badge>
                        <Dialog
                          open={maintenanceDialogOpen && selectedResource?.resource_id === resource.resource_id}
                          onOpenChange={open => {
                            setMaintenanceDialogOpen(open);
                            if (!open) setSelectedResource(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedResource(resource)}
                            >
                              <Wrench className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manage Resource Status</DialogTitle>
                              <DialogDescription>
                                Change the status of {resource.resource_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Current Status</Label>
                                <p className="text-sm text-muted-foreground mt-1">{resource.current_status}</p>
                              </div>
                              <div>
                                <Label htmlFor="new-status">New Status</Label>
                                <Select
                                  onValueChange={value => {
                                    handleToggleMaintenance(
                                      resource.resource_id,
                                      value as 'Available' | 'Under Maintenance'
                                    );
                                  }}
                                >
                                  <SelectTrigger id="new-status">
                                    <SelectValue placeholder="Select new status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Available">Available</SelectItem>
                                    <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="available">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {resources
                    .filter(r => r.current_status === 'Available')
                    .map(resource => (
                      <div
                        key={resource.resource_id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{resource.resource_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Floor {resource.floor} - {resource.zone_location}
                          </p>
                        </div>
                        <Badge className="bg-green-500">Available</Badge>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="occupied">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {resources
                    .filter(r => r.current_status === 'Occupied' || r.current_status === 'Reserved')
                    .map(resource => (
                      <div
                        key={resource.resource_id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{resource.resource_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Floor {resource.floor} - {resource.zone_location}
                          </p>
                        </div>
                        <Badge
                          className={
                            resource.current_status === 'Occupied' ? 'bg-red-500' : 'bg-yellow-500'
                          }
                        >
                          {resource.current_status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="maintenance">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {resources
                    .filter(r => r.current_status === 'Under Maintenance')
                    .map(resource => (
                      <div
                        key={resource.resource_id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{resource.resource_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Floor {resource.floor} - {resource.zone_location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-gray-500">Under Maintenance</Badge>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleToggleMaintenance(resource.resource_id, 'Available')
                            }
                          >
                            Mark Available
                          </Button>
                        </div>
                      </div>
                    ))}
                  {resources.filter(r => r.current_status === 'Under Maintenance').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No resources under maintenance
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Active Users Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 mb-12">
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm group hover:bg-primary/5 hover:border-primary/30 transition-all shadow-md overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                Active Users
                <Users className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{dashboardData.total_active_users}</div>
              <p className="text-[10px] text-primary/70 mt-1 uppercase font-semibold">Currently in library</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30 backdrop-blur-sm group hover:bg-primary/5 hover:border-primary/30 transition-all shadow-md overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                Top Performing Zone
                <MapPin className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{dashboardData.top_performing_zone}</div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">Most utilized area</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30 backdrop-blur-sm group hover:bg-primary/5 hover:border-primary/30 transition-all shadow-md overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                Overall Occupancy
                <TrendingUp className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{dashboardData.occupancy_rate}%</div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">Library-wide rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
