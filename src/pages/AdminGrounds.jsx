import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminGrounds() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    location: "",
    sport_type: "Cricket",
    price_per_hour: "",
    opening_time: "",
    closing_time: "",
    image_url: "",
    amenities: "",
    admin_name: "",
    admin_phone: "",
  });

  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGrounds, setLoadingGrounds] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadGrounds();
  }, []);

  async function loadGrounds() {
    try {
      setLoadingGrounds(true);
      setError("");
      const data = await api("/grounds");
      setGrounds(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load grounds");
    } finally {
      setLoadingGrounds(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (
      !form.name.trim() ||
      !form.location.trim() ||
      !form.sport_type.trim() ||
      !form.price_per_hour ||
      !form.opening_time.trim() ||
      !form.closing_time.trim() ||
      !form.admin_name.trim() ||
      !form.admin_phone.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

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
        name: "",
        location: "",
        sport_type: "Cricket",
        price_per_hour: "",
        opening_time: "",
        closing_time: "",
        image_url: "",
        amenities: "",
        admin_name: "",
        admin_phone: "",
      });

      await loadGrounds();
    } catch (err) {
      setError(err.message || "Failed to add ground");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-pink-400">Admin Grounds</h1>

        <Button
          onClick={() => navigate("/grounds")}
          className="bg-white/10 text-white hover:bg-white/15"
        >
          View User Grounds Page
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <CardContent className="p-6">
            <h2 className="mb-5 text-2xl font-bold">Add New Ground</h2>

            {message ? (
              <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" placeholder="Ground Name" value={form.name} onChange={handleChange} className="bg-black/40 border-white/10" />
              <Input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="bg-black/40 border-white/10" />
              <Input name="sport_type" placeholder="Sport Type" value={form.sport_type} onChange={handleChange} className="bg-black/40 border-white/10" />
              <Input name="price_per_hour" type="number" placeholder="Price Per Hour" value={form.price_per_hour} onChange={handleChange} className="bg-black/40 border-white/10" />
              <Input name="opening_time" placeholder="Opening Time (example: 06:00)" value={form.opening_time} onChange={handleChange} className="bg-black/40 border-white/10" />
              <Input name="closing_time" placeholder="Closing Time (example: 22:00)" value={form.closing_time} onChange={handleChange} className="bg-black/40 border-white/10" />
              <Input name="image_url" placeholder="Image URL" value={form.image_url} onChange={handleChange} className="bg-black/40 border-white/10" />
              <Input name="amenities" placeholder="Amenities (comma separated)" value={form.amenities} onChange={handleChange} className="bg-black/40 border-white/10" />
              <Input name="admin_name" placeholder="Ground Owner / Admin Name" value={form.admin_name} onChange={handleChange} className="bg-black/40 border-white/10" />
              <Input name="admin_phone" placeholder="Ground Owner / Admin WhatsApp Number" value={form.admin_phone} onChange={handleChange} className="bg-black/40 border-white/10" />

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-violet-500">
                {loading ? "Adding..." : "Add Ground"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <CardContent className="p-6">
            <h2 className="mb-5 text-2xl font-bold">Existing Grounds</h2>

            {loadingGrounds ? (
              <p className="text-white/70">Loading grounds...</p>
            ) : grounds.length === 0 ? (
              <p className="text-white/70">No grounds found.</p>
            ) : (
              <div className="space-y-4">
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

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button
                        type="button"
                        onClick={() => navigate("/admin/slots")}
                        className="bg-white/10 text-white hover:bg-white/15"
                      >
                        Manage Slots
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}