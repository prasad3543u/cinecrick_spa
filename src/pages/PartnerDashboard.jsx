import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar, DollarSign, Users, Briefcase, Loader2, ArrowLeft,
  MapPin, Clock, Plus, ChevronDown, ChevronUp, Edit
} from "lucide-react";
import { toast } from "sonner";

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [selectedGround, setSelectedGround] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSlotId, setExpandedSlotId] = useState(null);
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", status: "paid", notes: "" });
  const [staffForm, setStaffForm] = useState({
    staff_type: "umpire", name: "", amount: "", status: "paid", paid_by: ""
  });
  const [offlineForm, setOfflineForm] = useState({
    ground_id: "",
    slot_id: "",
    booking_date: "",
    match_type: "with_opponents",
    users: [
      { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" },
      { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
    ],
    umpire_name: "",
    umpire_amount: "",
    umpire_paid: "pending",
    umpire_paid_by: ""
  });
  const [offlineSlots, setOfflineSlots] = useState([]);

  useEffect(() => {
    loadGrounds();
  }, []);

  useEffect(() => {
    if (selectedGround && selectedDate) {
      loadSlots();
    }
  }, [selectedGround, selectedDate]);

  async function loadGrounds() {
    try {
      const data = await api("/grounds");
      setGrounds(data);
      if (data.length > 0) setSelectedGround(data[0]);
    } catch (err) {
      toast.error("Failed to load grounds");
    }
  }

  async function loadSlots() {
    if (!selectedGround || !selectedDate) {
      toast.error("Please select a ground and date");
      return;
    }
    setLoading(true);
    try {
      const data = await api(`/partners/slots?ground_id=${selectedGround.id}&date=${selectedDate}`);
      setSlots(data);
    } catch (err) {
      console.error("Slots error:", err);
      toast.error(err?.message || "Failed to load slots");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  async function updatePayment() {
    if (!selectedBooking) return;
    try {
      await api("/partners/update_payment", {
        method: "POST",
        body: { booking_id: selectedBooking.id, ...paymentForm }
      });
      toast.success("Payment updated");
      setShowPaymentDialog(false);
      loadSlots(); // refresh
    } catch (err) {
      toast.error(err?.message || "Failed to update payment");
    }
  }

  async function updateStaffPayment() {
    if (!selectedBooking) return;
    try {
      await api("/partners/update_staff_payment", {
        method: "POST",
        body: { booking_id: selectedBooking.id, ...staffForm }
      });
      toast.success("Staff payment updated");
      setShowStaffDialog(false);
      loadSlots();
    } catch (err) {
      toast.error(err?.message || "Failed to update staff payment");
    }
  }

  async function createOfflineBooking() {
    try {
      await api("/admin/offline_bookings", {
        method: "POST",
        body: offlineForm
      });
      toast.success("Booking created");
      setShowOfflineDialog(false);
      loadSlots(); // refresh
    } catch (err) {
      toast.error(err?.message || "Failed to create booking");
    }
  }

  function handleOfflineChange(field, value) {
    setOfflineForm(prev => ({ ...prev, [field]: value }));
  }

  function handleOfflineTeamChange(idx, field, value) {
    const newUsers = [...offlineForm.users];
    newUsers[idx][field] = value;
    setOfflineForm(prev => ({ ...prev, users: newUsers }));
  }

  async function loadOfflineSlots(groundId, date) {
    if (!groundId || !date) return;
    try {
      const data = await api(`/slots?ground_id=${groundId}&slot_date=${date}`);
      setOfflineSlots(data);
    } catch (err) {
      toast.error("Failed to load slots");
    }
  }

  useEffect(() => {
    if (offlineForm.ground_id && offlineForm.booking_date) {
      loadOfflineSlots(offlineForm.ground_id, offlineForm.booking_date);
    }
  }, [offlineForm.ground_id, offlineForm.booking_date]);

  // Adjust number of teams based on match type
  useEffect(() => {
    if (offlineForm.match_type === "with_opponents") {
      setOfflineForm(prev => ({
        ...prev,
        users: [
          { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" },
          { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
        ]
      }));
    } else {
      setOfflineForm(prev => ({
        ...prev,
        users: [
          { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
        ]
      }));
    }
  }, [offlineForm.match_type]);

  if (!selectedGround) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/home")}
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-pink-400">Partner Dashboard</h1>
        </div>
        <Button onClick={() => setShowOfflineDialog(true)} className="bg-emerald-500">
          <Plus className="h-4 w-4 mr-1" /> Add Booking
        </Button>
      </div>

      {/* Ground & Date Selection */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div className="w-64">
          <Label className="text-white/80">Ground</Label>
          <Select
            value={selectedGround.id.toString()}
            onValueChange={(val) => {
              const ground = grounds.find(g => g.id.toString() === val);
              setSelectedGround(ground);
            }}
          >
            <SelectTrigger className="bg-zinc-800 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/20 text-white">
              {grounds.map(g => (
                <SelectItem key={g.id} value={g.id.toString()} className="text-white hover:bg-zinc-700">
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-white/80">Date</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-zinc-800 border-white/20 text-white mt-1 w-48"
          />
        </div>
        <div>
          <Button onClick={loadSlots} disabled={!selectedDate} className="bg-blue-500/20 text-blue-300">
            Load Slots
          </Button>
        </div>
      </div>

      {/* Slots Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12 text-white/50">No slots found for this date.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {slots.map(slot => (
            <Card key={slot.id} className="border-white/10 bg-zinc-950/55 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{slot.start_time} – {slot.end_time}</h3>
                    <p className="text-pink-400 font-semibold">₹{slot.price} per team</p>
                    <p className="text-white/50 text-sm mt-1">
                      Teams: {slot.teams_booked_count || 0} / {slot.max_teams || 2}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedSlotId(expandedSlotId === slot.id ? null : slot.id)}
                  >
                    {expandedSlotId === slot.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {expandedSlotId === slot.id && (
                  <div className="mt-4 border-t border-white/10 pt-3 space-y-3">
                    {slot.bookings && slot.bookings.length > 0 ? (
                      slot.bookings.map((booking, idx) => (
                        <div key={booking.id} className="bg-white/5 p-3 rounded-lg">
                          <p className="font-semibold text-pink-400">Team {idx + 1}</p>
                          <p className="text-sm">{booking.user?.name}</p>
                          <p className="text-xs text-white/50">{booking.user?.phone} | {booking.user?.email}</p>
                          <div className="flex justify-between items-center mt-2">
                            <div>
                              <span className="text-xs text-white/50">Payment:</span>
                              <Badge className={`ml-2 ${booking.payment_status === "paid" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                {booking.payment_status}
                              </Badge>
                              {booking.payment_bookings?.[0] && (
                                <span className="ml-2 text-xs">₹{booking.payment_bookings[0].amount}</span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setPaymentForm({
                                  amount: booking.payment_bookings?.[0]?.amount || booking.total_price,
                                  status: booking.payment_status,
                                  notes: booking.payment_bookings?.[0]?.notes || ""
                                });
                                setShowPaymentDialog(true);
                              }}
                              className="border-blue-500/30 text-blue-300 h-7 px-2"
                            >
                              <Edit className="h-3 w-3 mr-1" /> Payment
                            </Button>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div>
                              <span className="text-xs text-white/50">Umpire:</span>
                              {booking.staff_payments?.filter(sp => sp.staff_type === "umpire").map(sp => (
                                <div key={sp.id} className="text-xs">
                                  {sp.name} – ₹{sp.amount} – {sp.status}
                                  {sp.paid_by && ` (paid by ${sp.paid_by})`}
                                </div>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                const umpire = booking.staff_payments?.find(sp => sp.staff_type === "umpire");
                                setStaffForm({
                                  staff_type: "umpire",
                                  name: umpire?.name || "",
                                  amount: umpire?.amount || "",
                                  status: umpire?.status || "pending",
                                  paid_by: umpire?.paid_by || ""
                                });
                                setShowStaffDialog(true);
                              }}
                              className="border-violet-500/30 text-violet-300 h-7 px-2"
                            >
                              <Edit className="h-3 w-3 mr-1" /> Umpire
                            </Button>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div>
                              <span className="text-xs text-white/50">Groundsman:</span>
                              {booking.staff_payments?.filter(sp => sp.staff_type === "groundsman").map(sp => (
                                <div key={sp.id} className="text-xs">
                                  {sp.name} – ₹{sp.amount} – {sp.status}
                                </div>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                const groundsman = booking.staff_payments?.find(sp => sp.staff_type === "groundsman");
                                setStaffForm({
                                  staff_type: "groundsman",
                                  name: groundsman?.name || "",
                                  amount: groundsman?.amount || "",
                                  status: groundsman?.status || "pending",
                                  paid_by: groundsman?.paid_by || ""
                                });
                                setShowStaffDialog(true);
                              }}
                              className="border-cyan-500/30 text-cyan-300 h-7 px-2"
                            >
                              <Edit className="h-3 w-3 mr-1" /> Groundsman
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/50 text-sm">No bookings for this slot.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs (same as before) */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white">
          <DialogHeader><DialogTitle>Update Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={paymentForm.status} onValueChange={(val) => setPaymentForm({ ...paymentForm, status: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={updatePayment} className="bg-emerald-500">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white">
          <DialogHeader><DialogTitle>Update Staff Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Staff Type</Label>
              <Select value={staffForm.staff_type} onValueChange={(val) => setStaffForm({ ...staffForm, staff_type: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="umpire">Umpire</SelectItem>
                  <SelectItem value="groundsman">Groundsman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={staffForm.amount} onChange={(e) => setStaffForm({ ...staffForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={staffForm.status} onValueChange={(val) => setStaffForm({ ...staffForm, status: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Paid By (Team/Captain)</Label>
              <Input value={staffForm.paid_by} onChange={(e) => setStaffForm({ ...staffForm, paid_by: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowStaffDialog(false)}>Cancel</Button>
            <Button onClick={updateStaffPayment} className="bg-emerald-500">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showOfflineDialog} onOpenChange={setShowOfflineDialog}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Offline Booking</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ground</Label>
              <Select value={offlineForm.ground_id} onValueChange={(val) => handleOfflineChange("ground_id", val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {grounds.map(g => (
                    <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={offlineForm.booking_date} onChange={(e) => handleOfflineChange("booking_date", e.target.value)} />
            </div>
            {offlineSlots.length > 0 && (
              <div>
                <Label>Slot</Label>
                <Select value={offlineForm.slot_id} onValueChange={(val) => handleOfflineChange("slot_id", val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {offlineSlots.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.start_time} – {s.end_time} (₹{s.price})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Match Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" value="with_opponents" checked={offlineForm.match_type === "with_opponents"} onChange={() => handleOfflineChange("match_type", "with_opponents")} />
                  With Opponents (2 teams)
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="without_opponents" checked={offlineForm.match_type === "without_opponents"} onChange={() => handleOfflineChange("match_type", "without_opponents")} />
                  Without Opponents (1 team)
                </label>
              </div>
            </div>
            {offlineForm.slot_id && (
              <>
                {offlineForm.users.map((team, idx) => (
                  <div key={idx} className="border border-white/10 p-3 rounded-lg space-y-2">
                    <p className="font-semibold text-pink-400">Team {idx + 1}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Name" value={team.name} onChange={(e) => handleOfflineTeamChange(idx, "name", e.target.value)} />
                      <Input placeholder="Phone" value={team.phone} onChange={(e) => handleOfflineTeamChange(idx, "phone", e.target.value)} />
                      <Input placeholder="Email/WhatsApp" value={team.email} onChange={(e) => handleOfflineTeamChange(idx, "email", e.target.value)} />
                      <Input type="number" placeholder="Payment Amount" value={team.payment_amount} onChange={(e) => handleOfflineTeamChange(idx, "payment_amount", e.target.value)} />
                      <Select value={team.payment_status} onValueChange={(val) => handleOfflineTeamChange(idx, "payment_status", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                <div className="border border-white/10 p-3 rounded-lg space-y-2">
                  <p className="font-semibold text-pink-400">Umpire Payment</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Umpire Name" value={offlineForm.umpire_name} onChange={(e) => handleOfflineChange("umpire_name", e.target.value)} />
                    <Input type="number" placeholder="Amount" value={offlineForm.umpire_amount} onChange={(e) => handleOfflineChange("umpire_amount", e.target.value)} />
                    <Select value={offlineForm.umpire_paid} onValueChange={(val) => handleOfflineChange("umpire_paid", val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Paid By (Team/Captain)" value={offlineForm.umpire_paid_by} onChange={(e) => handleOfflineChange("umpire_paid_by", e.target.value)} />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowOfflineDialog(false)}>Cancel</Button>
            <Button onClick={createOfflineBooking} className="bg-emerald-500">Create Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}