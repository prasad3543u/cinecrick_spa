import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft, Calendar, Clock, MapPin, DollarSign,
  Edit, Trash2, Plus, RefreshCw, Loader2, Users, X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminSlots() {
  const navigate = useNavigate();
  const { groundId } = useParams();
  const [ground, setGround] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [showCustomSlotDialog, setShowCustomSlotDialog] = useState(false);
  const [customSlot, setCustomSlot] = useState({
    start_time: "",
    end_time: "",
    price: "",
    max_teams: 2
  });
  const [editingSlot, setEditingSlot] = useState(null);
  const [editForm, setEditForm] = useState({ start_time: "", end_time: "", price: "" });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  useEffect(() => {
    loadGround();
    loadSlots();
  }, [groundId]);

  async function loadGround() {
    try {
      const data = await api(`/grounds/${groundId}`);
      setGround(data);
    } catch (err) {
      toast.error("Failed to load ground");
    }
  }

  async function loadSlots() {
    try {
      setLoading(true);
      const data = await api(`/slots?ground_id=${groundId}`);
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load slots");
    } finally {
      setLoading(false);
    }
  }

  // Generate default 3 slots (Morning, Mid-Day, Evening)
  async function generateDefaultSlots() {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    setGenerating(true);
    try {
      const response = await api(`/grounds/${groundId}/generate_slots`, {
        method: "POST",
        body: { slot_date: selectedDate }
      });
      toast.success(`Default slots generated for ${selectedDate}`);
      setSelectedDate("");
      loadSlots();
    } catch (err) {
      toast.error(err.message || "Failed to generate slots");
    } finally {
      setGenerating(false);
    }
  }

  // Generate custom slot (any time)
  async function generateCustomSlot() {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }
    if (!customSlot.start_time || !customSlot.end_time) {
      toast.error("Please enter start and end time");
      return;
    }
    if (!customSlot.price || customSlot.price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setGenerating(true);
    try {
      await api("/slots", {
        method: "POST",
        body: {
          ground_id: parseInt(groundId),
          slot_date: selectedDate,
          start_time: customSlot.start_time,
          end_time: customSlot.end_time,
          price: customSlot.price,
          max_teams: customSlot.max_teams,
          status: "available"
        }
      });
      toast.success(`Custom slot ${customSlot.start_time}-${customSlot.end_time} created`);
      setShowCustomSlotDialog(false);
      setCustomSlot({ start_time: "", end_time: "", price: "", max_teams: 2 });
      loadSlots();
    } catch (err) {
      toast.error(err.message || "Failed to create slot");
    } finally {
      setGenerating(false);
    }
  }

  async function updateSlot() {
    if (!editingSlot) return;
    
    try {
      await api(`/slots/${editingSlot.id}`, {
        method: "PATCH",
        body: editForm
      });
      toast.success("Slot updated successfully");
      setEditingSlot(null);
      loadSlots();
    } catch (err) {
      toast.error(err.message || "Failed to update slot");
    }
  }

  async function deleteSlot() {
    if (!slotToDelete) return;
    
    try {
      await api(`/slots/${slotToDelete.id}`, {
        method: "DELETE"
      });
      toast.success("Slot deleted successfully");
      setShowDeleteDialog(false);
      setSlotToDelete(null);
      loadSlots();
    } catch (err) {
      toast.error(err.message || "Failed to delete slot");
    }
  }

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.slot_date]) acc[slot.slot_date] = [];
    acc[slot.slot_date].push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(slotsByDate).sort();

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 py-8">
      
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/grounds")}
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-pink-400">
              Manage Slots
            </h1>
            {ground && (
              <p className="text-white/50 text-sm mt-1">
                {ground.name} • {ground.location}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-6">
        <Label className="text-white/70 text-sm">Select Date</Label>
        <div className="flex flex-col sm:flex-row gap-3 mt-1">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-black/40 border-white/10 text-white w-full sm:w-auto"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Two Generation Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Option 1: Default 3 Slots */}
        <Card className="border-white/10 bg-zinc-950/55">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-emerald-400" />
              Default Slots
            </h2>
            <p className="text-white/50 text-sm mb-4">
              Generate 3 standard slots: Morning (06:30-09:30), Mid-Day (09:30-12:30), Evening (13:00-18:00)
            </p>
            <Button
              onClick={generateDefaultSlots}
              disabled={generating || !selectedDate}
              className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" /> Generate 3 Default Slots</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Option 2: Custom Slot */}
        <Card className="border-white/10 bg-zinc-950/55 border-emerald-500/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Plus className="h-5 w-5 text-pink-400" />
              Custom Slot
            </h2>
            <p className="text-white/50 text-sm mb-4">
              Create a slot with any custom time
            </p>
            <Button
              onClick={() => setShowCustomSlotDialog(true)}
              disabled={!selectedDate}
              className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Slot
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Existing Slots */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-pink-400" />
        Existing Slots
      </h2>

      {loading ? (
        <div className="text-center py-12 text-white/50">Loading slots...</div>
      ) : sortedDates.length === 0 ? (
        <Card className="border-white/10 bg-zinc-950/55">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-white/20 mb-3" />
            <p className="text-white/50">No slots found</p>
            <p className="text-white/30 text-sm mt-1">
              Select a date and generate default slots or create a custom slot
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slotsByDate[date].map((slot) => (
                  <Card key={slot.id} className="border-white/10 bg-zinc-950/55">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-pink-400" />
                          <span className="font-semibold">
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingSlot(slot);
                              setEditForm({
                                start_time: slot.start_time,
                                end_time: slot.end_time,
                                price: slot.price
                              });
                            }}
                            className="p-1 rounded hover:bg-white/10 text-blue-400"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSlotToDelete(slot);
                              setShowDeleteDialog(true);
                            }}
                            className="p-1 rounded hover:bg-white/10 text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <DollarSign className="h-3 w-3" />
                        ₹{slot.price} per team
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                        <Users className="h-3 w-3" />
                        Teams: {slot.teams_booked_count || 0} / {slot.max_teams || 2}
                      </div>
                      <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${
                        slot.status === "available" ? "bg-green-500/20 text-green-400" :
                        slot.status === "booked" ? "bg-red-500/20 text-red-400" :
                        slot.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {slot.status || "available"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Slot Dialog */}
      <Dialog open={showCustomSlotDialog} onOpenChange={setShowCustomSlotDialog}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-pink-400" />
              Create Custom Slot
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-white/50">
              Date: <span className="text-white">{selectedDate}</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={customSlot.start_time}
                  onChange={(e) => setCustomSlot({ ...customSlot, start_time: e.target.value })}
                  className="bg-black/40 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={customSlot.end_time}
                  onChange={(e) => setCustomSlot({ ...customSlot, end_time: e.target.value })}
                  className="bg-black/40 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Price (per team)</Label>
              <Input
                type="number"
                value={customSlot.price}
                onChange={(e) => setCustomSlot({ ...customSlot, price: e.target.value })}
                placeholder="e.g., 2500"
                className="bg-black/40 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label>Max Teams</Label>
              <Select
                value={customSlot.max_teams.toString()}
                onValueChange={(val) => setCustomSlot({ ...customSlot, max_teams: parseInt(val) })}
              >
                <SelectTrigger className="bg-black/40 border-white/10 text-white">
                  <SelectValue placeholder="Select max teams" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="1">1 Team</SelectItem>
                  <SelectItem value="2">2 Teams</SelectItem>
                  <SelectItem value="3">3 Teams</SelectItem>
                  <SelectItem value="4">4 Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setShowCustomSlotDialog(false)}>
              Cancel
            </Button>
            <Button onClick={generateCustomSlot} disabled={generating} className="bg-pink-500">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingSlot} onOpenChange={() => setEditingSlot(null)}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={editForm.start_time}
                  onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                  className="bg-black/40 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={editForm.end_time}
                  onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                  className="bg-black/40 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Price (per team)</Label>
              <Input
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                className="bg-black/40 border-white/10 text-white mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditingSlot(null)}>
              Cancel
            </Button>
            <Button onClick={updateSlot} className="bg-emerald-500">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Slot</DialogTitle>
          </DialogHeader>
          <p className="text-white/70">
            Are you sure you want to delete this slot? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={deleteSlot} className="bg-red-500 hover:bg-red-600">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}