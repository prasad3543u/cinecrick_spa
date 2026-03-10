import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");
      const data = await api("/bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingId) {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      setCancelError("");
      setCancelSuccess("");
      await api(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
      setCancelSuccess("Booking cancelled successfully.");
      await loadBookings();
    } catch (err) {
      setCancelError(err.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-pink-400">My Bookings</h1>
        <Button
          onClick={() => navigate("/home")}
          className="bg-white/10 text-white hover:bg-white/15"
        >
          Back to Home
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {cancelSuccess && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300">
          {cancelSuccess}
        </div>
      )}

      {cancelError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {cancelError}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/55 p-6 text-white/70">
          No bookings found.
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)]"
            >
              <CardContent className="p-6 space-y-2">
                <h2 className="text-2xl font-bold text-pink-400">
                  {booking.ground?.name || "Ground"}
                </h2>
                <p className="text-white/80">Date: {booking.booking_date || "--"}</p>
                <p className="text-white/80">
                  Slot: {booking.slot?.start_time || "--"} - {booking.slot?.end_time || "--"}
                </p>
                <p className="text-white/80">Total Price: ₹{booking.total_price || "--"}</p>
                <p className="text-white/80">
                  Booking Status:{" "}
                  <span className={
                    booking.status === "cancelled"
                      ? "text-red-400"
                      : booking.status === "confirmed"
                      ? "text-green-400"
                      : "text-white/80"
                  }>
                    {booking.status || "--"}
                  </span>
                </p>
                <p className="text-white/80">Payment Status: {booking.payment_status || "--"}</p>
                <p className="text-white/60 text-sm">Location: {booking.ground?.location || "--"}</p>
                <p className="text-white/60 text-sm">Match Type: {booking.match_type || "--"}</p>

                {booking.status !== "cancelled" && (
                  <Button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="mt-3 bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
                  >
                    {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}