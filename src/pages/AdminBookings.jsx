import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; 

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await api("/admin/bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(id) {
    try {
      toast.info("Confirming booking...");
      toast.error("");
      await api(`/bookings/${id}/confirm`, { method: "PATCH" });
      toast.success("Booking confirmed!");
      loadBookings();
    } catch (err) {
      toast.error(err.message || "Failed to confirm booking");
    }
  }

  async function handleCancel(id) {
    try {
      toast.info("Cancelling booking...");
      toast.error("");
      await api(`/bookings/${id}/cancel`, { method: "PATCH" });
      toast.success("Booking cancelled.");
      loadBookings();
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <h1 className="text-4xl font-black text-pink-400 mb-8">Admin Bookings</h1>

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

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/55 p-6 text-white/70">
          No bookings found.
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-white/10 bg-zinc-950/55">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-pink-400">
                    {booking.ground?.name || "Ground"}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    booking.status === "confirmed" ? "bg-green-500/20 text-green-300" :
                    booking.status === "cancelled" ? "bg-red-500/20 text-red-300" :
                    "bg-yellow-500/20 text-yellow-300"
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