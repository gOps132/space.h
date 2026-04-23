import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { mockResources, type Resource } from "../data/mockData";

export default function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    resource_name: "",
    resource_type: "Seat" as "Seat" | "Room",
    zone: "",
    status: "Available" as "Available" | "Reserved" | "Occupied",
  });

  const zones = ["Quiet Zone", "Group Study", "Computer Zone", "Private Rooms"];

  const resetForm = () => {
    setFormData({
      resource_name: "",
      resource_type: "Seat",
      zone: "",
      status: "Available",
    });
    setEditingResource(null);
  };

  const handleOpenDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        resource_name: resource.resource_name,
        resource_type: resource.resource_type,
        zone: resource.zone,
        status: resource.status,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  // CREATE - Add new resource
  const handleCreate = () => {
    if (!formData.resource_name || !formData.zone) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newResource: Resource = {
      resource_id: `R${String(resources.length + 1).padStart(3, "0")}`,
      resource_name: formData.resource_name,
      resource_type: formData.resource_type,
      zone: formData.zone,
      status: formData.status,
    };

    setResources([...resources, newResource]);
    toast.success("Resource created successfully!");
    handleCloseDialog();
  };

  // UPDATE - Edit existing resource
  const handleUpdate = () => {
    if (!editingResource) return;

    if (!formData.resource_name || !formData.zone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setResources(
      resources.map((r) =>
        r.resource_id === editingResource.resource_id
          ? {
            ...r,
            resource_name: formData.resource_name,
            resource_type: formData.resource_type,
            zone: formData.zone,
            status: formData.status,
          }
          : r
      )
    );

    toast.success("Resource updated successfully!");
    handleCloseDialog();
  };

  // DELETE - Remove resource
  const handleDelete = (resourceId: string) => {
    setResources(resources.filter((r) => r.resource_id !== resourceId));
    toast.success("Resource deleted successfully!");
  };

  // Filter counts
  const statusCounts = {
    all: resources.length,
    available: resources.filter((r) => r.status === "Available").length,
    occupied: resources.filter((r) => r.status === "Occupied").length,
    reserved: resources.filter((r) => r.status === "Reserved").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Resources</CardDescription>
            <CardTitle className="text-2xl">{statusCounts.all}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Available</CardDescription>
            <CardTitle className="text-2xl text-moss">{statusCounts.available}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Occupied</CardDescription>
            <CardTitle className="text-2xl text-destructive">{statusCounts.occupied}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Reserved</CardDescription>
            <CardTitle className="text-2xl text-candlelight">{statusCounts.reserved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Resource List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resource Management</CardTitle>
              <CardDescription>Create, edit, and delete library resources</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingResource ? "Edit Resource" : "Create New Resource"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingResource
                      ? "Update the resource information"
                      : "Add a new resource to the library"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resource-name">Resource Name *</Label>
                    <Input
                      id="resource-name"
                      placeholder="e.g., Quiet Zone - Seat 1"
                      value={formData.resource_name}
                      onChange={(e) =>
                        setFormData({ ...formData, resource_name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="resource-type">Resource Type *</Label>
                    <Select
                      value={formData.resource_type}
                      onValueChange={(value: "Seat" | "Room") =>
                        setFormData({ ...formData, resource_type: value })
                      }
                    >
                      <SelectTrigger id="resource-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Seat">Seat</SelectItem>
                        <SelectItem value="Room">Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="zone">Zone *</Label>
                    <Select
                      value={formData.zone}
                      onValueChange={(value) => setFormData({ ...formData, zone: value })}
                    >
                      <SelectTrigger id="zone">
                        <SelectValue placeholder="Select a zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "Available" | "Reserved" | "Occupied") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Reserved">Reserved</SelectItem>
                        <SelectItem value="Occupied">Occupied</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={editingResource ? handleUpdate : handleCreate}
                      className="flex-1"
                    >
                      {editingResource ? "Update" : "Create"} Resource
                    </Button>
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {resources.map((resource) => (
              <div
                key={resource.resource_id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{resource.resource_name}</p>
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
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {resource.zone}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {resource.resource_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground/60">ID: {resource.resource_id}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(resource)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(resource.resource_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
