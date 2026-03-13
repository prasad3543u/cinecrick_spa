import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminBookingCardSkeleton } from "../components/Skeleton";
import { toast } from "sonner";
import {
  CheckCircle, XCircle, MapPin, Calendar,
  Clock, CreditCard, User, MessageCircle
} from "lucide-react";

function openWhatsAppConfirmation(booking) {
  const phone = booking.user?.phone;
  if (!phone) {
    toast.error("User phone number not found. Ask user to add phone in their profile.");
    return;
  }

  const number = String(phone).replace(/\D/g, "");

  const message = `Hi ${booking.user?.name || "there"},

Your CineCrick booking has been CONFIRMED!

Ground: ${booking.ground?.name || ""}
Location: ${booking.ground?.location || ""}
Date: ${booking.booking_date || ""}
Time: ${booking.slot?.start_time || ""} - ${booking.slot?.end_time || ""}
Price: Rs.${booking.total_price || ""}
Match Type: ${booking.match_type || ""}

Please arrive 10 minutes before your slot.
No cancellations allowed after confirmation.

Thank you for booking with CineCrick!`;

  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
}

export default function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

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

  async function handleConfirm(booking) {
    try {
      setConfirmingId(booking.id);
      toast.info("Confirming booking...");
      await api(`/bookings/${booking.id}/confirm`, { method: "PATCH" });
      toast.success("Booking confirmed! Opening WhatsApp...");
      await loadBookings();
      openWhatsAppConfirmation(booking);
    } catch (err) {
      toast.error(err?.message || "Failed to confirm booking");
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleCancel(id) {
    try {
      setCancellingId(id);
      toast.info("Cancelling booking...");
      await api(`/bookings/${id}/cancel`, { method: "PATCH" });
      toast.success("Booking cancelled.");
      await loadBookings();
    } catch (err) {
      toast.error(err?.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-black text-pink-400">Admin Bookings</h1>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/admin/dashboard")} className="bg-white/10 text-white hover:bg-white/15">
            Dashboard
          </Button>
          <Button onClick={() => navigate("/admin/grounds")} className="bg-white/10 text-white hover:bg-white/15">
            Manage Grounds
          </Button>
        </div>
      </div>

      <div className="grid gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <AdminBookingCardSkeleton key={i} />)
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950/55 p-6 text-white/70">
            No bookings found.
          </div>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className="border-white/10 bg-zinc-950/55 overflow-hidden">
              <div className={`h-1 w-full ${
                booking.status === "confirmed" ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                booking.status === "cancelled" ? "bg-gradient-to-r from-red-500 to-rose-400" :
                "bg-gradient-to-r from-yellow-500 to-orange-400"
              }`} />

              <CardContent className="p-4 sm:p-6">

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-pink-400 leading-tight">
                      {booking.ground?.name || "Ground"}
                    </h2>
                    <div className="flex items-center gap-1 text-white/50 text-xs mt-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{booking.ground?.location || "--"}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    booking.status === "confirmed" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                    booking.status === "cancelled" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                    "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  }`}>
                    {booking.status}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <User className="h-4 w-4 text-pink-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-white/40">User</p>
                      <p className="text-sm font-semibold truncate">{booking.user?.name || "--"}</p>
                      <p className="text-xs text-white/40 truncate">{booking.user?.email || ""}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <Calendar className="h-4 w-4 text-violet-400 shrink-0" />
                    <div>
                      <p className="text-xs text-white/40">Date</p>
                      <p className="text-sm font-semibold">{booking.booking_date || "--"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-xs text-white/40">Slot</p>
                      <p className="text-sm font-semibold">
                        {booking.slot?.start_time || "--"} - {booking.slot?.end_time || "--"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <CreditCard className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs text-white/40">Price</p>
                      <p className="text-sm font-semibold">Rs.{booking.total_price || "--"}</p>
                    </div>
                  </div>
                </div>

                {/* Extra info */}
                <div className="mb-4 text-xs text-white/50 space-y-1 px-1">
                  <p>Match Type: <span className="text-white/70">{booking.match_type || "--"}</span></p>
                  <p>Payment: <span className="text-white/70">{booking.payment_status || "--"}</span></p>
                </div>

                {/* Pending actions */}
                {booking.status === "pending" && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => handleConfirm(booking)}
                      disabled={confirmingId === booking.id}
                      className="bg-green-500 hover:bg-green-600 text-black font-bold flex items-center gap-2 disabled:opacity-60"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {confirmingId === booking.id ? "Confirming..." : "Confirm + Notify"}
                    </Button>
                    <Button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 flex items-center gap-2 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      {cancellingId === booking.id ? "Cancelling..." : "Reject"}
                    </Button>
                  </div>
                )}

                {/* Confirmed */}
                {booking.status === "confirmed" && (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-300">
                      <CheckCircle className="h-3 w-3 shrink-0" />
                      Booking confirmed
                    </div>
                    <Button
                      onClick={() => openWhatsAppConfirmation(booking)}
                      className="bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20 text-xs flex items-center gap-2"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Resend WhatsApp
                    </Button>
                  </div>
                )}

                {/* Cancelled */}
                {booking.status === "cancelled" && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                    <XCircle className="h-3 w-3 shrink-0" />
                    Booking cancelled
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