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
              <div>
                <h1 className="text-2xl">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">LibSpace Management Console</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              <Settings className="mr-1 h-3 w-3" />
              Admin Access
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Top Row - Key Metrics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Seats</CardDescription>
              <CardTitle className="text-3xl">{metrics.totalSeats}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Currently Occupied: <span className="font-medium">{metrics.occupiedSeats}</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${metrics.occupancyRate}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {metrics.occupancyRate}% Occupancy
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Reservations</CardDescription>
              <CardTitle className="text-3xl">{metrics.pendingReservations}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Awaiting check-in</p>
              <TrendingUp className="h-4 w-4 text-blue-600 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Maintenance Alerts</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{metrics.maintenanceAlerts}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Resources under maintenance</p>
              <Wrench className="h-4 w-4 text-orange-600 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>No-Shows</CardDescription>
              <CardTitle className="text-3xl text-red-600">{metrics.noShows}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Missed reservations</p>
              <AlertCircle className="h-4 w-4 text-red-600 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Middle Row - Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Flow Line Graph */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Flow Throughout the Day</CardTitle>
              <CardDescription>Peak hours analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.peak_time_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Students" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Occupancy by Zone Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Occupancy by Zone</CardTitle>
              <CardDescription>Current distribution across library zones</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.zoneData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.zoneData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Resource Management */}
        <Card>
          <CardHeader>
            <CardTitle>Library Resources Management (CRUD)</CardTitle>
            <CardDescription>
              Edit seat numbers, change room status, and manage library equipment
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{resource.resource_name}</p>
                          {resource.is_faculty_exclusive && (
                            <Badge variant="secondary" className="text-xs">Faculty Only</Badge>
                          )}
                        </div>
                        <div className="flex gap-3 mt-2 text-sm text-gray-600">
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
                                <p className="text-sm text-gray-600 mt-1">{resource.current_status}</p>
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
                          <p className="text-sm text-gray-600">
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
                          <p className="text-sm text-gray-600">
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
                        className="flex items-center justify-between p-4 border rounded-lg bg-orange-50"
                      >
                        <div>
                          <p className="font-medium">{resource.resource_name}</p>
                          <p className="text-sm text-gray-600">
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
                    <p className="text-center text-gray-500 py-8">
                      No resources under maintenance
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Active Users Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium">{dashboardData.total_active_users}</div>
              <p className="text-sm text-gray-600 mt-1">Currently in library</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">{dashboardData.top_performing_zone}</div>
              <p className="text-sm text-gray-600 mt-1">Most utilized area</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium">{dashboardData.occupancy_rate}%</div>
              <p className="text-sm text-gray-600 mt-1">Library-wide rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
