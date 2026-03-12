import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GroundCardSkeleton } from "../components/Skeleton";

export default function Grounds() {
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGrounds() {
      try {
        const data = await api("/grounds");
        setGrounds(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Failed to load grounds");
      } finally {
        setLoading(false);
      }
    }
    loadGrounds();
  }, []);

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-black text-pink-400">Cricket Grounds</h1>
        <Button onClick={() => navigate("/home")} className="bg-white/10 text-white hover:bg-white/15">
          Back to Home
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <GroundCardSkeleton key={i} />)
        ) : grounds.length === 0 ? (
          <div className="col-span-full text-center text-white/50 py-20">
            No grounds found.
          </div>
        ) : (
          grounds.map((ground) => (
            <Card
              key={ground.id}
              className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)] overflow-hidden"
            >
              <img
                src={ground.image_url}
                alt={ground.name}
                className="h-52 w-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600";
                }}
              />
              <CardContent className="p-5 space-y-3">
                <h2 className="text-2xl font-bold">{ground.name}</h2>
                <p className="text-white/70">{ground.location}</p>
                <p className="text-white/70">Sport: {ground.sport_type}</p>
                <p className="text-pink-400 font-semibold">₹{ground.price_per_hour}/hour</p>
                <Button
                  onClick={() => navigate(`/grounds/${ground.id}`)}
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-500"
                >
                  View Slots
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}