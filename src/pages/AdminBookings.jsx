import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBookingCardSkeleton } from "../components/Skeleton";
import { toast } from "sonner";
import {
  CheckCircle, XCircle, MapPin, Calendar,
  Clock, CreditCard, User, MessageCircle,
  Phone, Save, Shield, ArrowLeft, Bell, Droplets, Circle
} from "lucide-react";

function openWhatsAppConfirmation(booking) {
  const phone = booking.user?.phone;
  if (!phone) {
    toast.error("User phone not found. Ask user to add phone in Settings.");
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

Umpire: ${booking.umpire_name || "Will be assigned"}${booking.umpire_phone ? ` - ${booking.umpire_phone}` : ""}
Groundsman: ${booking.groundsman_name || "Will be assigned"}${booking.groundsman_phone ? ` - ${booking.groundsman_phone}` : ""}

Please arrive 10 minutes before your slot.
Thank you for booking with CineCrick!`;

  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
}

function openWhatsAppReminder(booking) {
  const phone = booking.user?.phone;
  if (!phone) {
    toast.error("User phone not found.");
    return;
  }
  const number = String(phone).replace(/\D/g, "");
  const message = `Hi ${booking.user?.name || "there"}, reminder for your match tomorrow!

Ground: ${booking.ground?.name || ""}
Date: ${booking.booking_date || ""}
Time: ${booking.slot?.start_time || ""} - ${booking.slot?.end_time || ""}
Umpire: ${booking.umpire_name || "TBD"}${booking.umpire_phone ? ` - ${booking.umpire_phone}` : ""}
Groundsman: ${booking.groundsman_name || "TBD"}

Please be on time. Good luck!
— CineCrick`;

  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
}

function sendAdminReminder(booking) {
  const adminNumber = booking.ground?.admin_phone;
  
  if (!adminNumber) {
    toast.error("Admin phone number not found for this ground");
    return;
  }
  
  const number = String(adminNumber).replace(/\D/g, "");
  
  const message = `*MATCH REMINDER*

Ground: ${booking.ground?.name}
Date: ${booking.booking_date}
Time: ${booking.slot?.start_time} - ${booking.slot?.end_time}

Team: ${booking.user?.name}
Contact: ${booking.user?.phone}

Current Status:
Umpire Arranged: ${booking.umpire_arranged ? "Yes" : "No"}
Water Arranged: ${booking.water_arranged ? "Yes" : "No"}
Balls Ready: ${booking.balls_ready ? "Yes" : "No"}
Ground Ready: ${booking.ground_ready ? "Yes" : "No"}

Please check and update status in the admin panel.

— CrickOps`;
  
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
  
  toast.success("Reminder sent to admin!");
}

export default function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [savingStaffId, setSavingStaffId] = useState(null);
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [staffForms, setStaffForms] = useState({});

  useEffect(() => { loadBookings(); }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await api("/admin/bookings");
      const list = Array.isArray(data) ? data : [];
      setBookings(list);
      const forms = {};
      list.forEach((b) => {
        forms[b.id] = {
          umpire_name:      b.umpire_name || "",
          umpire_phone:     b.umpire_phone || "",
          groundsman_name:  b.groundsman_name || "",
          groundsman_phone: b.groundsman_phone || "",
        };
      });
      setStaffForms(forms);
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

  async function handleSaveStaff(bookingId) {
    try {
      setSavingStaffId(bookingId);
      await api(`/bookings/${bookingId}/assign_staff`, {
        method: "PATCH",
        body: staffForms[bookingId],
      });
      toast.success("Staff assigned successfully!");
      await loadBookings();
    } catch (err) {
      toast.error(err?.message || "Failed to save staff");
    } finally {
      setSavingStaffId(null);
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
      toast.success("Status updated!");
      await loadBookings();
    } catch (err) {
      toast.error(err?.message || "Failed to update status");
    } finally {
      setSavingStatusId(null);
    }
  }

  function updateStaffForm(bookingId, field, value) {
    setStaffForms((prev) => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], [field]: value },
    }));
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 py-8 sm:py-10">
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
          <h1 className="text-3xl sm:text-4xl font-black text-pink-400">Admin Bookings</h1>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/admin/today")}
            className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30">
            Today's Matches
          </Button>
          <Button onClick={() => navigate("/admin/dashboard")}
            className="bg-white/10 text-white hover:bg-white/15">Dashboard</Button>
          <Button onClick={() => navigate("/admin/grounds")}
            className="bg-white/10 text-white hover:bg-white/15">Manage Grounds</Button>
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
                  }`}>{booking.status}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <User className="h-4 w-4 text-pink-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-white/40">User</p>
                      <p className="text-sm font-semibold truncate">{booking.user?.name || "--"}</p>
                      <p className="text-xs text-white/40 truncate">{booking.user?.email || ""}</p>
                      {booking.user?.phone && (
                        <p className="text-xs text-emerald-400">{booking.user.phone}</p>
                      )}
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

                <div className="mb-4 text-xs text-white/50 space-y-1 px-1">
                  <p>Match Type: <span className="text-white/70">{booking.match_type || "--"}</span></p>
                  <p>Payment: <span className="text-white/70">{booking.payment_status || "--"}</span></p>
                </div>

                {booking.status === "pending" && (
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => handleConfirm(booking)}
                      disabled={confirmingId === booking.id}
                      className="bg-green-500 hover:bg-green-600 text-black font-bold flex items-center gap-2 disabled:opacity-60">
                      <CheckCircle className="h-4 w-4" />
                      {confirmingId === booking.id ? "Confirming..." : "Confirm + Notify"}
                    </Button>
                    <Button onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 flex items-center gap-2 disabled:opacity-60">
                      <XCircle className="h-4 w-4" />
                      {cancellingId === booking.id ? "Cancelling..." : "Reject"}
                    </Button>
                  </div>
                )}

                {booking.status === "confirmed" && (
                  <div className="space-y-4 mt-2">

                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
                      <p className="text-xs font-bold text-violet-300 uppercase tracking-wide flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" /> Assign Staff
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs text-white/50">Umpire Name</label>
                          <Input
                            value={staffForms[booking.id]?.umpire_name || ""}
                            onChange={(e) => updateStaffForm(booking.id, "umpire_name", e.target.value)}
                            placeholder="Umpire full name"
                            className="bg-black/40 border-white/10 text-white placeholder:text-white/20 h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-white/50">Umpire Phone</label>
                          <Input
                            value={staffForms[booking.id]?.umpire_phone || ""}
                            onChange={(e) => updateStaffForm(booking.id, "umpire_phone", e.target.value)}
                            placeholder="+91 9999999999"
                            type="tel"
                            className="bg-black/40 border-white/10 text-white placeholder:text-white/20 h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-white/50">Groundsman Name</label>
                          <Input
                            value={staffForms[booking.id]?.groundsman_name || ""}
                            onChange={(e) => updateStaffForm(booking.id, "groundsman_name", e.target.value)}
                            placeholder="Groundsman full name"
                            className="bg-black/40 border-white/10 text-white placeholder:text-white/20 h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-white/50">Groundsman Phone</label>
                          <Input
                            value={staffForms[booking.id]?.groundsman_phone || ""}
                            onChange={(e) => updateStaffForm(booking.id, "groundsman_phone", e.target.value)}
                            placeholder="+91 9999999999"
                            type="tel"
                            className="bg-black/40 border-white/10 text-white placeholder:text-white/20 h-9 text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSaveStaff(booking.id)}
                        disabled={savingStaffId === booking.id}
                        className="bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 flex items-center gap-2 text-sm disabled:opacity-60"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {savingStaffId === booking.id ? "Saving..." : "Save Staff"}
                      </Button>
                    </div>

                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-3">
                      <p className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                        Match Day Status
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

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() => openWhatsAppConfirmation(booking)}
                        className="bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20 text-xs flex items-center gap-2"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Resend WhatsApp
                      </Button>
                      <Button
                        onClick={() => openWhatsAppReminder(booking)}
                        className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20 text-xs flex items-center gap-2"
                      >
                        <Phone className="h-3.5 w-3.5" /> Send Reminder
                      </Button>
                      <Button
                        onClick={() => sendAdminReminder(booking)}
                        className="bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 text-xs flex items-center gap-2"
                      >
                        <Bell className="h-3.5 w-3.5" /> Remind Admin
                      </Button>
                    </div>
                  </div>
                )}

                {booking.status === "cancelled" && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                    <XCircle className="h-3 w-3 shrink-0" /> Booking cancelled
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