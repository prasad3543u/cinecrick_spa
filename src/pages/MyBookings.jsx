import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, Circle } from "lucide-react";

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState("");

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
      "Are you sure you want to cancel this booking?\n\nNote: No refund will be provided for cancellations."
    );
    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      setMessage("");
      setError("");
      await api(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
      setMessage("Booking cancelled successfully. No refund will be processed.");
      await loadBookings();
    } catch (err) {
      setError(err.message || "Failed to cancel booking");
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
        <div className="rounded-2xl border border-white/10 bg-zinc-950/55 p-8 text-center">
          <p className="text-white/70 mb-4">No bookings found.</p>
          <Button
            onClick={() => navigate("/grounds")}
            className="bg-gradient-to-r from-pink-500 to-violet-500"
          >
            Book a Ground
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)]"
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-pink-400">
                      {booking.ground?.name || "Ground"}
                    </h2>
                    <p className="text-white/60 text-sm">{booking.ground?.location || "--"}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-white/50 text-xs mb-1">Date</p>
                    <p className="text-white font-semibold">{booking.booking_date || "--"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-white/50 text-xs mb-1">Time Slot</p>
                    <p className="text-white font-semibold">
                      {booking.slot?.start_time || "--"} - {booking.slot?.end_time || "--"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-white/50 text-xs mb-1">Total Price</p>
                    <p className="text-pink-400 font-bold">₹{booking.total_price || "--"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-white/50 text-xs mb-1">Match Type</p>
                    <p className="text-white font-semibold capitalize">
                      {booking.match_type?.replace("_", " ") || "--"}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <BookingTimeline status={booking.status} />

                {/* Cancellation Policy Note */}
                {booking.status === "pending" && (
                  <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
                    <p className="text-yellow-300 text-xs font-semibold mb-1">⚠️ Cancellation Policy</p>
                    <p className="text-yellow-300/80 text-xs">
                      You can cancel this booking while it's pending. Once confirmed by admin, cancellation is not allowed. No refund will be provided.
                    </p>
                    <Button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="mt-3 bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 text-sm h-8"
                    >
                      {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                  </div>
                )}

                {booking.status === "confirmed" && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-white/50 text-xs">
                      🔒 This booking is confirmed. Cancellation is not allowed.
                    </p>
                  </div>
                )}

                {booking.status === "cancelled" && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <p className="text-red-300/80 text-xs">
                      ❌ This booking was cancelled. No refund has been processed.
                    </p>
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

function BookingTimeline({ status }) {
  const steps = [
    { key: "created", label: "Booking Created" },
    { key: "pending", label: "Pending Approval" },
    { key: "confirmed", label: "Confirmed" },
  ];

  function getStepState(stepKey) {
    if (status === "cancelled") {
      if (stepKey === "created") return "done";
      if (stepKey === "pending") return "cancelled";
      return "inactive";
    }
    if (status === "pending") {
      if (stepKey === "created") return "done";
      if (stepKey === "pending") return "active";
      return "inactive";
    }
    if (status === "confirmed") {
      return "done";
    }
    return "inactive";
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const state = getStepState(step.key);
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {/* Line before */}
                {index > 0 && (
                  <div className={`flex-1 h-0.5 ${
                    state === "done" ? "bg-green-500" :
                    state === "cancelled" ? "bg-red-500" :
                    "bg-white/20"
                  }`} />
                )}

                {/* Circle */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  state === "done" ? "bg-green-500" :
                  state === "active" ? "bg-yellow-500" :
                  state === "cancelled" ? "bg-red-500" :
                  "bg-white/20"
                }`}>
                  {state === "done" && <CheckCircle className="h-5 w-5 text-white" />}
                  {state === "active" && <Clock className="h-5 w-5 text-white" />}
                  {state === "cancelled" && <XCircle className="h-5 w-5 text-white" />}
                  {state === "inactive" && <Circle className="h-5 w-5 text-white/40" />}
                </div>

                {/* Line after */}
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${
                    getStepState(steps[index + 1].key) === "done" ||
                    getStepState(steps[index + 1].key) === "active"
                      ? "bg-green-500"
                      : "bg-white/20"
                  }`} />
                )}
              </div>

              {/* Label */}
              <p className={`text-xs mt-2 text-center ${
                state === "done" ? "text-green-400" :
                state === "active" ? "text-yellow-400" :
                state === "cancelled" ? "text-red-400" :
                "text-white/30"
              }`}>
                {state === "cancelled" && step.key === "pending" ? "Cancelled" : step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-500/20 border-yellow-500/30 text-yellow-300",
    confirmed: "bg-green-500/20 border-green-500/30 text-green-300",
    cancelled: "bg-red-500/20 border-red-500/30 text-red-300",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
      styles[status] || "bg-white/10 border-white/10 text-white/60"
    }`}>
      {status}
    </span>
  );
}