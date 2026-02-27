import { useState, useMemo } from "react";
import { Link } from "react-router";
import { ArrowLeft, AlertCircle, TrendingUp, Users, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ResourceManagement from "./ResourceManagement";
import ReservationCalendar from "./ReservationCalendar";
import {
  mockResources,
  mockReservations,
  mockUsageLogs,
  peakUsageData,
  type Resource,
  type Reservation,
  type UsageLog,
} from "../data/mockData";

export default function AdminDashboard() {
  const [resources] = useState<Resource[]>(mockResources);
  const [reservations] = useState<Reservation[]>(mockReservations);
  const [usageLogs] = useState<UsageLog[]>(mockUsageLogs);

  // Business Rule 5: Calculate metrics
  const metrics = useMemo(() => {
    // Total Occupancy
    const totalSeats = resources.filter((r) => r.resource_type === "Seat").length;
    const occupiedSeats = resources.filter(
      (r) => r.resource_type === "Seat" && r.status === "Occupied"
    ).length;
    const occupancyRate = totalSeats > 0 ? (occupiedSeats / totalSeats) * 100 : 0;

    // Pending Issues (No-shows)
    const noShows = reservations.filter((r) => r.status === "No-show").length;

    // Zone utilization
    const zoneUsage = resources.reduce((acc, resource) => {
      const zone = resource.zone;
      if (!acc[zone]) {
        acc[zone] = { total: 0, occupied: 0, reserved: 0 };
      }
      acc[zone].total += 1;
      if (resource.status === "Occupied") acc[zone].occupied += 1;
      if (resource.status === "Reserved") acc[zone].reserved += 1;
      return acc;
    }, {} as Record<string, { total: number; occupied: number; reserved: number }>);

    const zoneHeatmap = Object.entries(zoneUsage)
      .map(([zone, stats]) => ({
        zone,
        total: stats.total,
        occupied: stats.occupied,
        reserved: stats.reserved,
        utilizationRate: ((stats.occupied + stats.reserved) / stats.total) * 100,
      }))
      .sort((a, b) => b.utilizationRate - a.utilizationRate);

    return {
      occupancyRate: occupancyRate.toFixed(1),
      totalSeats,
      occupiedSeats,
      noShows,
      zoneHeatmap,
    };
  }, [resources, reservations]);

  // Active reservations
  const activeReservations = reservations.filter(
    (r) => r.status === "Confirmed" || r.status === "Pending"
  );

  // Active sessions (checked in but not checked out)
  const activeSessions = usageLogs.filter((log) => log.check_out_time === null);

  return (
    <div className="min-h-screen bg-background paper-texture">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>Admin Dashboard</h1>
            </div>
            <Badge variant="outline">Real-time Analytics</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Occupancy</CardDescription>
              <CardTitle className="text-3xl">{metrics.occupancyRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {metrics.occupiedSeats} / {metrics.totalSeats} seats occupied
              </p>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-moss transition-all"
                  style={{ width: `${metrics.occupancyRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Reservations</CardDescription>
              <CardTitle className="text-3xl">{activeReservations.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Currently booked resources</p>
              <TrendingUp className="h-4 w-4 text-moss mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Sessions</CardDescription>
              <CardTitle className="text-3xl">{activeSessions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Users currently checked in</p>
              <Users className="h-4 w-4 text-moss mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Issues</CardDescription>
              <CardTitle className="text-3xl text-destructive">{metrics.noShows}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No-show reservations</p>
              <AlertCircle className="h-4 w-4 text-destructive mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="peak-hours" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="peak-hours">Peak Hours</TabsTrigger>
            <TabsTrigger value="zone-heatmap">Zone Heatmap</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          {/* Peak Usage Hours */}
          <TabsContent value="peak-hours">
            <Card>
              <CardHeader>
                <CardTitle>Peak Usage Hours</CardTitle>
                <CardDescription>
                  Bar chart showing which hours have the most reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={peakUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3D4F3D" name="Reservations" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zone Heatmap */}
          <TabsContent value="zone-heatmap">
            <Card>
              <CardHeader>
                <CardTitle>Zone Utilization Heatmap</CardTitle>
                <CardDescription>
                  Which library zones are most utilized
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.zoneHeatmap.map((zone, index) => (
                    <div key={zone.zone} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{zone.zone}</span>
                          {index === 0 && (
                            <Badge variant="destructive" className="text-xs">
                              Highest
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {zone.occupied + zone.reserved} / {zone.total} in use
                          </span>
                          <span className="font-medium">{zone.utilizationRate.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div
                            className="bg-destructive"
                            style={{ width: `${(zone.occupied / zone.total) * 100}%` }}
                            title={`Occupied: ${zone.occupied}`}
                          />
                          <div
                            className="bg-candlelight"
                            style={{ width: `${(zone.reserved / zone.total) * 100}%` }}
                            title={`Reserved: ${zone.reserved}`}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-destructive rounded-sm" />
                          Occupied: {zone.occupied}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-candlelight rounded-sm" />
                          Reserved: {zone.reserved}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-muted rounded-sm" />
                          Available: {zone.total - zone.occupied - zone.reserved}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Overview */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>All Resources</CardTitle>
                <CardDescription>Complete list of library resources and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {resources.map((resource) => (
                    <div
                      key={resource.resource_id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium" style={{ fontFamily: 'var(--font-heading)' }}>{resource.resource_name}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {resource.zone}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {resource.resource_type}
                          </Badge>
                        </div>
                      </div>
                      <Badge
                        className={
                          resource.status === "Available"
                            ? "bg-moss text-primary-foreground border-none"
                            : resource.status === "Occupied"
                              ? "bg-destructive text-destructive-foreground border-none"
                              : "bg-candlelight text-walnut border-none"
                        }
                      >
                        {resource.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resource Management */}
          <TabsContent value="manage">
            <ResourceManagement />
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar">
            <ReservationCalendar />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}