import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AlertCircle, CalendarClock, ChevronDown, Download, MoreVertical, Pencil, Plus, Search, Settings, Trash2, Users, Wrench } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { getPageItems, PaginationControls } from "./ListControls";
import {
  dashboardData,
  defaultLibraryHours,
  enhancedAttendanceLogs,
  enhancedReservations,
  enhancedResources,
  type AttendanceLogTransaction,
  type LibraryHours,
  type OrganizationDashboard,
  type ReservationTransaction,
  type StudyResource,
} from "../data/enhancedMockData";
import {
  ApiError,
  clearSession,
  createResource,
  deleteResource,
  getAttendanceLogs,
  getDashboard,
  getLibraryHours,
  getReservations,
  getResources,
  updateResource,
  updateLibraryHours,
  updateResourceStatus,
} from "../api/client";

type ResourceFormState = {
  resourceName: string;
  resourceType: StudyResource["resource_type"];
  zoneLocation: string;
  floor: string;
  capacity: string;
  minParticipants: string;
  hasPowerOutlet: boolean;
  isFacultyExclusive: boolean;
};

const emptyResourceForm: ResourceFormState = {
  resourceName: "",
  resourceType: "Individual Seat",
  zoneLocation: "",
  floor: "1",
  capacity: "",
  minParticipants: "1",
  hasPowerOutlet: false,
  isFacultyExclusive: false,
};

export default function EnhancedAdminDashboard() {
  const [resources, setResources] = useState<StudyResource[]>(enhancedResources);
  const [reservations, setReservations] = useState<ReservationTransaction[]>(enhancedReservations);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogTransaction[]>(enhancedAttendanceLogs);
  const [dashboard, setDashboard] = useState<OrganizationDashboard>(dashboardData);
  const [libraryHours, setLibraryHours] = useState<LibraryHours>(defaultLibraryHours);
  const [libraryHoursForm, setLibraryHoursForm] = useState({ openTime: defaultLibraryHours.openTime, closeTime: defaultLibraryHours.closeTime });
  const [syncState, setSyncState] = useState<"live" | "fallback">("fallback");
  const [query, setQuery] = useState("");
  const [reservationQuery, setReservationQuery] = useState("");
  const [reservationStatus, setReservationStatus] = useState<ReservationTransaction["booking_status"] | "All">("All");
  const [reservationPage, setReservationPage] = useState(1);
  const [reservationPageSize, setReservationPageSize] = useState(10);
  const [resourcePage, setResourcePage] = useState(1);
  const [resourcePageSize, setResourcePageSize] = useState(10);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<StudyResource | null>(null);
  const [deletingResource, setDeletingResource] = useState<StudyResource | null>(null);
  const [resourceForm, setResourceForm] = useState<ResourceFormState>(emptyResourceForm);
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [isDeletingResource, setIsDeletingResource] = useState(false);
  const [isSavingLibraryHours, setIsSavingLibraryHours] = useState(false);

  const refresh = async () => {
    const [nextResources, nextReservations, nextAttendanceLogs, nextDashboard, nextLibraryHours] = await Promise.all([
      getResources(),
      getReservations(),
      getAttendanceLogs(),
      getDashboard(),
      getLibraryHours(),
    ]);
    setResources(nextResources.length > 0 ? nextResources : enhancedResources);
    setReservations(nextReservations);
    setAttendanceLogs(nextAttendanceLogs);
    setDashboard(nextDashboard);
    setLibraryHours(nextLibraryHours);
    setLibraryHoursForm({ openTime: nextLibraryHours.openTime, closeTime: nextLibraryHours.closeTime });
    setSyncState("live");
  };

  useEffect(() => {
    refresh().catch((caught) => {
      if (caught instanceof ApiError && (caught.status === 401 || caught.status === 403)) {
        clearSession();
        window.location.assign("/login?redirect=/admin");
        return;
      }

      setResources(enhancedResources);
      setReservations(enhancedReservations);
      setAttendanceLogs(enhancedAttendanceLogs);
      setDashboard(dashboardData);
      setLibraryHours(defaultLibraryHours);
      setLibraryHoursForm({ openTime: defaultLibraryHours.openTime, closeTime: defaultLibraryHours.closeTime });
      setSyncState("fallback");
    });
  }, []);

  const metrics = useMemo(() => {
    const occupiedOrReserved = resources.filter((resource) => resource.current_status === "Occupied" || resource.current_status === "Reserved" || resource.current_status === "Maintenance Pending").length;
    const occupancyRate = resources.length > 0 ? Math.round((occupiedOrReserved / resources.length) * 100) : 0;
    const maintenanceAlerts = resources.filter((resource) => resource.current_status === "Under Maintenance" || resource.current_status === "Maintenance Pending").length;
    const pendingReservations = reservations.filter((reservation) => reservation.booking_status === "Pending").length;
    const noShows = reservations.filter((reservation) => reservation.booking_status === "No-show").length;
    const zones = Array.from(new Set(resources.map((resource) => resource.zone_location)));
    const zoneData = zones.map((zone) => ({
      name: zone,
      value: resources.filter((resource) => resource.zone_location === zone && (resource.current_status === "Occupied" || resource.current_status === "Reserved" || resource.current_status === "Maintenance Pending")).length,
    }));

    return { occupancyRate, maintenanceAlerts, pendingReservations, noShows, zoneData };
  }, [resources, reservations]);
  const occupiedZoneData = metrics.zoneData.filter((zone) => zone.value > 0);

  const filteredResources = resources.filter((resource) => {
    const haystack = `${resource.resource_id} ${resource.resource_name} ${resource.zone_location} ${resource.current_status}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const filteredReservations = reservations.filter((reservation) => {
    const resource = resources.find((item) => item.resource_id === reservation.resource_id);
    const haystack = [
      reservation.reservation_id,
      reservation.user_id,
      reservation.user_university_id,
      reservation.user_name,
      reservation.resource_id,
      resource?.resource_name,
      reservation.booking_status,
      reservation.co_bookers?.map((coBooker) => `${coBooker.full_name ?? ""} ${coBooker.university_id}`).join(" "),
    ].join(" ").toLowerCase();
    const matchesQuery = haystack.includes(reservationQuery.toLowerCase());
    const matchesStatus = reservationStatus === "All" || reservation.booking_status === reservationStatus;

    return matchesQuery && matchesStatus;
  });

  useEffect(() => {
    setReservationPage(1);
  }, [reservationPageSize, reservationQuery, reservationStatus]);

  useEffect(() => {
    setResourcePage(1);
  }, [query, resourcePageSize]);

  const { pageItems: pagedReservations, safePage: safeReservationPage } = getPageItems(filteredReservations, reservationPage, reservationPageSize);
  const { pageItems: pagedResources, safePage: safeResourcePage } = getPageItems(filteredResources, resourcePage, resourcePageSize);

  const exportSnapshot = useMemo(() => {
    const resourceById = new Map(resources.map((resource) => [resource.resource_id, resource]));
    const attendanceByReservationId = new Map(attendanceLogs.map((log) => [log.reservation_id, log]));
    const activeAttendanceLogs = attendanceLogs.filter((log) => log.actual_check_in && !log.actual_check_out);
    const unavailableResources = resources.filter((resource) => resource.current_status !== "Available");

    return {
      meta: {
        app: "Space.h",
        syncState,
        filters: {
          resourceSearch: query || null,
          reservationSearch: reservationQuery || null,
          reservationStatus,
        },
      },
      summary: {
        totalResources: resources.length,
        availableResources: resources.filter((resource) => resource.current_status === "Available").length,
        unavailableResources: unavailableResources.length,
        totalReservations: reservations.length,
        pendingReservations: metrics.pendingReservations,
        activeReservations: reservations.filter((reservation) => reservation.booking_status === "Active").length,
        noShows: metrics.noShows,
        attendanceLogs: attendanceLogs.length,
        activeAttendanceLogs: activeAttendanceLogs.length,
        occupancyRate: metrics.occupancyRate,
        maintenanceAlerts: metrics.maintenanceAlerts,
      },
      breakdowns: {
        resourcesByType: countBy(resources, (resource) => resource.resource_type),
        resourcesByStatus: countBy(resources, (resource) => resource.current_status),
        resourcesByFloor: countBy(resources, (resource) => `Level ${resource.floor}`),
        resourcesByZone: countBy(resources, (resource) => resource.zone_location),
        reservationsByStatus: countBy(reservations, (reservation) => reservation.booking_status),
      },
      libraryHours,
      dashboard,
      resources,
      reservations: reservations.map((reservation) => {
        const resource = resourceById.get(reservation.resource_id);
        const attendance = attendanceByReservationId.get(reservation.reservation_id);

        return {
          ...reservation,
          resource: resource
            ? {
                resource_id: resource.resource_id,
                resource_name: resource.resource_name,
                resource_type: resource.resource_type,
                zone_location: resource.zone_location,
                floor: resource.floor,
              }
            : null,
          attendance: attendance ?? null,
        };
      }),
      attendanceLogs,
      filteredView: {
        resourceIds: filteredResources.map((resource) => resource.resource_id),
        reservationIds: filteredReservations.map((reservation) => reservation.reservation_id),
      },
    };
  }, [attendanceLogs, dashboard, filteredReservations, filteredResources, libraryHours, metrics, query, reservationQuery, reservationStatus, reservations, resources, syncState]);

  const updateStatus = async (resourceId: string, status: StudyResource["current_status"]) => {
    try {
      const result = await updateResourceStatus(resourceId, status);
      await refresh();
      toast.success(result.message);
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Status update failed.");
    }
  };

  const updateResourceForm = <Key extends keyof ResourceFormState>(key: Key, value: ResourceFormState[Key]) => {
    setResourceForm((current) => ({ ...current, [key]: value }));
  };

  const saveLibraryHours = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingLibraryHours(true);
    try {
      const result = await updateLibraryHours(libraryHoursForm);
      setLibraryHours(result.libraryHours);
      setLibraryHoursForm({ openTime: result.libraryHours.openTime, closeTime: result.libraryHours.closeTime });
      toast.success(result.message);
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Library hours update failed.");
    } finally {
      setIsSavingLibraryHours(false);
    }
  };

  const openCreateResource = () => {
    setEditingResource(null);
    setResourceForm(emptyResourceForm);
    setIsResourceDialogOpen(true);
  };

  const openEditResource = (resource: StudyResource) => {
    setEditingResource(resource);
    setResourceForm(resourceToForm(resource));
    setIsResourceDialogOpen(true);
  };

  const handleResourceDialogChange = (open: boolean) => {
    setIsResourceDialogOpen(open);
    if (!open) {
      setEditingResource(null);
      setResourceForm(emptyResourceForm);
      setIsCreatingResource(false);
    }
  };

  const submitResource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const floor = Number(resourceForm.floor);
    const capacity = resourceForm.capacity === "" ? undefined : Number(resourceForm.capacity);
    const minParticipants = Number(resourceForm.minParticipants);

    if (!resourceForm.resourceName.trim() || !resourceForm.zoneLocation.trim() || !Number.isInteger(floor) || floor < 1) {
      toast.error("Resource name, zone, and floor are required.");
      return;
    }

    if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 1)) {
      toast.error("Capacity must be a positive whole number.");
      return;
    }

    if (!Number.isInteger(minParticipants) || minParticipants < 1) {
      toast.error("Minimum participants must be a positive whole number.");
      return;
    }

    setIsCreatingResource(true);
    try {
      const payload = {
        resourceName: resourceForm.resourceName.trim(),
        resourceType: resourceForm.resourceType,
        zoneLocation: resourceForm.zoneLocation.trim(),
        floor,
        capacity,
        minParticipants,
        hasPowerOutlet: resourceForm.hasPowerOutlet,
        isFacultyExclusive: resourceForm.isFacultyExclusive,
      };

      if (editingResource) {
        await updateResource(editingResource.resource_id, payload);
      } else {
        await createResource(payload);
      }

      await refresh();
      handleResourceDialogChange(false);
      toast.success(editingResource ? "Resource updated." : "Resource added.");
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Resource save failed.");
      setIsCreatingResource(false);
    }
  };

  const confirmDeleteResource = async () => {
    if (!deletingResource) return;

    setIsDeletingResource(true);
    try {
      await deleteResource(deletingResource.resource_id);
      await refresh();
      toast.success("Resource deleted.");
      setDeletingResource(null);
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Resource delete failed.");
    } finally {
      setIsDeletingResource(false);
    }
  };

  const exportData = () => {
    const exportedAt = new Date().toISOString();
    const payload = { ...exportSnapshot, meta: { ...exportSnapshot.meta, exportedAt } };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `spaceh-operations-${formatExportDate(exportedAt)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Operations data exported.");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-4xl font-serif">Library Operations</h1>
          <p className="font-serif text-lg italic leading-none text-walnut/60">Monitor spaces, reservations, and maintenance.</p>
          <p className="mt-3 text-sm text-walnut/45">{syncState === "live" ? "Showing live data" : "Showing latest saved data"}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <button type="button" onClick={exportData} className="flex items-center justify-center gap-2 rounded-xl bg-walnut px-5 py-3 text-sm font-medium text-parchment transition-colors hover:bg-walnut/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25">
            <Download className="h-4 w-4" aria-hidden="true" />
            Export Data
          </button>
          <button type="button" onClick={openCreateResource} className="flex items-center justify-center gap-2 rounded-xl bg-oxblood px-5 py-3 text-sm font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Resource
          </button>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <AdminStatCard label="Total Spaces" value={resources.length} delta={`${attendanceLogs.length} active logs`} icon={Settings} />
        <AdminStatCard label="Current Occupancy" value={`${metrics.occupancyRate}%`} delta={`${metrics.pendingReservations} pending`} icon={Users} />
        <AdminStatCard label="Maintenance" value={metrics.maintenanceAlerts} delta="Unavailable for booking" icon={Wrench} warning />
        <AdminStatCard label="No-Shows" value={metrics.noShows} delta="Booking holds" icon={AlertCircle} warning={metrics.noShows > 0} />
      </section>

      <section className="academic-border premium-shadow rounded-2xl bg-parchment p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-walnut/45">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Library Hours</p>
            </div>
            <h2 className="text-2xl font-serif">Reservation Window</h2>
            <p className="mt-1 text-sm text-walnut/60">Booking requests must stay inside {libraryHours.openTime}-{libraryHours.closeTime}, use {libraryHours.slotMinutes}-minute slots, and stay within {libraryHours.maxAdvanceDays} days.</p>
          </div>
          <span className="w-fit rounded-lg bg-walnut/5 px-3 py-2 font-mono text-xs text-walnut/50">{libraryHours.timezone}</span>
        </div>

        <form onSubmit={saveLibraryHours} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <label className="space-y-2">
            <span className="px-1 text-[10px] font-bold uppercase tracking-widest text-walnut/40">Open</span>
            <input
              type="time"
              step={libraryHours.slotMinutes * 60}
              value={libraryHoursForm.openTime}
              onChange={(event) => setLibraryHoursForm((current) => ({ ...current, openTime: event.target.value }))}
              className="academic-border w-full rounded-xl bg-parchment px-4 py-3 text-sm font-medium text-walnut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
            />
          </label>
          <label className="space-y-2">
            <span className="px-1 text-[10px] font-bold uppercase tracking-widest text-walnut/40">Close</span>
            <input
              type="time"
              step={libraryHours.slotMinutes * 60}
              value={libraryHoursForm.closeTime}
              onChange={(event) => setLibraryHoursForm((current) => ({ ...current, closeTime: event.target.value }))}
              className="academic-border w-full rounded-xl bg-parchment px-4 py-3 text-sm font-medium text-walnut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
            />
          </label>
          <button
            type="submit"
            disabled={isSavingLibraryHours}
            className="rounded-xl bg-walnut px-5 py-3 text-sm font-medium text-parchment transition-colors hover:bg-walnut/90 disabled:cursor-not-allowed disabled:bg-walnut/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25"
          >
            {isSavingLibraryHours ? "Saving..." : "Save Hours"}
          </button>
        </form>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="academic-border premium-shadow rounded-2xl bg-parchment p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-serif">Traffic Flow</h2>
            <p className="text-sm text-walnut/60">Visits by hour, used to plan staffing and room turnover.</p>
          </div>
          <div className="h-64 sm:h-72">
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

        <div className="academic-border premium-shadow rounded-2xl bg-walnut p-5 text-parchment/65 sm:p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-serif text-parchment">Occupancy by Zone</h2>
            <p className="text-sm">Distribution across active library spaces.</p>
          </div>
          <div className="h-64 sm:h-72">
            {occupiedZoneData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={occupiedZoneData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={102} paddingAngle={6}>
                    {occupiedZoneData.map((_, index) => (
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
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-parchment/15 bg-parchment/[0.04] p-6 text-center">
                <p className="font-serif text-2xl text-parchment">No occupied zones</p>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-parchment/55">Reserved, occupied, or maintenance-pending spaces will appear here by zone.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="academic-border premium-shadow overflow-hidden rounded-2xl bg-parchment">
        <div className="flex flex-col gap-5 border-b border-walnut/10 p-5 md:flex-row md:items-end md:justify-between md:p-6">
          <div>
            <div className="mb-2 flex items-center gap-2 text-walnut/45">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Reservation Ledger</p>
            </div>
            <h2 className="text-2xl font-serif">Booking Records</h2>
            <p className="mt-1 max-w-2xl text-sm text-walnut/60">Review holds, active sessions, completed visits, cancellations, and no-shows.</p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto] md:w-auto">
            <div className="relative md:w-[320px]">
              <label htmlFor="admin-reservation-search" className="sr-only">Search reservations</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-walnut/30" aria-hidden="true" />
              <input
                id="admin-reservation-search"
                name="admin-reservation-search"
                type="search"
                placeholder="Search reservation, user, or space..."
                value={reservationQuery}
                onChange={(event) => setReservationQuery(event.target.value)}
                className="w-full rounded-xl bg-walnut/5 py-3 pl-10 pr-4 text-sm font-medium placeholder:text-walnut/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
              />
            </div>

            <div className="relative">
              <label htmlFor="admin-reservation-status" className="sr-only">Filter reservation status</label>
              <select
                id="admin-reservation-status"
                value={reservationStatus}
                onChange={(event) => setReservationStatus(event.target.value as ReservationTransaction["booking_status"] | "All")}
                className="w-full appearance-none rounded-xl bg-walnut/5 py-3 pl-4 pr-10 text-sm font-medium text-walnut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 sm:w-[170px]"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No-show">No-show</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-walnut/40" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="max-h-[38rem] divide-y divide-walnut/5 overflow-y-auto md:hidden">
          {filteredReservations.length === 0 ? (
            <p className="p-5 text-sm italic text-walnut/45">No reservations match this view.</p>
          ) : (
            pagedReservations.map((reservation) => (
              <ReservationMobileCard
                key={reservation.reservation_id}
                attendance={attendanceLogs.find((log) => log.reservation_id === reservation.reservation_id)}
                reservation={reservation}
                resource={resources.find((resource) => resource.resource_id === reservation.resource_id)}
              />
            ))
          )}
        </div>

        <div className="hidden max-h-[36rem] overflow-auto md:block">
          <table className="w-full min-w-[1060px] border-collapse text-left">
            <thead>
              <tr className="border-b border-walnut/10 bg-walnut/5">
                <TableHead>Reservation</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Space</TableHead>
                <TableHead>Window</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Group</TableHead>
                <TableHead align="right">Status</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-walnut/5">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-sm italic text-walnut/45">No reservations match this view.</td>
                </tr>
              ) : (
                pagedReservations.map((reservation) => {
                  const resource = resources.find((item) => item.resource_id === reservation.resource_id);
                  const attendance = attendanceLogs.find((log) => log.reservation_id === reservation.reservation_id);

                  return (
                    <tr key={reservation.reservation_id} className="transition-colors hover:bg-walnut/[0.02]">
                      <td className="p-5 font-mono text-sm text-walnut/60">{reservation.reservation_id}</td>
                      <td className="p-5"><UserIdentity reservation={reservation} /></td>
                      <td className="space-y-1 p-5">
                        <p className="font-serif text-lg text-walnut">{resource?.resource_name ?? reservation.resource_id}</p>
                        <p className="font-mono text-xs text-walnut/40">{reservation.resource_id}</p>
                      </td>
                      <td className="p-5 text-sm text-walnut/60">{formatReservationWindow(reservation.start_time, reservation.end_time)}</td>
                      <td className="p-5 text-sm text-walnut/60">{formatAttendanceState(attendance)}</td>
                      <td className="p-5"><CoBookerList coBookers={reservation.co_bookers} /></td>
                      <td className="p-5 text-right"><ReservationStatusBadge status={reservation.booking_status} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          label="reservation records"
          page={safeReservationPage}
          pageSize={reservationPageSize}
          totalItems={filteredReservations.length}
          onPageChange={setReservationPage}
          onPageSizeChange={setReservationPageSize}
        />
      </section>

      <section className="academic-border premium-shadow overflow-hidden rounded-2xl bg-parchment">
        <div className="flex flex-col items-start justify-between gap-5 border-b border-walnut/10 p-5 md:flex-row md:items-center md:p-6">
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

        <div className="max-h-[38rem] divide-y divide-walnut/5 overflow-y-auto md:hidden">
          {pagedResources.map((resource) => (
            <ResourceMobileCard
              key={resource.resource_id}
              resource={resource}
              onDelete={() => setDeletingResource(resource)}
              onEdit={() => openEditResource(resource)}
              onStatusChange={(status) => updateStatus(resource.resource_id, status)}
            />
          ))}
        </div>

        <div className="hidden max-h-[36rem] overflow-auto md:block">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-walnut/10 bg-walnut/5">
                <TableHead>Res. ID</TableHead>
                <TableHead>Space Name</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Minimum</TableHead>
                <TableHead>Floor / Zone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead align="right">Actions</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-walnut/5">
              {pagedResources.map((resource) => (
                <tr key={resource.resource_id} className="transition-colors hover:bg-walnut/[0.02]">
                  <td className="p-5 font-mono text-sm text-walnut/60">{resource.resource_id}</td>
                  <td className="p-5"><span className="font-serif text-lg text-walnut">{resource.resource_name}</span></td>
                  <td className="p-5">
                    <span className={`rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${resource.resource_type === "Group Study Room" ? "border-candlelight text-walnut bg-candlelight/10" : "border-walnut/20 text-walnut/60"}`}>
                      {resource.resource_type}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-walnut/60">
                    <span className="font-mono tabular-nums">{resource.min_participants ?? 1}</span> min
                    {resource.is_faculty_exclusive && <span className="ml-2 rounded bg-oxblood/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-oxblood">Faculty</span>}
                  </td>
                  <td className="space-y-1 p-5">
                    <p className="text-sm font-medium text-walnut">Level {resource.floor}</p>
                    <p className="text-xs text-walnut/40">{resource.zone_location}</p>
                  </td>
                  <td className="p-5">
                    <StatusSelect value={resource.current_status} onChange={(status) => updateStatus(resource.resource_id, status)} />
                  </td>
                  <td className="p-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" aria-label={`Open actions for ${resource.resource_name}`} className="rounded-lg p-2 text-walnut/35 transition-colors hover:bg-oxblood/5 hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20">
                          <MoreVertical className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-walnut/10 bg-parchment text-walnut">
                        <DropdownMenuItem onSelect={() => openEditResource(resource)} className="cursor-pointer focus:bg-walnut/5">
                          <Pencil className="h-4 w-4 text-walnut/50" aria-hidden="true" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeletingResource(resource)} variant="destructive" className="cursor-pointer focus:bg-oxblood/10">
                          <Trash2 className="h-4 w-4 text-oxblood" aria-hidden="true" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationControls
          label="library resources"
          page={safeResourcePage}
          pageSize={resourcePageSize}
          pageSizeOptions={[10]}
          totalItems={filteredResources.length}
          onPageChange={setResourcePage}
          onPageSizeChange={setResourcePageSize}
        />
      </section>

      <AddResourceDialog
        editingResource={editingResource}
        form={resourceForm}
        isCreating={isCreatingResource}
        open={isResourceDialogOpen}
        onOpenChange={handleResourceDialogChange}
        onSubmit={submitResource}
        onUpdate={updateResourceForm}
      />
      <DeleteResourceDialog
        isDeleting={isDeletingResource}
        resource={deletingResource}
        onCancel={() => setDeletingResource(null)}
        onConfirm={confirmDeleteResource}
      />
    </div>
  );
}

function resourceToForm(resource: StudyResource): ResourceFormState {
  return {
    resourceName: resource.resource_name,
    resourceType: resource.resource_type,
    zoneLocation: resource.zone_location,
    floor: String(resource.floor),
    capacity: resource.capacity ? String(resource.capacity) : "",
    minParticipants: String(resource.min_participants ?? 1),
    hasPowerOutlet: Boolean(resource.has_power_outlet),
    isFacultyExclusive: Boolean(resource.is_faculty_exclusive),
  };
}

function countBy<Item>(items: Item[], getKey: (item: Item) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function formatExportDate(value: string): string {
  return value.replace(/[:.]/g, "-");
}

function ReservationMobileCard({
  attendance,
  reservation,
  resource,
}: {
  attendance?: AttendanceLogTransaction;
  reservation: ReservationTransaction;
  resource?: StudyResource;
}) {
  return (
    <article className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs text-walnut/45">{reservation.reservation_id}</p>
          <h3 className="mt-1 text-xl font-serif text-walnut">{resource?.resource_name ?? reservation.resource_id}</h3>
          <p className="mt-1 font-mono text-xs text-walnut/40">{reservation.user_id} / {reservation.resource_id}</p>
          {reservation.user_name && <p className="mt-2 text-sm text-walnut/60">Booked by {reservation.user_name}</p>}
        </div>
        <ReservationStatusBadge status={reservation.booking_status} />
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-walnut/35">Window</dt>
          <dd className="mt-1 text-walnut/65">{formatReservationWindow(reservation.start_time, reservation.end_time)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-walnut/35">Attendance</dt>
          <dd className="mt-1 text-walnut/65">{formatAttendanceState(attendance)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-walnut/35">Group</dt>
          <dd className="mt-1 text-walnut/65"><CoBookerList coBookers={reservation.co_bookers} compact /></dd>
        </div>
      </dl>
    </article>
  );
}

function ReservationStatusBadge({ status }: { status: ReservationTransaction["booking_status"] }) {
  const tone = {
    Active: "border-moss/25 bg-moss/10 text-moss",
    Pending: "border-candlelight/35 bg-candlelight/15 text-walnut",
    Completed: "border-walnut/15 bg-walnut/5 text-walnut/60",
    Cancelled: "border-walnut/15 bg-walnut/5 text-walnut/45",
    "No-show": "border-oxblood/25 bg-oxblood/10 text-oxblood",
  }[status];

  return (
    <span className={`inline-flex rounded border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${tone}`}>
      {status}
    </span>
  );
}

function formatReservationWindow(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startTime} to ${endTime}`;
  }

  const date = start.toLocaleDateString([], { month: "short", day: "numeric" });
  const startLabel = start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const endLabel = end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return `${date}, ${startLabel} to ${endLabel}`;
}

function formatAttendanceState(attendance?: AttendanceLogTransaction): string {
  if (!attendance?.actual_check_in) {
    return "Not checked in";
  }

  const checkIn = new Date(attendance.actual_check_in);
  const checkInLabel = Number.isNaN(checkIn.getTime())
    ? attendance.actual_check_in
    : checkIn.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (!attendance.actual_check_out) {
    return `In at ${checkInLabel}`;
  }

  const checkOut = new Date(attendance.actual_check_out);
  const checkOutLabel = Number.isNaN(checkOut.getTime())
    ? attendance.actual_check_out
    : checkOut.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return `${checkInLabel} to ${checkOutLabel}`;
}

function UserIdentity({ reservation }: { reservation: ReservationTransaction }) {
  return (
    <div className="min-w-[10rem] space-y-1">
      <p className="font-medium text-walnut">{reservation.user_name ?? reservation.user_id}</p>
      <p className="font-mono text-xs text-walnut/45">{reservation.user_university_id ?? reservation.user_id}</p>
    </div>
  );
}

function CoBookerList({ coBookers, compact = false }: { coBookers?: ReservationTransaction["co_bookers"]; compact?: boolean }) {
  if (!coBookers || coBookers.length === 0) {
    return <span className="text-sm text-walnut/45">Solo</span>;
  }

  return (
    <div className={compact ? "space-y-1" : "min-w-[12rem] space-y-2"}>
      {coBookers.map((coBooker) => (
        <div key={coBooker.university_id} className="space-y-0.5">
          <p className="text-sm font-medium text-walnut/75">{coBooker.full_name ?? "Unmatched ID"}</p>
          <p className="font-mono text-xs text-walnut/40">{coBooker.university_id}</p>
        </div>
      ))}
    </div>
  );
}

function AdminStatCard({ label, value, delta, icon: Icon, warning = false }: { label: string; value: string | number; delta: string; icon: typeof Settings; warning?: boolean }) {
  return (
    <div className="academic-border rounded-xl bg-parchment p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="rounded-lg bg-walnut/5 p-2.5">
          <Icon className={`h-4 w-4 ${warning ? "text-oxblood" : "text-walnut/60"}`} aria-hidden="true" />
        </div>
        <span className="max-w-[8.5rem] rounded bg-walnut/10 px-2 py-0.5 text-right text-[10px] font-bold leading-tight text-walnut/45">{delta}</span>
      </div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">{label}</p>
      <p className={`font-serif text-2xl tabular-nums sm:text-3xl ${warning ? "text-oxblood" : "text-walnut"}`}>{value}</p>
    </div>
  );
}

function TableHead({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return <th className={`p-5 ${align === "right" ? "text-right" : "text-left"} text-[10px] font-bold uppercase tracking-widest text-walnut/40`}>{children}</th>;
}

function ResourceMobileCard({
  onDelete,
  onEdit,
  onStatusChange,
  resource,
}: {
  onDelete: () => void;
  onEdit: () => void;
  onStatusChange: (status: StudyResource["current_status"]) => void;
  resource: StudyResource;
}) {
  return (
    <article className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs text-walnut/45">{resource.resource_id}</p>
          <h3 className="mt-1 text-xl font-serif text-walnut">{resource.resource_name}</h3>
          <p className="mt-1 text-sm text-walnut/50">Level {resource.floor}, {resource.zone_location}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`Open actions for ${resource.resource_name}`} className="rounded-lg p-2 text-walnut/35 transition-colors hover:bg-oxblood/5 hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20">
              <MoreVertical className="h-5 w-5" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-walnut/10 bg-parchment text-walnut">
            <DropdownMenuItem onSelect={onEdit} className="cursor-pointer focus:bg-walnut/5">
              <Pencil className="h-4 w-4 text-walnut/50" aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDelete} variant="destructive" className="cursor-pointer focus:bg-oxblood/10">
              <Trash2 className="h-4 w-4 text-oxblood" aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${resource.resource_type === "Group Study Room" ? "border-candlelight text-walnut bg-candlelight/10" : "border-walnut/20 text-walnut/60"}`}>
          {resource.resource_type}
        </span>
        <span className="rounded border border-walnut/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-walnut/60">
          {resource.min_participants ?? 1} min
        </span>
        {resource.is_faculty_exclusive && <span className="rounded bg-oxblood/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-oxblood">Faculty</span>}
      </div>

      <StatusSelect value={resource.current_status} onChange={onStatusChange} />
    </article>
  );
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
        <option value="Maintenance Pending" disabled>Maintenance Pending</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-walnut/40" aria-hidden="true" />
    </div>
  );
}

function AddResourceDialog({
  editingResource,
  form,
  isCreating,
  open,
  onOpenChange,
  onSubmit,
  onUpdate,
}: {
  editingResource: StudyResource | null;
  form: ResourceFormState;
  isCreating: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdate: <Key extends keyof ResourceFormState>(key: Key, value: ResourceFormState[Key]) => void;
}) {
  const roomLike = form.resourceType !== "Individual Seat";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto border-walnut/15 bg-parchment p-0 text-walnut sm:max-w-2xl">
        <form onSubmit={onSubmit}>
          <DialogHeader className="border-b border-walnut/10 px-6 py-5 text-left">
            <DialogTitle className="font-serif text-2xl text-walnut">{editingResource ? "Edit Library Resource" : "Add Library Resource"}</DialogTitle>
            <DialogDescription className="text-sm text-walnut/60">
              {editingResource ? "Update the location, capacity, and booking rules for this space." : "Add a space with its location, capacity, and booking rules."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
            <ResourceTextField
              id="resource-name"
              label="Resource Name"
              placeholder="Floor 2 - Desk 14"
              value={form.resourceName}
              onChange={(value) => onUpdate("resourceName", value)}
              required
            />

            <ResourceSelectField
              id="resource-type"
              label="Classification"
              value={form.resourceType}
              onChange={(value) => {
                const nextType = value as StudyResource["resource_type"];
                onUpdate("resourceType", nextType);
                onUpdate("minParticipants", nextType === "Group Study Room" ? "3" : "1");
              }}
            >
              <option value="Individual Seat">Individual Seat</option>
              <option value="Group Study Room">Group Study Room</option>
              <option value="Consultation Room">Consultation Room</option>
            </ResourceSelectField>

            <ResourceTextField
              id="zone-location"
              label="Zone / Location"
              placeholder="Silent Zone"
              value={form.zoneLocation}
              onChange={(value) => onUpdate("zoneLocation", value)}
              required
            />

            <ResourceTextField
              id="resource-floor"
              label="Floor"
              min="1"
              type="number"
              value={form.floor}
              onChange={(value) => onUpdate("floor", value)}
              required
            />

            <ResourceTextField
              id="resource-capacity"
              label="Capacity"
              min="1"
              placeholder={roomLike ? "6" : "Optional"}
              type="number"
              value={form.capacity}
              onChange={(value) => onUpdate("capacity", value)}
            />

            <ResourceTextField
              id="minimum-participants"
              label="Minimum Students"
              min="1"
              placeholder={roomLike ? "3" : "1"}
              type="number"
              value={form.minParticipants}
              onChange={(value) => onUpdate("minParticipants", value)}
              required
            />

            <div className="flex flex-col justify-end gap-3 rounded-xl border border-walnut/10 bg-walnut/[0.03] p-4">
              <ToggleField
                checked={form.hasPowerOutlet}
                label="Power outlet"
                onChange={(checked) => onUpdate("hasPowerOutlet", checked)}
              />
              <ToggleField
                checked={form.isFacultyExclusive}
                label="Faculty-exclusive"
                onChange={(checked) => onUpdate("isFacultyExclusive", checked)}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-walnut/10 bg-walnut/[0.03] px-6 py-5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-walnut/15 px-5 py-3 text-sm font-medium text-walnut transition-colors hover:bg-walnut/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-oxblood px-5 py-3 text-sm font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25 disabled:cursor-not-allowed disabled:bg-walnut/20 disabled:text-walnut/45"
              disabled={isCreating}
            >
              {isCreating ? "Saving Resource..." : editingResource ? "Save Changes" : "Add Resource"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteResourceDialog({
  isDeleting,
  onCancel,
  onConfirm,
  resource,
}: {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  resource: StudyResource | null;
}) {
  return (
    <Dialog open={Boolean(resource)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="border-walnut/15 bg-parchment text-walnut sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="font-serif text-2xl text-walnut">Delete Resource</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-walnut/60">
            {resource ? `Delete ${resource.resource_name}? Resources with reservations are protected and will be refused by the backend.` : "Delete this resource?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-walnut/15 px-5 py-3 text-sm font-medium text-walnut transition-colors hover:bg-walnut/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-oxblood px-5 py-3 text-sm font-medium text-parchment shadow-lg transition-colors hover:bg-oxblood/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/25 disabled:cursor-not-allowed disabled:bg-walnut/20 disabled:text-walnut/45"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Resource"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResourceTextField({
  id,
  label,
  onChange,
  value,
  min,
  placeholder,
  required = false,
  type = "text",
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
  min?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">{label}</label>
      <input
        id={id}
        min={min}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="academic-border w-full rounded-xl bg-parchment px-4 py-3 text-sm text-walnut placeholder:text-walnut/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
      />
    </div>
  );
}

function ResourceSelectField({
  children,
  id,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="px-1 text-[10px] font-semibold uppercase tracking-widest text-walnut/40">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="academic-border w-full appearance-none rounded-xl bg-parchment py-3 pl-4 pr-10 text-sm font-medium text-walnut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-walnut/40" aria-hidden="true" />
      </div>
    </div>
  );
}

function ToggleField({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 text-sm font-medium text-walnut">
      <span>{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-walnut/20 accent-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
      />
    </label>
  );
}
