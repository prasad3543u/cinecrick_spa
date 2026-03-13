import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GroundCardSkeleton } from "../components/Skeleton";
import { Search, MapPin, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";

export default function Grounds() {
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [locationSearch, setLocationSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("");
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

  const prices = grounds.map((g) => parseFloat(g.price_per_hour) || 0);
  const lowestPrice  = prices.length ? Math.min(...prices) : 0;
  const highestPrice = prices.length ? Math.max(...prices) : 5000;

  const filtered = useMemo(() => {
    let result = grounds.filter((g) => {
      const locationMatch = () => {
        if (!locationSearch.trim()) return true;
        const searchWords = locationSearch.toLowerCase().trim().split(/\s+/);
        const loc = (g.location || "").toLowerCase();
        return searchWords.every((word) => loc.includes(word));
      };
      const price = parseFloat(g.price_per_hour) || 0;
      const matchPrice = maxPrice === "" || price <= parseFloat(maxPrice);
      return locationMatch() && matchPrice;
    });

    if (sortOrder === "asc") {
      result = [...result].sort((a, b) =>
        (parseFloat(a.price_per_hour) || 0) - (parseFloat(b.price_per_hour) || 0));
    } else if (sortOrder === "desc") {
      result = [...result].sort((a, b) =>
        (parseFloat(b.price_per_hour) || 0) - (parseFloat(a.price_per_hour) || 0));
    }

    return result;
  }, [grounds, locationSearch, maxPrice, sortOrder]);

  const hasActiveFilters = locationSearch || maxPrice || sortOrder;
  const activeFilterCount = [locationSearch, maxPrice, sortOrder].filter(Boolean).length;

  function clearFilters() {
    setLocationSearch("");
    setMaxPrice("");
    setSortOrder("");
  }

  function clearLocation() {
    setLocationSearch("");
    if (!maxPrice) setShowFilters(false);
  }

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
              {hasActiveFilters && (
                <span className="ml-2 text-pink-400">— filtered</span>
              )}
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

          {/* Row 1 — location search + filter toggle + sort */}
          <div className="flex gap-2 sm:gap-3">

            {/* Location search */}
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
                  onClick={clearLocation}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 px-3 sm:px-4 flex items-center gap-2 border transition shrink-0 ${
                showFilters || maxPrice
                  ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              <span className="text-sm">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Sort button */}
            <Button
              onClick={() => setSortOrder(
                sortOrder === "" ? "asc" : sortOrder === "asc" ? "desc" : ""
              )}
              className={`h-11 px-3 sm:px-4 flex items-center gap-2 border transition shrink-0 ${
                sortOrder
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <ArrowUpDown className="h-4 w-4 shrink-0" />
              <span className="text-sm">
                {sortOrder === "asc" ? "Low to High" :
                 sortOrder === "desc" ? "High to Low" : "Sort"}
              </span>
            </Button>
          </div>

          {/* Price Slider Panel */}
          {showFilters && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                  Max Price per Hour
                </label>
                <span className="text-sm font-bold text-pink-400">
                  {maxPrice ? `₹${maxPrice}` : `Up to ₹${highestPrice}`}
                </span>
              </div>
              <input
                type="range"
                min={lowestPrice}
                max={highestPrice}
                step={100}
                value={maxPrice || highestPrice}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setMaxPrice(val >= highestPrice ? "" : String(val));
                }}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-pink-500"
              />
              <div className="flex justify-between text-xs text-white/30">
                <span>₹{lowestPrice}</span>
                <span>₹{highestPrice}</span>
              </div>
            </div>
          )}

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/40">Active:</span>

              {locationSearch && (
                <span className="flex items-center gap-1 rounded-full bg-pink-500/15 border border-pink-500/30 px-3 py-1 text-xs text-pink-300">
                  <MapPin className="h-3 w-3" /> {locationSearch}
                  <button onClick={clearLocation} className="ml-1 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {maxPrice && (
                <span className="flex items-center gap-1 rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1 text-xs text-violet-300">
                  Up to ₹{maxPrice}/hr
                  <button onClick={() => setMaxPrice("")} className="ml-1 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {sortOrder && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 px-3 py-1 text-xs text-yellow-300">
                  {sortOrder === "asc" ? "Price: Low to High" : "Price: High to Low"}
                  <button onClick={() => setSortOrder("")} className="ml-1 hover:text-white">
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
              Clear all filters
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