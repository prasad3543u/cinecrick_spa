import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminSlots() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlots();
  }, []);

  async function loadSlots() {
    try {
      setLoading(true);
      const data = await api("/slots");
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.message || "Failed to load slots");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(slot) {
    try {
      toast.info("Updating slot...");
      await api(`/slots/${slot.id}`, {
        method: "PATCH",
        body: {
          slot_date: slot.slot_date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          price: slot.price,
          status: slot.status,
          max_teams: slot.max_teams,
          teams_booked_count: slot.teams_booked_count,
        },
      });
      toast.success("Slot updated successfully!");
      loadSlots();
    } catch (err) {
      toast.error(err?.message || "Failed to update slot");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to delete this slot?");
    if (!confirmed) return;
    try {
      toast.info("Deleting slot...");
      await api(`/slots/${id}`, { method: "DELETE" });
      toast.success("Slot deleted successfully!");
      loadSlots();
    } catch (err) {
      toast.error(err?.message || "Failed to delete slot");
    }
  }

  function handleChange(id, field, value) {
    setSlots((prev) =>
      prev.map((slot) => slot.id === id ? { ...slot, [field]: value } : slot)
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <div className="text-white/70">Loading slots...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-pink-400">Admin Slots</h1>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/admin/dashboard")} className="bg-white/10 text-white hover:bg-white/15">
            Dashboard
          </Button>
          <Button onClick={() => navigate("/admin/grounds")} className="bg-white/10 text-white hover:bg-white/15">
            Manage Grounds
          </Button>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/55 p-6 text-white/70">
          No slots found.
        </div>
      ) : (
        <div className="space-y-5">
          {slots.map((slot) => (
            <Card key={slot.id} className="border-white/10 bg-zinc-950/55">
              <CardContent className="p-6 grid gap-3 md:grid-cols-4">
                <Input value={slot.slot_date} onChange={(e) => handleChange(slot.id, "slot_date", e.target.value)} className="bg-black/40 border-white/10" placeholder="Date" />
                <Input value={slot.start_time} onChange={(e) => handleChange(slot.id, "start_time", e.target.value)} className="bg-black/40 border-white/10" placeholder="Start Time" />
                <Input value={slot.end_time} onChange={(e) => handleChange(slot.id, "end_time", e.target.value)} className="bg-black/40 border-white/10" placeholder="End Time" />
                <Input value={slot.price} onChange={(e) => handleChange(slot.id, "price", e.target.value)} className="bg-black/40 border-white/10" placeholder="Price" />
                <Input value={slot.status} onChange={(e) => handleChange(slot.id, "status", e.target.value)} className="bg-black/40 border-white/10" placeholder="Status" />
                <Input value={slot.max_teams || 2} onChange={(e) => handleChange(slot.id, "max_teams", e.target.value)} className="bg-black/40 border-white/10" placeholder="Max Teams" />
                <Input value={slot.teams_booked_count || 0} onChange={(e) => handleChange(slot.id, "teams_booked_count", e.target.value)} className="bg-black/40 border-white/10" placeholder="Teams Booked" />
                <div className="flex gap-3">
                  <Button onClick={() => handleUpdate(slot)} className="bg-gradient-to-r from-pink-500 to-violet-500">
                    Update
                  </Button>
                  <Button onClick={() => handleDelete(slot.id)} className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}