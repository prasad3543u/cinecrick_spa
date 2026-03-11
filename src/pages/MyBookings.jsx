import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, Calendar, MapPin, CreditCard } from "lucide-react";

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
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to cancel?\n\nNo refund will be provided on cancellation."
    );
    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      setCancelError("");
      setCancelSuccess("");
      await api(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
      setCancelSuccess("Booking cancelled. No refund will be issued.");
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
        <div className="text-white/70">Loading bookings...</div>
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
        <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-300">
          {cancelSuccess}
        </div>
      )}

      {cancelError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {cancelError}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/55 p-10 text-center">
          <p className="text-white/50 text-lg">No bookings yet.</p>
          <Button
            onClick={() => navigate("/grounds")}
            className="mt-4 bg-gradient-to-r from-pink-500 to-violet-500"
          >
            Browse Grounds
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)] overflow-hidden"
            >
              {/* Status bar at top */}
              <div className={`h-1 w-full ${
                booking.status === "confirmed" ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                booking.status === "cancelled" ? "bg-gradient-to-r from-red-500 to-rose-400" :
                "bg-gradient-to-r from-yellow-500 to-orange-400"
              }`} />

              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-pink-400">
                      {booking.ground?.name || "Ground"}
                    </h2>
                    <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
                      <MapPin className="h-3 w-3" />
                      {booking.ground?.location || "--"}
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    booking.status === "confirmed" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                    booking.status === "cancelled" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                    "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  }`}>
                    {booking.status?.toUpperCase()}
                  </span>
                </div>

                {/* Booking details */}
                <div className="grid sm:grid-cols-3 gap-3 mb-6">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <Calendar className="h-4 w-4 text-pink-400" />
                    <div>
                      <p className="text-xs text-white/50">Date</p>
                      <p className="text-sm font-semibold">{booking.booking_date || "--"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <Clock className="h-4 w-4 text-violet-400" />
                    <div>
                      <p className="text-xs text-white/50">Slot</p>
                      <p className="text-sm font-semibold">
                        {booking.slot?.start_time || "--"} - {booking.slot?.end_time || "--"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="text-xs text-white/50">Total Price</p>
                      <p className="text-sm font-semibold">₹{booking.total_price || "--"}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 text-sm text-white/60 space-y-1">
                  <p>Match Type: <span className="text-white/80">{booking.match_type || "--"}</span></p>
                  <p>Payment: <span className="text-white/80">{booking.payment_status || "--"}</span></p>
                </div>

                {/* Timeline */}
                <div className="mb-5">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Booking Timeline</p>
                  <div className="flex items-center gap-0">

                    {/* Step 1 - Created */}
                    <TimelineStep
                      icon={<CheckCircle className="h-4 w-4" />}
                      label="Created"
                      active={true}
                      color="pink"
                    />

                    <TimelineLine active={true} />

                    {/* Step 2 - Pending */}
                    <TimelineStep
                      icon={<Clock className="h-4 w-4" />}
                      label="Pending"
                      active={["pending", "confirmed", "cancelled"].includes(booking.status)}
                      color="yellow"
                    />

                    <TimelineLine
                      active={["confirmed", "cancelled"].includes(booking.status)}
                    />

                    {/* Step 3 - Confirmed or Cancelled */}
                    {booking.status === "cancelled" ? (
                      <TimelineStep
                        icon={<XCircle className="h-4 w-4" />}
                        label="Cancelled"
                        active={true}
                        color="red"
                      />
                    ) : (
                      <TimelineStep
                        icon={<CheckCircle className="h-4 w-4" />}
                        label="Confirmed"
                        active={booking.status === "confirmed"}
                        color="green"
                      />
                    )}
                  </div>
                </div>

                {/* Cancel button — only when pending */}
                {booking.status === "pending" && (
                  <div>
                    <div className="mb-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-300">
                      ⚠️ Once confirmed by admin, cancellation is not allowed. No refund on cancellation.
                    </div>
                    <Button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
                    >
                      {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                  </div>
                )}

                {booking.status === "confirmed" && (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-300">
                    ✅ Booking confirmed. See you on the ground!
                  </div>
                )}

                {booking.status === "cancelled" && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                    ❌ Booking cancelled. No refund issued.
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

function TimelineStep({ icon, label, active, color }) {
  const colors = {
    pink: active ? "bg-pink-500 border-pink-500 text-white" : "bg-white/5 border-white/10 text-white/30",
    yellow: active ? "bg-yellow-500 border-yellow-500 text-black" : "bg-white/5 border-white/10 text-white/30",
    green: active ? "bg-green-500 border-green-500 text-white" : "bg-white/5 border-white/10 text-white/30",
    red: active ? "bg-red-500 border-red-500 text-white" : "bg-white/5 border-white/10 text-white/30",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${colors[color]}`}>
        {icon}
      </div>
      <span className={`text-xs whitespace-nowrap ${active ? "text-white/80" : "text-white/30"}`}>
        {label}
      </span>
    </div>
  );
}

function TimelineLine({ active }) {
  return (
    <div className={`h-0.5 flex-1 mx-1 mb-4 transition-all ${active ? "bg-white/40" : "bg-white/10"}`} />
  );
}