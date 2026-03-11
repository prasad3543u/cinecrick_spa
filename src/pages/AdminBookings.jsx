import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await api("/admin/bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(id) {
    toast.info("Confirming booking...");
    try {
      await api(`/bookings/${id}/confirm`, { method: "PATCH" });
      toast.success("Booking confirmed!");
      loadBookings();
    } catch (err) {
      toast.error(err?.message || "Failed to confirm booking");
    }
  }

  async function handleCancel(id) {
    toast.info("Cancelling booking...");
    try {
      await api(`/bookings/${id}/cancel`, { method: "PATCH" });
      toast.success("Booking cancelled.");
      loadBookings();
    } catch (err) {
      toast.error(err?.message || "Failed to cancel booking");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <div className="text-white/70">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-pink-400">Admin Bookings</h1>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/admin/dashboard")} className="bg-white/10 text-white hover:bg-white/15">
            Dashboard
          </Button>
          <Button onClick={() => navigate("/admin/grounds")} className="bg-white/10 text-white hover:bg-white/15">
            Manage Grounds
          </Button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/55 p-6 text-white/70">
          No bookings found.
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-white/10 bg-zinc-950/55 overflow-hidden">
              <div className={`h-1 w-full ${
                booking.status === "confirmed" ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                booking.status === "cancelled" ? "bg-gradient-to-r from-red-500 to-rose-400" :
                "bg-gradient-to-r from-yellow-500 to-orange-400"
              }`} />
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-pink-400">
                    {booking.ground?.name || "Ground"}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    booking.status === "confirmed" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                    booking.status === "cancelled" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                    "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  }`}>
                    {booking.status}
                  </span>
                </div>

                <p className="text-white/80">User: {booking.user?.email || "--"}</p>
                <p className="text-white/80">Date: {booking.booking_date || "--"}</p>
                <p className="text-white/80">
                  Slot: {booking.slot?.start_time || "--"} - {booking.slot?.end_time || "--"}
                </p>
                <p className="text-white/80">Price: ₹{booking.total_price || "--"}</p>
                <p className="text-white/80">Match Type: {booking.match_type || "--"}</p>
                <p className="text-white/80">Payment: {booking.payment_status || "--"}</p>

                {booking.status === "pending" && (
                  <div className="flex gap-3 mt-3">
                    <Button
                      onClick={() => handleConfirm(booking.id)}
                      className="bg-green-500 hover:bg-green-600 text-black font-bold"
                    >
                      Confirm Booking
                    </Button>
                    <Button
                      onClick={() => handleCancel(booking.id)}
                      className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
                    >
                      Reject Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}