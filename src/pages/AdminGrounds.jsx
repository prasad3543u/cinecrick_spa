import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminGrounds() {
  const [form, setForm] = useState({
    name: "",
    location: "",
    sport_type: "Cricket",
    price_per_hour: "",
    opening_time: "",
    closing_time: "",
    image_url: "",
    amenities: "",
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
      const data = await api("/grounds");
      setGrounds(data);
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

    try {
      setLoading(true);

      await api("/grounds", {
        method: "POST",
        body: {
          name: form.name,
          location: form.location,
          sport_type: form.sport_type,
          price_per_hour: Number(form.price_per_hour),
          opening_time: form.opening_time,
          closing_time: form.closing_time,
          image_url: form.image_url,
          amenities: form.amenities,
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
      });

      loadGrounds();
    } catch (err) {
      setError(err.message || "Failed to add ground");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <h1 className="text-4xl font-black text-pink-400 mb-8">Admin • Add Ground</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-white/10 bg-zinc-950/55">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Ground</h2>

            {message ? (
              <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                placeholder="Ground Name"
                value={form.name}
                onChange={handleChange}
                className="bg-black/40 border-white/10"
              />

              <Input
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
                className="bg-black/40 border-white/10"
              />

              <Input
                name="sport_type"
                placeholder="Sport Type"
                value={form.sport_type}
                onChange={handleChange}
                className="bg-black/40 border-white/10"
              />

              <Input
                name="price_per_hour"
                type="number"
                placeholder="Price Per Hour"
                value={form.price_per_hour}
                onChange={handleChange}
                className="bg-black/40 border-white/10"
              />

              <Input
                name="opening_time"
                placeholder="Opening Time (example: 06:00)"
                value={form.opening_time}
                onChange={handleChange}
                className="bg-black/40 border-white/10"
              />

              <Input
                name="closing_time"
                placeholder="Closing Time (example: 22:00)"
                value={form.closing_time}
                onChange={handleChange}
                className="bg-black/40 border-white/10"
              />

              <Input
                name="image_url"
                placeholder="Image URL"
                value={form.image_url}
                onChange={handleChange}
                className="bg-black/40 border-white/10"
              />

              <Input
                name="amenities"
                placeholder="Amenities (comma separated)"
                value={form.amenities}
                onChange={handleChange}
                className="bg-black/40 border-white/10"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500"
              >
                {loading ? "Adding..." : "Add Ground"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/55">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Existing Grounds</h2>

            {loadingGrounds ? (
              <p className="text-white/70">Loading grounds...</p>
            ) : grounds.length === 0 ? (
              <p className="text-white/70">No grounds found.</p>
            ) : (
              <div className="space-y-4">
                {grounds.map((ground) => (
                  <div
                    key={ground.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <h3 className="text-lg font-bold text-pink-400">{ground.name}</h3>
                    <p className="text-white/70">{ground.location}</p>
                    <p className="text-white/70">Sport: {ground.sport_type}</p>
                    <p className="text-white/70">₹{ground.price_per_hour}/hour</p>
                    <p className="text-white/60 text-sm mt-1">
                      {ground.opening_time} - {ground.closing_time}
                    </p>
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