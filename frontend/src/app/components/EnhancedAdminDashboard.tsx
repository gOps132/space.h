import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AlertCircle, BarChart3, ChevronDown, Download, MoreVertical, Pencil, Plus, Search, Settings, Trash2, Users, Wrench } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
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
import {
  ApiError,
  clearSession,
  createResource,
  deleteResource,
  getAttendanceLogs,
  getDashboard,
  getReservations,
  getResources,
  updateResource,
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
  const [syncState, setSyncState] = useState<"live" | "fallback">("fallback");
  const [query, setQuery] = useState("");
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<StudyResource | null>(null);
  const [deletingResource, setDeletingResource] = useState<StudyResource | null>(null);
  const [resourceForm, setResourceForm] = useState<ResourceFormState>(emptyResourceForm);
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [isDeletingResource, setIsDeletingResource] = useState(false);

  const refresh = async () => {
    const [nextResources, nextReservations, nextAttendanceLogs, nextDashboard] = await Promise.all([
      getResources(),
      getReservations(),
      getAttendanceLogs(),
      getDashboard(),
    ]);
    setResources(nextResources.length > 0 ? nextResources : enhancedResources);
    setReservations(nextReservations);
    setAttendanceLogs(nextAttendanceLogs);
    setDashboard(nextDashboard);
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

  const updateStatus = async (resourceId: string, status: StudyResource["current_status"]) => {
    try {
      await updateResourceStatus(resourceId, status);
      await refresh();
      toast.success(`Resource marked ${status}.`);
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Status update failed.");
    }
  };

  const updateResourceForm = <Key extends keyof ResourceFormState>(key: Key, value: ResourceFormState[Key]) => {
    setResourceForm((current) => ({ ...current, [key]: value }));
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

        <div className="divide-y divide-walnut/5 md:hidden">
          {filteredResources.map((resource) => (
            <ResourceMobileCard
              key={resource.resource_id}
              resource={resource}
              onDelete={() => setDeletingResource(resource)}
              onEdit={() => openEditResource(resource)}
              onStatusChange={(status) => updateStatus(resource.resource_id, status)}
            />
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
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
              {filteredResources.map((resource) => (
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

        <div className="flex items-center justify-between border-t border-walnut/10 bg-walnut/5 p-5 text-xs text-walnut/45">
          <p>Showing {filteredResources.length} of {resources.length} library resources</p>
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
        </div>
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
