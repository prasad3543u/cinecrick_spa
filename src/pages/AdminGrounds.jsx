import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from "@/components/ui/dialog";

export default function AdminGrounds() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", location: "", sport_type: "Cricket",
    price_per_hour: "", opening_time: "", closing_time: "",
    image_url: "", amenities: "", admin_name: "", admin_phone: "",
  });

  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGrounds, setLoadingGrounds] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Edit state
  const [editGround, setEditGround] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Block date state
  const [blockGroundId, setBlockGroundId] = useState(null);
  const [blockDate, setBlockDate] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    loadGrounds();
  }, []);

  async function loadGrounds() {
    try {
      setLoadingGrounds(true);
      const data = await api("/grounds");
      setGrounds(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load grounds");
    } finally {
      setLoadingGrounds(false);
    }
  }

  async function loadBlockedDates(groundId) {
    try {
      const data = await api(`/admin/blocked_dates?ground_id=${groundId}`);
      setBlockedDates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setLoading(true);
      await api("/grounds", {
        method: "POST",
        body: {
          name: form.name.trim(),
          location: form.location.trim(),
          sport_type: form.sport_type.trim(),
          price_per_hour: Number(form.price_per_hour),
          opening_time: form.opening_time.trim(),
          closing_time: form.closing_time.trim(),
          image_url: form.image_url.trim(),
          amenities: form.amenities.trim(),
          admin_name: form.admin_name.trim(),
          admin_phone: form.admin_phone.trim(),
        },
      });

      setMessage("Ground added successfully.");
      setForm({
        name: "", location: "", sport_type: "Cricket",
        price_per_hour: "", opening_time: "", closing_time: "",
        image_url: "", amenities: "", admin_name: "", admin_phone: "",
      });
      await loadGrounds();
    } catch (err) {
      setError(err.message || "Failed to add ground");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(ground) {
    setEditGround(ground);
    setEditForm({
      name: ground.name,
      location: ground.location,
      sport_type: ground.sport_type,
      price_per_hour: ground.price_per_hour,
      opening_time: ground.opening_time,
      closing_time: ground.closing_time,
      image_url: ground.image_url || "",
      amenities: ground.amenities || "",
      admin_name: ground.admin_name || "",
      admin_phone: ground.admin_phone || "",
    });
  }

  async function handleEditSubmit() {
    try {
      setEditLoading(true);
      setMessage("");
      setError("");
      await api(`/grounds/${editGround.id}`, {
        method: "PATCH",
        body: editForm,
      });
      setMessage("Ground updated successfully.");
      setEditGround(null);
      await loadGrounds();
    } catch (err) {
      setError(err.message || "Failed to update ground");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(groundId) {
    const confirmed = window.confirm("Are you sure you want to delete this ground? All slots and bookings will be deleted too.");
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      await api(`/grounds/${groundId}`, { method: "DELETE" });
      setMessage("Ground deleted successfully.");
      await loadGrounds();
    } catch (err) {
      setError(err.message || "Failed to delete ground");
    }
  }

  async function handleBlockDate(groundId) {
    if (!blockDate) {
      setError("Please select a date to block.");
      return;
    }

    try {
      setBlockLoading(true);
      setMessage("");
      setError("");
      await api("/admin/block_date", {
        method: "POST",
        body: { ground_id: groundId, date: blockDate },
      });
      setMessage(`Date ${blockDate} blocked successfully.`);
      setBlockDate("");
      await loadBlockedDates(groundId);
    } catch (err) {
      setError(err.message || "Failed to block date");
    } finally {
      setBlockLoading(false);
    }
  }

  async function handleUnblockDate(groundId, date) {
    try {
      setMessage("");
      setError("");
      await api("/admin/unblock_date", {
        method: "DELETE",
        body: { ground_id: groundId, date: date },
      });
      setMessage(`Date ${date} unblocked successfully.`);
      await loadBlockedDates(groundId);
    } catch (err) {
      setError(err.message || "Failed to unblock date");
    }
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-pink-400">Admin Grounds</h1>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/admin/dashboard")} className="bg-white/10 text-white hover:bg-white/15">
            Dashboard
          </Button>
          <Button onClick={() => navigate("/grounds")} className="bg-white/10 text-white hover:bg-white/15">
            View User Grounds
          </Button>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Add Ground Form */}
        <Card className="border-white/10 bg-zinc-950/55">
          <CardContent className="p-6">
            <h2 className="mb-5 text-2xl font-bold">Add New Ground</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" placeholder="Ground Name" value={form.name} onChange={handleChange} className="bg-black/40 border-white/10" required />
              <Input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="bg-black/40 border-white/10" required />
              <Input name="sport_type" placeholder="Sport Type" value={form.sport_type} onChange={handleChange} className="bg-black/40 border-white/10" required />
              <Input name="price_per_hour" type="number" placeholder="Price Per Hour" value={form.price_per_hour} onChange={handleChange} className="bg-black/40 border-white/10" required />
              <Input name="opening_time" placeholder="Opening Time (e.g. 06:00)" value={form.opening_time} onChange={handleChange} className="bg-black/40 border-white/10" required />
              <Input name="closing_time" placeholder="Closing Time (e.g. 22:00)" value={form.closing_time} onChange={handleChange} className="bg-black/40 border-white/10" required />
              <Input name="image_url" placeholder="Image URL" value={form.image_url} onChange={handleChange} className="bg-black/40 border-white/10" />
              <Input name="amenities" placeholder="Amenities (comma separated)" value={form.amenities} onChange={handleChange} className="bg-black/40 border-white/10" />
              <Input name="admin_name" placeholder="Ground Owner Name" value={form.admin_name} onChange={handleChange} className="bg-black/40 border-white/10" required />
              <Input name="admin_phone" placeholder="WhatsApp Number" value={form.admin_phone} onChange={handleChange} className="bg-black/40 border-white/10" required />
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-violet-500">
                {loading ? "Adding..." : "Add Ground"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Grounds */}
        <Card className="border-white/10 bg-zinc-950/55">
          <CardContent className="p-6">
            <h2 className="mb-5 text-2xl font-bold">Existing Grounds</h2>
            {loadingGrounds ? (
              <p className="text-white/70">Loading grounds...</p>
            ) : grounds.length === 0 ? (
              <p className="text-white/70">No grounds found.</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {grounds.map((ground) => (
                  <div key={ground.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-pink-400">{ground.name}</h3>
                      <p className="text-white/70">{ground.location}</p>
                      <p className="text-white/70">Sport: {ground.sport_type}</p>
                      <p className="text-white/70">₹{ground.price_per_hour}/hour</p>
                      <p className="text-white/60 text-sm">{ground.opening_time} - {ground.closing_time}</p>
                      <p className="text-white/70 text-sm">Owner: {ground.admin_name || "Not set"}</p>
                      <p className="text-white/70 text-sm">WhatsApp: {ground.admin_phone || "Not set"}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() => openEdit(ground)}
                        className="bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleDelete(ground.id)}
                        className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
                      >
                        Delete
                      </Button>
                      <Button
                        type="button"
                        onClick={() => navigate("/admin/slots")}
                        className="bg-white/10 text-white hover:bg-white/15"
                      >
                        Manage Slots
                      </Button>
                    </div>

                    {/* Block Date */}
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-sm text-white/60 mb-2">Block a date for this ground:</p>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={blockGroundId === ground.id ? blockDate : ""}
                          onChange={(e) => {
                            setBlockGroundId(ground.id);
                            setBlockDate(e.target.value);
                          }}
                          className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-white text-sm flex-1"
                        />
                        <Button
                          type="button"
                          disabled={blockLoading && blockGroundId === ground.id}
                          onClick={() => {
                            setBlockGroundId(ground.id);
                            handleBlockDate(ground.id);
                          }}
                          className="bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 text-sm"
                        >
                          {blockLoading && blockGroundId === ground.id ? "Blocking..." : "Block"}
                        </Button>
                      </div>

                      {/* Show blocked dates for this ground */}
                      <button
                        type="button"
                        onClick={() => loadBlockedDates(ground.id)}
                        className="text-xs text-white/50 hover:text-white/80 mt-2 underline"
                      >
                        View blocked dates
                      </button>

                      {blockedDates.filter(b => b.ground_id === ground.id).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {blockedDates
                            .filter(b => b.ground_id === ground.id)
                            .map((b) => (
                              <div key={b.date} className="flex items-center justify-between text-xs">
                                <span className="text-orange-300">{b.date} — {b.slots_count} slots blocked</span>
                                <button
                                  type="button"
                                  onClick={() => handleUnblockDate(ground.id, b.date)}
                                  className="text-red-400 hover:text-red-300 underline ml-2"
                                >
                                  Unblock
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Ground Dialog */}
      <Dialog open={!!editGround} onOpenChange={() => setEditGround(null)}>
        <DialogContent className="sm:max-w-lg bg-zinc-950 text-white border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-pink-400">Edit Ground</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input name="name" placeholder="Ground Name" value={editForm.name || ""} onChange={handleEditChange} className="bg-black/40 border-white/10" />
            <Input name="location" placeholder="Location" value={editForm.location || ""} onChange={handleEditChange} className="bg-black/40 border-white/10" />
            <Input name="sport_type" placeholder="Sport Type" value={editForm.sport_type || ""} onChange={handleEditChange} className="bg-black/40 border-white/10" />
            <Input name="price_per_hour" type="number" placeholder="Price Per Hour" value={editForm.price_per_hour || ""} onChange={handleEditChange} className="bg-black/40 border-white/10" />
            <Input name="opening_time" placeholder="Opening Time" value={editForm.opening_time || ""} onChange={handleEditChange} className="bg-black/40 border-white/10" />
            <Input name="closing_time" placeholder="Closing Time" value={editForm.closing_time || ""} onChange={handleEditChange} className="bg-black/40 border-white/10" />
            <Input name="image_url" placeholder="Image URL" value={editForm.image_url || ""} onChange={handleEditChange} className="bg-black/40 border-white/10" />
            <Input name="amenities" placeholder="Amenities" value={editForm.amenities || ""} onChange={handleEditChange} className="bg-black/40 border-white/10" />
            <Input name="admin_name" placeholder="Ground Owner Name" value={editForm.admin_name || ""} onChange={handleEditChange} className="bg-black/40 border-white/10" />
            <Input name="admin_phone" placeholder="WhatsApp Number" value={editForm.admin_phone || ""} onChange={handleEditChange} className="bg-black/40 border-white/10" />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setEditGround(null)} className="bg-white/10 text-white hover:bg-white/15">
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={editLoading} className="bg-gradient-to-r from-pink-500 to-violet-500">
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}