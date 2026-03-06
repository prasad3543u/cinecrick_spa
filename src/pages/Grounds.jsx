import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Grounds() {
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGrounds() {
      try {
        const data = await api("/grounds");
        setGrounds(data);
      } catch (err) {
        setError(err.message || "Failed to load grounds");
      } finally {
        setLoading(false);
      }
    }

    loadGrounds();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        Loading grounds...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070812] text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <h1 className="text-4xl font-black text-pink-400 mb-8">Cricket Grounds</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {grounds.map((ground) => (
          <Card
            key={ground.id}
            className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)] overflow-hidden"
          >
            <img
              src={ground.image_url}
              alt={ground.name}
              className="h-52 w-full object-cover"
            />

            <CardContent className="p-5 space-y-3">
              <h2 className="text-2xl font-bold">{ground.name}</h2>
              <p className="text-white/70">{ground.location}</p>
              <p className="text-white/70">Sport: {ground.sport_type}</p>
              <p className="text-pink-400 font-semibold">
                ₹{ground.price_per_hour}/hour
              </p>

              <Button
                onClick={() => navigate(`/grounds/${ground.id}`)}
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500"
              >
                View Slots
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}