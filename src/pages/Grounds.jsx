import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GroundCardSkeleton } from "../components/Skeleton";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";

export default function Grounds() {
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [locationSearch, setLocationSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

  // Instant filtering — runs on every keystroke
  const filtered = useMemo(() => {
    return grounds.filter((g) => {
      const matchLocation = locationSearch.trim() === "" ||
        g.location?.toLowerCase().includes(locationSearch.toLowerCase());

      const price = parseFloat(g.price_per_hour) || 0;
      const matchMin = minPrice === "" || price >= parseFloat(minPrice);
      const matchMax = maxPrice === "" || price <= parseFloat(maxPrice);

      return matchLocation && matchMin && matchMax;
    });
  }, [grounds, locationSearch, minPrice, maxPrice]);

  const hasActiveFilters = locationSearch || minPrice || maxPrice;

  function clearFilters() {
    setLocationSearch("");
    setMinPrice("");
    setMaxPrice("");
  }

  // Price range stats for placeholder hints
  const prices = grounds.map((g) => parseFloat(g.price_per_hour) || 0);
  const lowestPrice  = prices.length ? Math.min(...prices) : 0;
  const highestPrice = prices.length ? Math.max(...prices) : 0;

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 py-8 sm:py-10">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-pink-400">
            Cricket Grounds
          </h1>
          {!loading && (
            <p className="text-white/40 text-sm mt-1">
              {filtered.length} of {grounds.length} grounds
            </p>
          )}
        </div>
        <Button
          onClick={() => navigate("/home")}
          className="bg-white/10 text-white hover:bg-white/15"
        >
          Back to Home
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {/* Search & Filter Bar */}
      {!loading && grounds.length > 0 && (
        <div className="mb-6 space-y-3">

          {/* Location search + filter toggle */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search by location..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-pink-500/40"
              />
              {locationSearch && (
                <button
                  onClick={() => setLocationSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 px-4 flex items-center gap-2 border transition ${
                showFilters || minPrice || maxPrice
                  ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Price Filter</span>
              {(minPrice || maxPrice) && (
                <span className="ml-1 h-2 w-2 rounded-full bg-pink-400" />
              )}
            </Button>
          </div>

          {/* Price range panel */}
          {showFilters && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-end gap-4">
              <div className="space-y-1.5 flex-1 min-w-[120px]">
                <label className="text-xs text-white/50">Min Price (₹/hr)</label>
                <Input
                  type="number"
                  placeholder={`e.g. ${lowestPrice}`}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="bg-black/40 border-white/10 text-white placeholder:text-white/20 h-10 focus-visible:ring-pink-500/40"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[120px]">
                <label className="text-xs text-white/50">Max Price (₹/hr)</label>
                <Input
                  type="number"
                  placeholder={`e.g. ${highestPrice}`}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-black/40 border-white/10 text-white placeholder:text-white/20 h-10 focus-visible:ring-pink-500/40"
                />
              </div>
              <div className="text-xs text-white/30 self-center">
                Range: ₹{lowestPrice} – ₹{highestPrice}/hr
              </div>
            </div>
          )}

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/40">Active filters:</span>
              {locationSearch && (
                <span className="flex items-center gap-1 rounded-full bg-pink-500/15 border border-pink-500/30 px-3 py-1 text-xs text-pink-300">
                  <MapPin className="h-3 w-3" /> {locationSearch}
                  <button onClick={() => setLocationSearch("")} className="ml-1 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1 rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1 text-xs text-violet-300">
                  ₹{minPrice || "0"} – ₹{maxPrice || "any"}
                  <button
                    onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                    className="ml-1 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-white/30 hover:text-white underline transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grounds Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <GroundCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <p className="text-white/40 text-lg mb-3">No grounds match your filters.</p>
            <button
              onClick={clearFilters}
              className="text-pink-400 hover:text-pink-300 underline text-sm transition"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((ground) => (
            <Card
              key={ground.id}
              className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)] overflow-hidden group hover:border-pink-500/30 transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={ground.image_url}
                  alt={ground.name}
                  className="h-52 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-semibold bg-black/60 backdrop-blur px-2 py-1 rounded-full text-white/80">
                  {ground.sport_type}
                </span>
              </div>
              <CardContent className="p-5 space-y-3">
                <h2 className="text-xl font-bold leading-tight">{ground.name}</h2>
                <div className="flex items-center gap-1 text-white/60 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                  <span className="truncate">{ground.location}</span>
                </div>
                <p className="text-pink-400 font-bold text-lg">
                  ₹{ground.price_per_hour}
                  <span className="text-white/40 text-sm font-normal">/hour</span>
                </p>
                <Button
                  onClick={() => navigate(`/grounds/${ground.id}`)}
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:opacity-90 transition"
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