import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSlots() {
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
      console.error(err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(slot) {
    try {
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

      alert("Slot updated successfully");
      loadSlots();
    } catch (err) {
      alert(err.message || "Failed to update slot");
    }
  }

  async function handleDelete(id) {
    try {
      await api(`/slots/${id}`, { method: "DELETE" });
      loadSlots();
    } catch (err) {
      alert(err.message || "Failed to delete slot");
    }
  }

  function handleChange(id, field, value) {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        Loading slots...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <h1 className="text-4xl font-black text-pink-400 mb-8">Admin Slots</h1>

      <div className="space-y-5">
        {slots.map((slot) => (
          <Card key={slot.id} className="border-white/10 bg-zinc-950/55">
            <CardContent className="p-6 grid gap-3 md:grid-cols-4">
              <Input
                value={slot.slot_date}
                onChange={(e) => handleChange(slot.id, "slot_date", e.target.value)}
                className="bg-black/40 border-white/10"
              />
              <Input
                value={slot.start_time}
                onChange={(e) => handleChange(slot.id, "start_time", e.target.value)}
                className="bg-black/40 border-white/10"
              />
              <Input
                value={slot.end_time}
                onChange={(e) => handleChange(slot.id, "end_time", e.target.value)}
                className="bg-black/40 border-white/10"
              />
              <Input
                value={slot.price}
                onChange={(e) => handleChange(slot.id, "price", e.target.value)}
                className="bg-black/40 border-white/10"
              />
              <Input
                value={slot.status}
                onChange={(e) => handleChange(slot.id, "status", e.target.value)}
                className="bg-black/40 border-white/10"
              />
              <Input
                value={slot.max_teams || 2}
                onChange={(e) => handleChange(slot.id, "max_teams", e.target.value)}
                className="bg-black/40 border-white/10"
              />
              <Input
                value={slot.teams_booked_count || 0}
                onChange={(e) => handleChange(slot.id, "teams_booked_count", e.target.value)}
                className="bg-black/40 border-white/10"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => handleUpdate(slot)}
                  className="bg-gradient-to-r from-pink-500 to-violet-500"
                >
                  Update
                </Button>
                <Button
                  onClick={() => handleDelete(slot.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}