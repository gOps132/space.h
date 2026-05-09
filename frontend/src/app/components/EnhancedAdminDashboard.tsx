import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertCircle, BarChart3, ChevronDown, Download, MoreVertical, Plus, Search, Settings, Users, Wrench } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import {
  dashboardData,
  enhancedAttendanceLogs,
  enhancedReservations,
  enhancedResources,
  type AttendanceLogTransaction,
  type OrganizationDashboard,
  type ReservationTransaction,
  type StudyResource,
} from "../data/enhancedMockData";
import { ApiError, clearSession, getAttendanceLogs, getDashboard, getReservations, getResources } from "../api/client";

export default function EnhancedAdminDashboard() {
  const [resources, setResources] = useState<StudyResource[]>(enhancedResources);
  const [reservations, setReservations] = useState<ReservationTransaction[]>(enhancedReservations);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogTransaction[]>(enhancedAttendanceLogs);
  const [dashboard, setDashboard] = useState<OrganizationDashboard>(dashboardData);
  const [syncState, setSyncState] = useState<"live" | "fallback">("fallback");
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([getResources(), getReservations(), getAttendanceLogs(), getDashboard()])
      .then(([nextResources, nextReservations, nextAttendanceLogs, nextDashboard]) => {
        setResources(nextResources.length > 0 ? nextResources : enhancedResources);
        setReservations(nextReservations);
        setAttendanceLogs(nextAttendanceLogs);
        setDashboard(nextDashboard);
        setSyncState("live");
      })
      .catch((caught) => {
        if (caught instanceof ApiError && (caught.status === 401 || caught.status === 403)) {
          clearSession();
          window.location.assign("/login?redirect=/admin");
          return;
        }

        setResources(enhancedResources);
        setReservations(enhancedReservations);
        setAttendanceLogs(enhancedAttendanceLogs);
        setDashboard(dashboardData);
        setSyncState("fallback");
      });
  }, []);

  const metrics = useMemo(() => {
    const occupiedOrReserved = resources.filter((resource) => resource.current_status === "Occupied" || resource.current_status === "Reserved").length;
    const occupancyRate = resources.length > 0 ? Math.round((occupiedOrReserved / resources.length) * 100) : 0;
    const maintenanceAlerts = resources.filter((resource) => resource.current_status === "Under Maintenance").length;
    const pendingReservations = reservations.filter((reservation) => reservation.booking_status === "Pending").length;
    const noShows = reservations.filter((reservation) => reservation.booking_status === "No-show").length;
    const zones = Array.from(new Set(resources.map((resource) => resource.zone_location)));
    const zoneData = zones.map((zone) => ({
      name: zone,
      value: resources.filter((resource) => resource.zone_location === zone && (resource.current_status === "Occupied" || resource.current_status === "Reserved")).length,
    }));

    return { occupancyRate, maintenanceAlerts, pendingReservations, noShows, zoneData };
  }, [resources, reservations]);

  const filteredResources = resources.filter((resource) => {
    const haystack = `${resource.resource_id} ${resource.resource_name} ${resource.zone_location} ${resource.current_status}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const updateStatus = (resourceId: string, status: StudyResource["current_status"]) => {
    setResources((current) => current.map((resource) => (resource.resource_id === resourceId ? { ...resource, current_status: status } : resource)));
    toast.success(`Resource marked ${status}.`);
  };

  const addSampleResource = () => {
    const nextNumber = resources.length + 1;
    const newResource: StudyResource = {
      resource_id: `SR${String(nextNumber).padStart(3, "0")}`,
      resource_name: `Floor 2 - Desk ${nextNumber}`,
      resource_type: "Individual Seat",
      zone_location: "Collaborative Zone",
      floor: 2,
      current_status: "Available",
      has_power_outlet: true,
    };
    setResources((current) => [...current, newResource]);
    toast.success("Sample resource added.");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(resources, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "spaceh-resources.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Resource data exported.");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-4xl font-serif">Operational Command</h1>
          <p className="font-serif text-lg italic leading-none text-walnut/60">University Library Resource Management</p>
          <p className="mt-3 text-sm text-walnut/45">Source: {syncState === "live" ? "PHP backend" : "local fallback"}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button type="button" onClick={exportData} className="flex items-center gap-2 rounded-xl bg-walnut px-6 py-3 text-sm font-medium text-parchment transition-colors hover:bg-walnut/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25">
            <Download className="h-4 w-4" aria-hidden="true" />
            Export Data
          </button>
          <button type="button" onClick={addSampleResource} className="flex items-center gap-2 rounded-xl bg-oxblood px-6 py-3 text-sm font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Resource
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <AdminStatCard label="Total Spaces" value={resources.length} delta={`${attendanceLogs.length} active logs`} icon={Settings} />
        <AdminStatCard label="Current Occupancy" value={`${metrics.occupancyRate}%`} delta={`${metrics.pendingReservations} pending`} icon={Users} />
        <AdminStatCard label="Maintenance Alerts" value={metrics.maintenanceAlerts} delta="Freeze enabled" icon={Wrench} warning />
        <AdminStatCard label="No-Shows" value={metrics.noShows} delta="Penalty tracked" icon={AlertCircle} warning={metrics.noShows > 0} />
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="academic-border premium-shadow rounded-2xl bg-parchment p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-serif">Traffic Flow</h2>
            <p className="text-sm text-walnut/60">Peak usage carried over from the existing admin analytics.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.peak_time_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,36,30,0.12)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#6B5D50" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B5D50" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "oklch(98.4% 0.012 89)", borderColor: "rgba(45,36,30,0.14)", borderRadius: 12, color: "oklch(25.2% 0.021 56)" }}
                  labelStyle={{ color: "oklch(25.2% 0.021 56)", fontWeight: 600 }}
                  itemStyle={{ color: "oklch(25.2% 0.021 56)" }}
                />
                <Bar dataKey="count" name="Visits" fill="#8C1D1D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="academic-border premium-shadow rounded-2xl bg-walnut p-8 text-parchment/65">
          <div className="mb-6">
            <h2 className="text-2xl font-serif text-parchment">Occupancy by Zone</h2>
            <p className="text-sm">Distribution across active library spaces.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metrics.zoneData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={102} paddingAngle={6}>
                  {metrics.zoneData.map((_, index) => (
                    <Cell key={index} fill={["oklch(70.8% 0.128 84)", "oklch(39.8% 0.055 143)", "oklch(38.6% 0.136 29)", "oklch(91.8% 0.025 83)"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "oklch(25.2% 0.021 56)", borderColor: "rgba(253,252,247,0.18)", borderRadius: 12, color: "oklch(98.4% 0.012 89)" }}
                  labelStyle={{ color: "oklch(98.4% 0.012 89)", fontWeight: 600 }}
                  itemStyle={{ color: "oklch(98.4% 0.012 89)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="academic-border premium-shadow overflow-hidden rounded-2xl bg-parchment">
        <div className="flex flex-col items-center justify-between gap-6 border-b border-walnut/10 p-8 md:flex-row">
          <h2 className="text-2xl font-serif">Space Inventory</h2>
          <div className="relative w-full md:w-[340px]">
            <label htmlFor="admin-resource-search" className="sr-only">Filter resources</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-walnut/30" aria-hidden="true" />
            <input
              id="admin-resource-search"
              name="admin-resource-search"
              type="search"
              placeholder="Filter by ID, zone, or floor..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl bg-walnut/5 py-3 pl-10 pr-4 text-sm font-medium placeholder:text-walnut/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-walnut/10 bg-walnut/5">
                <TableHead>Res. ID</TableHead>
                <TableHead>Space Name</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Floor / Zone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead align="right">Actions</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-walnut/5">
              {filteredResources.map((resource) => (
                <tr key={resource.resource_id} className="transition-colors hover:bg-walnut/[0.02]">
                  <td className="p-6 font-mono text-sm text-walnut/60">{resource.resource_id}</td>
                  <td className="p-6"><span className="font-serif text-lg text-walnut">{resource.resource_name}</span></td>
                  <td className="p-6">
                    <span className={`rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${resource.resource_type === "Group Study Room" ? "border-candlelight text-walnut bg-candlelight/10" : "border-walnut/20 text-walnut/60"}`}>
                      {resource.resource_type}
                    </span>
                  </td>
                  <td className="space-y-1 p-6">
                    <p className="text-sm font-medium text-walnut">Level {resource.floor}</p>
                    <p className="text-xs text-walnut/40">{resource.zone_location}</p>
                  </td>
                  <td className="p-6">
                    <StatusSelect value={resource.current_status} onChange={(status) => updateStatus(resource.resource_id, status)} />
                  </td>
                  <td className="p-6 text-right">
                    <button type="button" aria-label={`Open actions for ${resource.resource_name}`} className="rounded-lg p-2 text-walnut/35 transition-colors hover:bg-oxblood/5 hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20">
                      <MoreVertical className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-walnut/10 bg-walnut/5 p-6 text-xs text-walnut/45">
          <p>Showing {filteredResources.length} of {resources.length} library resources</p>
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}

function AdminStatCard({ label, value, delta, icon: Icon, warning = false }: { label: string; value: string | number; delta: string; icon: typeof Settings; warning?: boolean }) {
  return (
    <div className="academic-border rounded-2xl bg-parchment p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-xl bg-walnut/5 p-3">
          <Icon className={`h-5 w-5 ${warning ? "text-oxblood" : "text-walnut/60"}`} aria-hidden="true" />
        </div>
        <span className="rounded bg-walnut/10 px-2 py-0.5 text-[10px] font-bold text-walnut/45">{delta}</span>
      </div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">{label}</p>
      <p className={`font-serif text-3xl tabular-nums ${warning ? "text-oxblood" : "text-walnut"}`}>{value}</p>
    </div>
  );
}

function TableHead({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return <th className={`p-6 ${align === "right" ? "text-right" : "text-left"} text-[10px] font-bold uppercase tracking-widest text-walnut/40`}>{children}</th>;
}

function StatusSelect({ value, onChange }: { value: StudyResource["current_status"]; onChange: (status: StudyResource["current_status"]) => void }) {
  return (
    <div className="relative inline-flex">
      <select
        aria-label="Resource status"
        value={value}
        onChange={(event) => onChange(event.target.value as StudyResource["current_status"])}
        className="appearance-none rounded-lg bg-walnut/5 py-2 pl-3 pr-9 text-[10px] font-bold uppercase tracking-widest text-walnut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
      >
        <option value="Available">Available</option>
        <option value="Reserved">Reserved</option>
        <option value="Occupied">Occupied</option>
        <option value="Under Maintenance">Under Maintenance</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-walnut/40" aria-hidden="true" />
    </div>
  );
}
