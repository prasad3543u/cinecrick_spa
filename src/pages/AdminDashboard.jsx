import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Calendar, DollarSign, TrendingUp, TrendingDown,
  Loader2, Download, CalendarDays, Clock
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [bookingTrend, setBookingTrend] = useState([]);

  useEffect(() => {
    loadStats();
    loadAnalytics();
  }, []);

  async function loadStats() {
    try {
      const data = await api("/admin/stats");
      setStats(data);
    } catch (err) {
      toast.error(err?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    try {
      // Fetch bookings data for analytics
      const bookings = await api("/admin/bookings");
      
      // Process revenue data by date
      const revenueMap = {};
      bookings.forEach(booking => {
        if (booking.status === "confirmed") {
          const date = booking.booking_date;
          revenueMap[date] = (revenueMap[date] || 0) + booking.total_price;
        }
      });
      
      const revenueArray = Object.entries(revenueMap)
        .map(([date, revenue]) => ({ date, revenue }))
        .slice(-7); // Last 7 days
      
      setRevenueData(revenueArray);
      
      // Process peak hours data
      const hourMap = {};
      bookings.forEach(booking => {
        if (booking.slot?.start_time) {
          const hour = booking.slot.start_time.split(":")[0];
          hourMap[hour] = (hourMap[hour] || 0) + 1;
        }
      });
      
      const peakHoursArray = Object.entries(hourMap)
        .map(([hour, count]) => ({ hour: `${hour}:00`, bookings: count }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
      
      setPeakHours(peakHoursArray);
      
      // Process booking trend
      const trendMap = {};
      bookings.forEach(booking => {
        const date = booking.booking_date;
        trendMap[date] = (trendMap[date] || 0) + 1;
      });
      
      const trendArray = Object.entries(trendMap)
        .map(([date, count]) => ({ date, bookings: count }))
        .slice(-7);
      
      setBookingTrend(trendArray);
      
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  }

  // Export data as CSV
  const exportToCSV = () => {
    if (!stats) return;
    
    const csvData = [
      ["Metric", "Value"],
      ["Total Grounds", stats.total_grounds],
      ["Total Bookings", stats.total_bookings],
      ["Total Users", stats.total_users],
      ["Pending Bookings", stats.pending_bookings],
      ["Confirmed Bookings", stats.confirmed_bookings],
      ["Cancelled Bookings", stats.cancelled_bookings],
      ["Total Revenue", `Rs. ${stats.total_revenue}`]
    ];
    
    const csv = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crickops_stats_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec489a"];

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 py-6 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-pink-400">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" className="border-white/10 text-white">
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
          <Button onClick={() => navigate("/admin/bookings")} className="bg-white/10">
            View All Bookings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.total_revenue?.toLocaleString() || 0}`}
          icon={<DollarSign className="h-6 w-6" />}
          trend="+12%"
          color="emerald"
        />
        <StatCard
          title="Total Bookings"
          value={stats?.total_bookings || 0}
          icon={<Calendar className="h-6 w-6" />}
          trend="+8%"
          color="blue"
        />
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={<Users className="h-6 w-6" />}
          trend="+15%"
          color="purple"
        />
        <StatCard
          title="Pending Bookings"
          value={stats?.pending_bookings || 0}
          icon={<Clock className="h-6 w-6" />}
          trend="-3%"
          color="orange"
          trendDown
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Revenue Chart */}
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Revenue Trend (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "none" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Hours Chart */}
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-pink-400" />
              Peak Booking Hours
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "none" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="bookings" fill="#ec489a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Booking Trend */}
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-400" />
              Daily Bookings
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "none" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Status Distribution */}
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Booking Status
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Confirmed", value: stats?.confirmed_bookings || 0 },
                        { name: "Pending", value: stats?.pending_bookings || 0 },
                        { name: "Cancelled", value: stats?.cancelled_bookings || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f1f1f", border: "none" }}
                      labelStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Confirmed</span>
                  <Badge className="bg-green-500/20 text-green-400">
                    {stats?.confirmed_bookings || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Pending</span>
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    {stats?.pending_bookings || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Cancelled</span>
                  <Badge className="bg-red-500/20 text-red-400">
                    {stats?.cancelled_bookings || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <div className="mt-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4">Recent Bookings</h2>
            <div className="space-y-3">
              {stats?.recent_bookings?.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium">{booking.user?.name}</p>
                    <p className="text-xs text-white/50">{booking.ground?.name} • {booking.booking_date}</p>
                  </div>
                  <Badge className={`text-xs ${
                    booking.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                    booking.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, trend, trendDown, color }) {
  const colors = {
    emerald: "bg-emerald-500/20 text-emerald-400",
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    orange: "bg-orange-500/20 text-orange-400"
  };

  return (
    <Card className="bg-zinc-900 border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-xl ${colors[color]}`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trendDown ? "text-red-400" : "text-green-400"}`}>
              {trendDown ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {trend}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-white/50 mt-1">{title}</p>
      </CardContent>
    </Card>
  );
}