import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingCardSkeleton } from "../components/Skeleton";
import {
  CheckCircle, Clock, XCircle, Calendar,
  MapPin, CreditCard, AlertTriangle, Phone, User, Droplets, Circle
} from "lucide-react";

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  useEffect(() => { loadBookings(); }, []);

  async function loadBookings() {
    try {
      setLoading(true); setError("");
      const data = await api("/bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel?\n\nNo refund will be provided on cancellation."
    );
    if (!confirmed) return;
    try {
      setCancellingId(bookingId); setCancelError(""); setCancelSuccess("");
      await api(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
      setCancelSuccess("Booking cancelled. No refund will be issued.");
      await loadBookings();
    } catch (err) {
      setCancelError(err?.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl font-black text-pink-400">My Bookings</h1>
        <Button onClick={() => navigate("/home")} className="bg-white/10 text-white hover:bg-white/15">
          Back to Home
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}
      {cancelSuccess && (
        <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-300 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />{cancelSuccess}
        </div>
      )}
      {cancelError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />{cancelError}
        </div>
      )}

      <div className="grid gap-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <BookingCardSkeleton key={i} />)
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950/55 p-10 text-center">
            <p className="text-white/50 text-lg">No bookings yet.</p>
            <Button onClick={() => navigate("/grounds")}
              className="mt-4 bg-gradient-to-r from-pink-500 to-violet-500">
              Browse Grounds
            </Button>
          </div>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id}
              className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)] overflow-hidden">
              <div className={`h-1 w-full ${
                booking.status === "confirmed" ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                booking.status === "cancelled" ? "bg-gradient-to-r from-red-500 to-rose-400" :
                "bg-gradient-to-r from-yellow-500 to-orange-400"
              }`} />

              <CardContent className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-pink-400 leading-tight">
                      {booking.ground?.name || "Ground"}
                    </h2>
                    <div className="flex items-center gap-1 text-white/60 text-xs sm:text-sm mt-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{booking.ground?.location || "--"}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                    booking.status === "confirmed" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                    booking.status === "cancelled" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                    "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  }`}>{booking.status?.toUpperCase()}</span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <Calendar className="h-4 w-4 text-pink-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-white/50">Date</p>
                      <p className="text-sm font-semibold truncate">{booking.booking_date || "--"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <Clock className="h-4 w-4 text-violet-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-white/50">Slot</p>
                      <p className="text-sm font-semibold truncate">
                        {booking.slot?.start_time || "--"} - {booking.slot?.end_time || "--"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <CreditCard className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs text-white/50">Total Price</p>
                      <p className="text-sm font-semibold">₹{booking.total_price || "--"}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 text-xs sm:text-sm text-white/60 space-y-1">
                  <p>Match Type: <span className="text-white/80">{booking.match_type || "--"}</span></p>
                  <p>Payment: <span className="text-white/80">{booking.payment_status || "--"}</span></p>
                </div>

                {/* Staff details — only on confirmed bookings with staff assigned */}
                {booking.status === "confirmed" && (booking.umpire_name || booking.groundsman_name) && (
                  <div className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
                    <p className="text-xs font-bold text-violet-300 uppercase tracking-wide">Match Day Staff</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {booking.umpire_name && (
                        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                          <User className="h-4 w-4 text-violet-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-white/40">Umpire</p>
                            <p className="text-sm font-semibold">{booking.umpire_name}</p>
                            {booking.umpire_phone && (
                              <a href={`tel:${booking.umpire_phone}`}
                                className="text-xs text-emerald-400 flex items-center gap-1 hover:text-emerald-300 transition">
                                <Phone className="h-3 w-3" />{booking.umpire_phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      {booking.groundsman_name && (
                        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                          <User className="h-4 w-4 text-cyan-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-white/40">Groundsman</p>
                            <p className="text-sm font-semibold">{booking.groundsman_name}</p>
                            {booking.groundsman_phone && (
                              <a href={`tel:${booking.groundsman_phone}`}
                                className="text-xs text-emerald-400 flex items-center gap-1 hover:text-emerald-300 transition">
                                <Phone className="h-3 w-3" />{booking.groundsman_phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Match day status — only confirmed */}
                {booking.status === "confirmed" && (
                  <div className="mb-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                    <p className="text-xs font-bold text-cyan-300 uppercase tracking-wide mb-3">
                      Match Day Checklist
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { field: "umpire_reached", label: "Umpire Ready", icon: <User className="h-4 w-4" /> },
                        { field: "water_arranged", label: "Water Ready", icon: <Droplets className="h-4 w-4" /> },
                        { field: "balls_ready",    label: "Balls Ready", icon: <Circle className="h-4 w-4" /> },
                        { field: "ground_ready",   label: "Ground Ready", icon: <CheckCircle className="h-4 w-4" /> },
                      ].map(({ field, label, icon }) => (
                        <div key={field}
                          className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold ${
                            booking[field]
                              ? "bg-green-500/15 border-green-500/30 text-green-300"
                              : "bg-white/5 border-white/10 text-white/30"
                          }`}>
                          <span className={booking[field] ? "text-green-400" : "text-white/20"}>
                            {icon}
                          </span>
                          {label}
                          <span className="text-[10px]">{booking[field] ? "Done" : "Pending"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="mb-4">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Booking Timeline</p>
                  <div className="flex items-center">
                    <TimelineStep icon={<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />} label="Created" active={true} color="pink" />
                    <TimelineLine active={true} />
                    <TimelineStep icon={<Clock className="h-3 w-3 sm:h-4 sm:w-4" />} label="Pending" active={["pending","confirmed","cancelled"].includes(booking.status)} color="yellow" />
                    <TimelineLine active={["confirmed","cancelled"].includes(booking.status)} />
                    {booking.status === "cancelled" ? (
                      <TimelineStep icon={<XCircle className="h-3 w-3 sm:h-4 sm:w-4" />} label="Cancelled" active={true} color="red" />
                    ) : (
                      <TimelineStep icon={<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />} label="Confirmed" active={booking.status === "confirmed"} color="green" />
                    )}
                  </div>
                </div>

                {/* Status messages */}
                {booking.status === "pending" && (
                  <div>
                    <div className="mb-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-300 flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      Once confirmed by admin, cancellation is not allowed.
                    </div>
                    <Button onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="w-full sm:w-auto bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 text-sm">
                      {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                  </div>
                )}

                {booking.status === "confirmed" && (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-300 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    Booking confirmed. See you on the ground!
                  </div>
                )}

                {booking.status === "cancelled" && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300 flex items-center gap-2">
                    <XCircle className="h-3 w-3 shrink-0" />
                    Booking cancelled. No refund issued.
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function TimelineStep({ icon, label, active, color }) {
  const colors = {
    pink:   active ? "bg-pink-500 border-pink-500 text-white"   : "bg-white/5 border-white/10 text-white/30",
    yellow: active ? "bg-yellow-500 border-yellow-500 text-black" : "bg-white/5 border-white/10 text-white/30",
    green:  active ? "bg-green-500 border-green-500 text-white"  : "bg-white/5 border-white/10 text-white/30",
    red:    active ? "bg-red-500 border-red-500 text-white"      : "bg-white/5 border-white/10 text-white/30",
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 flex items-center justify-center transition-all ${colors[color]}`}>
        {icon}
      </div>
      <span className={`text-[10px] sm:text-xs whitespace-nowrap ${active ? "text-white/80" : "text-white/30"}`}>
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