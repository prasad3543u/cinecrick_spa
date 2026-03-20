import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CheckCircle, Clock, MapPin, User,
  MessageCircle, Phone, Droplets, Circle, Send, ArrowLeft, Loader2
} from "lucide-react";

function sendWhatsAppReminder(booking) {
  const phone = booking.user?.phone;
  if (!phone) return false;
  const number = String(phone).replace(/\D/g, "");
  const message = `Hi ${booking.user?.name || "there"}, reminder for your match TODAY!

Ground: ${booking.ground?.name || ""}
Time: ${booking.slot?.start_time || ""} - ${booking.slot?.end_time || ""}
Umpire: ${booking.umpire_name || "TBD"}${booking.umpire_phone ? ` - ${booking.umpire_phone}` : ""}
Groundsman: ${booking.groundsman_name || "TBD"}

Please arrive 10 minutes early. Good luck!
— CineCrick`;

  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
  return true;
}

export default function AdminToday() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStatusId, setSavingStatusId] = useState(null);

  useEffect(() => { loadToday(); }, []);

  async function loadToday() {
    try {
      setLoading(true);
      const data = await api("/admin/today");
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.message || "Failed to load today's matches");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusToggle(booking, field) {
    try {
      setSavingStatusId(booking.id);
      const updated = {
        umpire_arranged: booking.umpire_arranged,
        water_arranged:  booking.water_arranged,
        balls_ready:     booking.balls_ready,
        ground_ready:    booking.ground_ready,
        [field]: !booking[field],
      };
      await api(`/bookings/${booking.id}/update_status`, {
        method: "PATCH",
        body: updated,
      });
      await loadToday();
    } catch (err) {
      toast.error(err?.message || "Failed to update status");
    } finally {
      setSavingStatusId(null);
    }
  }

  async function sendAllReminders() {
    const withPhone = bookings.filter((b) => b.user?.phone);
    if (withPhone.length === 0) {
      toast.error("No users have phone numbers added.");
      return;
    }
    let sent = 0;
    for (const booking of withPhone) {
      setTimeout(() => {
        sendWhatsAppReminder(booking);
      }, sent * 1500);
      sent++;
    }
    toast.success(`Sending reminders to ${sent} teams...`);
  }

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const allReady = bookings.length > 0 && bookings.every(
    (b) => b.umpire_arranged && b.water_arranged && b.balls_ready && b.ground_ready
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 py-8">

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-1 px-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-pink-400">
              Today's Matches
            </h1>
            <p className="text-white/40 text-sm mt-1">{today}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {bookings.length > 0 && (
            <Button
              onClick={sendAllReminders}
              className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send All Reminders
            </Button>
          )}
          <Button onClick={() => navigate("/admin/bookings")}
            className="bg-white/10 text-white hover:bg-white/15">
            All Bookings
          </Button>
          <Button onClick={() => navigate("/admin/dashboard")}
            className="bg-white/10 text-white hover:bg-white/15">
            Dashboard
          </Button>
        </div>
      </div>

      {!loading && bookings.length > 0 && (
        <div className={`mb-6 rounded-xl border px-4 py-3 flex items-center gap-3 ${
          allReady
            ? "border-green-500/30 bg-green-500/10 text-green-300"
            : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
        }`}>
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm font-semibold">
            {allReady
              ? "All matches are fully prepared. Have a great match day!"
              : `${bookings.length} match${bookings.length > 1 ? "es" : ""} today — check preparation status below.`}
          </span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/55 p-16 text-center">
          <p className="text-white/40 text-lg">No confirmed matches today.</p>
          <p className="text-white/30 text-sm mt-2">Check back on match days.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => {
            const matchReady = booking.umpire_arranged && booking.water_arranged &&
                               booking.balls_ready && booking.ground_ready;
            return (
              <Card key={booking.id} className="border-white/10 bg-zinc-950/55 overflow-hidden">
                <div className={`h-1 w-full ${
                  matchReady
                    ? "bg-gradient-to-r from-green-500 to-emerald-400"
                    : "bg-gradient-to-r from-yellow-500 to-orange-400"
                }`} />

                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-pink-400">
                        {booking.ground?.name || "Ground"}
                      </h2>
                      <div className="flex items-center gap-1 text-white/50 text-xs mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{booking.ground?.location || "--"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1">
                      <Clock className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-xs font-bold text-cyan-300">
                        {booking.slot?.start_time || "--"} - {booking.slot?.end_time || "--"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <User className="h-4 w-4 text-pink-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-white/40">Team</p>
                        <p className="text-sm font-semibold truncate">
                          {booking.user?.name || "--"}
                        </p>
                        {booking.user?.phone && (
                          <a href={`tel:${booking.user.phone}`}
                            className="text-xs text-emerald-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" />{booking.user.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <User className="h-4 w-4 text-violet-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-white/40">Umpire</p>
                        <p className="text-sm font-semibold truncate">
                          {booking.umpire_name || "Not assigned"}
                        </p>
                        {booking.umpire_phone && (
                          <a href={`tel:${booking.umpire_phone}`}
                            className="text-xs text-emerald-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" />{booking.umpire_phone}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <User className="h-4 w-4 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-white/40">Groundsman</p>
                        <p className="text-sm font-semibold truncate">
                          {booking.groundsman_name || "Not assigned"}
                        </p>
                        {booking.groundsman_phone && (
                          <a href={`tel:${booking.groundsman_phone}`}
                            className="text-xs text-emerald-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" />{booking.groundsman_phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-white/40 uppercase tracking-wide mb-2">
                      Preparation Status
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { field: "umpire_arranged", label: "Umpire Arranged", icon: <User className="h-4 w-4" /> },
                        { field: "water_arranged",  label: "Water Arranged",  icon: <Droplets className="h-4 w-4" /> },
                        { field: "balls_ready",     label: "Balls Ready",     icon: <Circle className="h-4 w-4" /> },
                        { field: "ground_ready",    label: "Ground Ready",    icon: <CheckCircle className="h-4 w-4" /> },
                      ].map(({ field, label, icon }) => (
                        <button
                          key={field}
                          type="button"
                          onClick={() => handleStatusToggle(booking, field)}
                          disabled={savingStatusId === booking.id}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition text-xs font-semibold ${
                            booking[field]
                              ? "bg-green-500/20 border-green-500/40 text-green-300"
                              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className={booking[field] ? "text-green-400" : "text-white/20"}>
                            {icon}
                          </span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => sendWhatsAppReminder(booking)}
                      className="bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20 text-xs flex items-center gap-2"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Team
                    </Button>
                    {booking.umpire_phone && (
                      <Button
                        onClick={() => {
                          const num = String(booking.umpire_phone).replace(/\D/g, "");
                          const msg = `Hi ${booking.umpire_name}, reminder for today's match!\n\nGround: ${booking.ground?.name}\nTime: ${booking.slot?.start_time} - ${booking.slot?.end_time}\n\nPlease be on time.\n— CineCrick`;
                          window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
                        }}
                        className="bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 text-xs flex items-center gap-2"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Umpire
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}