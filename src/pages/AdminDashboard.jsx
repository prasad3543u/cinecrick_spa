import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  Users, BookOpen, MapPin, TrendingUp,
  Clock, CheckCircle, XCircle, DollarSign
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const data = await api("/admin/stats");
      setStats(data);
    } catch (err) {
      toast.error(err.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <div className="text-white/70">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-pink-400">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/admin/bookings")} className="bg-white/10 text-white hover:bg-white/15">
            Manage Bookings
          </Button>
          <Button onClick={() => navigate("/admin/grounds")} className="bg-gradient-to-r from-pink-500 to-violet-500">
            Manage Grounds
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={<MapPin className="h-6 w-6" />} label="Total Grounds" value={stats.total_grounds} color="pink" />
        <StatCard icon={<Users className="h-6 w-6" />} label="Total Users" value={stats.total_users} color="violet" />
        <StatCard icon={<BookOpen className="h-6 w-6" />} label="Total Bookings" value={stats.total_bookings} color="cyan" />
        <StatCard icon={<DollarSign className="h-6 w-6" />} label="Total Revenue" value={`₹${Number(stats.total_revenue || 0).toLocaleString()}`} color="emerald" />
      </div>

      {/* Booking Status */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatusCard icon={<Clock className="h-5 w-5" />} label="Pending" value={stats.pending_bookings} color="yellow" />
        <StatusCard icon={<CheckCircle className="h-5 w-5" />} label="Confirmed" value={stats.confirmed_bookings} color="green" />
        <StatusCard icon={<XCircle className="h-5 w-5" />} label="Cancelled" value={stats.cancelled_bookings} color="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card className="border-white/10 bg-zinc-950/55">
          <CardContent className="p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-400" />
              Recent Bookings
            </h2>
            <div className="space-y-3">
              {stats.recent_bookings?.length === 0 ? (
                <p className="text-white/50">No bookings yet.</p>
              ) : (
                stats.recent_bookings?.map((booking) => (
                  <div key={booking.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-pink-400">{booking.ground?.name || "—"}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        booking.status === "confirmed" ? "bg-green-500/20 text-green-300" :
                        booking.status === "cancelled" ? "bg-red-500/20 text-red-300" :
                        "bg-yellow-500/20 text-yellow-300"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">{booking.user?.email || "—"}</p>
                    <p className="text-white/60 text-sm">{booking.booking_date} · ₹{booking.total_price}</p>
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={() => navigate("/admin/bookings")}
              className="mt-4 w-full bg-white/10 text-white hover:bg-white/15"
            >
              View All Bookings
            </Button>
          </CardContent>
        </Card>

        {/* Popular Grounds */}
        <Card className="border-white/10 bg-zinc-950/55">
          <CardContent className="p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-pink-400" />
              Popular Grounds
            </h2>
            <div className="space-y-3">
              {stats.popular_grounds?.length === 0 ? (
                <p className="text-white/50">No data yet.</p>
              ) : (
                stats.popular_grounds?.map((ground, i) => (
                  <div key={ground.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-pink-400 font-black text-lg">#{i + 1}</span>
                      <p className="font-semibold">{ground.name}</p>
                    </div>
                    <span className="text-white/60 text-sm">{ground.bookings} bookings</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    pink: "from-pink-500/20 to-pink-500/5 border-pink-500/20 text-pink-400",
    violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400",
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
  };

  return (
    <Card className={`border bg-gradient-to-br ${colors[color]}`}>
      <CardContent className="p-5">
        <div className={`mb-2 ${colors[color].split(" ").pop()}`}>{icon}</div>
        <div className="text-3xl font-black">{value}</div>
        <div className="text-white/60 text-sm mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function StatusCard({ icon, label, value, color }) {
  const colors = {
    yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
    green: "border-green-500/20 bg-green-500/10 text-green-300",
    red: "border-red-500/20 bg-red-500/10 text-red-300",
  };

  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-4 ${colors[color]}`}>
      {icon}
      <div>
        <div className="text-2xl font-black">{value}</div>
        <div className="text-sm opacity-80">{label} Bookings</div>
      </div>
    </div>
  );
}