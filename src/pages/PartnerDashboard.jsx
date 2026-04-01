import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, DollarSign, Users, Briefcase, Loader2, ArrowLeft, 
  MapPin, Clock, Plus, Eye, CheckCircle, XCircle, Search 
} from "lucide-react";
import { toast } from "sonner";

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", status: "paid", notes: "" });
  const [staffForm, setStaffForm] = useState({
    staff_type: "umpire", name: "", amount: "", status: "paid", paid_by: ""
  });
  // New state for slot view
  const [selectedGround, setSelectedGround] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showOfflineBookingDialog, setShowOfflineBookingDialog] = useState(false);
  const [offlineBookingForm, setOfflineBookingForm] = useState({
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

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (selectedGround && selectedDate) {
      loadSlots();
    }
  }, [selectedGround, selectedDate]);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await api("/partners/dashboard");
      setStats(data.stats);
      setBookings(data.bookings);
      setGrounds(data.grounds);
    } catch (err) {
      toast.error(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function loadSlots() {
    setLoadingSlots(true);
    try {
      const data = await api(`/slots?ground_id=${selectedGround}&slot_date=${selectedDate}`);
      setSlots(data);
    } catch (err) {
      toast.error("Failed to load slots");
    } finally {
      setLoadingSlots(false);
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
      loadDashboard(); // refresh
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
      loadDashboard();
    } catch (err) {
      toast.error(err?.message || "Failed to update staff payment");
    }
  }

  async function createOfflineBooking() {
    try {
      await api("/admin/offline_bookings", {
        method: "POST",
        body: offlineBookingForm
      });
      toast.success("Offline booking created");
      setShowOfflineBookingDialog(false);
      // Refresh relevant data
      if (activeTab === "slots") loadSlots();
      else loadDashboard();
    } catch (err) {
      toast.error(err?.message || "Failed to create booking");
    }
  }

  function handleTeamChange(index, field, value) {
    const newUsers = [...offlineBookingForm.users];
    newUsers[index][field] = value;
    setOfflineBookingForm({ ...offlineBookingForm, users: newUsers });
  }

  function handleOfflineFormChange(field, value) {
    setOfflineBookingForm({ ...offlineBookingForm, [field]: value });
  }

  // Adjust number of teams based on match type
  useEffect(() => {
    if (offlineBookingForm.match_type === "with_opponents") {
      setOfflineBookingForm(prev => ({
        ...prev,
        users: [
          { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" },
          { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
        ]
      }));
    } else {
      setOfflineBookingForm(prev => ({
        ...prev,
        users: [
          { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
        ]
      }));
    }
  }, [offlineBookingForm.match_type]);

  // When selecting ground for offline booking, auto-fill ground_id
  const handleOfflineGroundChange = (groundId) => {
    setOfflineBookingForm({ ...offlineBookingForm, ground_id: groundId });
  };

  // When date changes, load slots for offline booking
  const handleOfflineDateChange = async (date) => {
    setOfflineBookingForm({ ...offlineBookingForm, booking_date: date, slot_id: "" });
    if (offlineBookingForm.ground_id && date) {
      try {
        const data = await api(`/slots?ground_id=${offlineBookingForm.ground_id}&slot_date=${date}`);
        setOfflineBookingForm(prev => ({ ...prev, slots: data }));
      } catch (err) {
        toast.error("Failed to load slots");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 py-6">
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
        <Button onClick={() => setShowOfflineBookingDialog(true)} className="bg-emerald-500">
          <Plus className="h-4 w-4 mr-1" />
          Offline Booking
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Bookings" value={stats.total_bookings} icon={<Calendar className="h-5 w-5" />} color="blue" />
          <StatCard title="Confirmed" value={stats.confirmed_bookings} icon={<CheckCircle className="h-5 w-5" />} color="green" />
          <StatCard title="Total Revenue" value={`₹${stats.total_revenue?.toLocaleString() || 0}`} icon={<DollarSign className="h-5 w-5" />} color="emerald" />
          <StatCard title="Pending Payments" value={`₹${stats.pending_payments?.toLocaleString() || 0}`} icon={<Briefcase className="h-5 w-5" />} color="yellow" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-900 border border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="slots">Slots</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="staff">Staff Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <h2 className="text-xl font-bold mb-4">Your Grounds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grounds.map(g => (
              <Card key={g.id} className="border-white/10 bg-zinc-950/55">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-pink-400">{g.name}</h3>
                  <p className="text-white/50 text-sm">{g.location}</p>
                  <p className="text-white/70 text-sm mt-2">Price: ₹{g.price_per_hour}/hour</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="slots" className="mt-4">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Ground</Label>
              <Select value={selectedGround} onValueChange={setSelectedGround}>
                <SelectTrigger className="bg-black/40 border-white/10 mt-1">
                  <SelectValue placeholder="Select ground" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {grounds.map(g => (
                    <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-black/40 border-white/10 mt-1"
              />
            </div>
            <Button onClick={loadSlots} className="mt-6 bg-blue-500/20 text-blue-300">
              <Search className="h-4 w-4 mr-1" /> Load Slots
            </Button>
          </div>

          {loadingSlots ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-white/50">No slots found for this date.</div>
          ) : (
            <div className="space-y-6">
              {slots.map(slot => (
                <Card key={slot.id} className="border-white/10 bg-zinc-950/55">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-bold">{slot.start_time} – {slot.end_time}</h3>
                      <Badge className={slot.status === "available" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {slot.status}
                      </Badge>
                    </div>
                    <p className="text-pink-400 font-semibold">₹{slot.price} per team</p>
                    <p className="text-white/50 text-sm">Teams: {slot.teams_booked_count || 0} / {slot.max_teams || 2}</p>
                    {slot.bookings && slot.bookings.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="font-semibold">Bookings:</p>
                        {slot.bookings.map((booking, idx) => (
                          <div key={booking.id} className="border-t border-white/10 pt-2">
                            <p className="text-sm"><span className="text-pink-400">Team {idx+1}:</span> {booking.user?.name} ({booking.user?.phone})</p>
                            <div className="flex gap-2 mt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setPaymentForm({ amount: booking.total_price, status: booking.payment_status, notes: "" });
                                  setShowPaymentDialog(true);
                                }}
                                className="border-blue-500/30 text-blue-300"
                              >
                                Payment
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowStaffDialog(true);
                                }}
                                className="border-violet-500/30 text-violet-300"
                              >
                                Staff
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="mt-4">
          <div className="space-y-3">
            {bookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onUpdatePayment={() => {
                  setSelectedBooking(booking);
                  setPaymentForm({ amount: booking.total_price, status: booking.payment_status, notes: "" });
                  setShowPaymentDialog(true);
                }}
                onUpdateStaff={() => {
                  setSelectedBooking(booking);
                  setShowStaffDialog(true);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <div className="space-y-3">
            {bookings.filter(b => b.payment_status !== "paid").map(booking => (
              <PaymentCard key={booking.id} booking={booking} onUpdatePayment={() => {
                setSelectedBooking(booking);
                setPaymentForm({ amount: booking.total_price, status: "paid", notes: "" });
                setShowPaymentDialog(true);
              }} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <div className="space-y-3">
            {bookings.map(booking => (
              <StaffPaymentCard
                key={booking.id}
                booking={booking}
                onUpdate={() => {
                  setSelectedBooking(booking);
                  setShowStaffDialog(true);
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Update Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="bg-black/40 border-white/10"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={paymentForm.status} onValueChange={(val) => setPaymentForm({ ...paymentForm, status: val })}>
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="bg-black/40 border-white/10"
              />
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
          <DialogHeader>
            <DialogTitle>Update Staff Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Staff Type</Label>
              <Select value={staffForm.staff_type} onValueChange={(val) => setStaffForm({ ...staffForm, staff_type: val })}>
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="umpire">Umpire</SelectItem>
                  <SelectItem value="groundsman">Groundsman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                className="bg-black/40 border-white/10"
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={staffForm.amount}
                onChange={(e) => setStaffForm({ ...staffForm, amount: e.target.value })}
                className="bg-black/40 border-white/10"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={staffForm.status} onValueChange={(val) => setStaffForm({ ...staffForm, status: val })}>
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Paid By (Team/Captain)</Label>
              <Input
                value={staffForm.paid_by}
                onChange={(e) => setStaffForm({ ...staffForm, paid_by: e.target.value })}
                className="bg-black/40 border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowStaffDialog(false)}>Cancel</Button>
            <Button onClick={updateStaffPayment} className="bg-emerald-500">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offline Booking Dialog */}
      <Dialog open={showOfflineBookingDialog} onOpenChange={setShowOfflineBookingDialog}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offline Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ground</Label>
              <Select value={offlineBookingForm.ground_id} onValueChange={handleOfflineGroundChange}>
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue placeholder="Select ground" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {grounds.map(g => (
                    <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={offlineBookingForm.booking_date}
                onChange={(e) => handleOfflineDateChange(e.target.value)}
                className="bg-black/40 border-white/10"
              />
            </div>
            {offlineBookingForm.slots && offlineBookingForm.slots.length > 0 && (
              <div>
                <Label>Slot</Label>
                <Select value={offlineBookingForm.slot_id} onValueChange={(val) => handleOfflineFormChange("slot_id", val)}>
                  <SelectTrigger className="bg-black/40 border-white/10">
                    <SelectValue placeholder="Select slot" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {offlineBookingForm.slots.map(slot => (
                      <SelectItem key={slot.id} value={slot.id.toString()}>
                        {slot.start_time} - {slot.end_time} (₹{slot.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Match Type</Label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="with_opponents"
                    checked={offlineBookingForm.match_type === "with_opponents"}
                    onChange={() => handleOfflineFormChange("match_type", "with_opponents")}
                  />
                  With Opponents (2 teams)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="without_opponents"
                    checked={offlineBookingForm.match_type === "without_opponents"}
                    onChange={() => handleOfflineFormChange("match_type", "without_opponents")}
                  />
                  Without Opponents (1 team)
                </label>
              </div>
            </div>
            {offlineBookingForm.slot_id && (
              <div className="space-y-4">
                {offlineBookingForm.users.map((team, idx) => (
                  <div key={idx} className="border border-white/10 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-pink-400">Team {idx + 1}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Name"
                        value={team.name}
                        onChange={(e) => handleTeamChange(idx, "name", e.target.value)}
                        className="bg-black/40 border-white/10"
                      />
                      <Input
                        placeholder="Phone"
                        value={team.phone}
                        onChange={(e) => handleTeamChange(idx, "phone", e.target.value)}
                        className="bg-black/40 border-white/10"
                      />
                      <Input
                        placeholder="Email / WhatsApp"
                        value={team.email}
                        onChange={(e) => handleTeamChange(idx, "email", e.target.value)}
                        className="bg-black/40 border-white/10"
                      />
                      <Input
                        type="number"
                        placeholder="Payment Amount"
                        value={team.payment_amount}
                        onChange={(e) => handleTeamChange(idx, "payment_amount", e.target.value)}
                        className="bg-black/40 border-white/10"
                      />
                      <Select
                        value={team.payment_status}
                        onValueChange={(val) => handleTeamChange(idx, "payment_status", val)}
                      >
                        <SelectTrigger className="bg-black/40 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                <div className="border border-white/10 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-pink-400">Umpire Payment</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Umpire Name"
                      value={offlineBookingForm.umpire_name}
                      onChange={(e) => handleOfflineFormChange("umpire_name", e.target.value)}
                      className="bg-black/40 border-white/10"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={offlineBookingForm.umpire_amount}
                      onChange={(e) => handleOfflineFormChange("umpire_amount", e.target.value)}
                      className="bg-black/40 border-white/10"
                    />
                    <Select
                      value={offlineBookingForm.umpire_paid}
                      onValueChange={(val) => handleOfflineFormChange("umpire_paid", val)}
                    >
                      <SelectTrigger className="bg-black/40 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Paid By (Team/Captain)"
                      value={offlineBookingForm.umpire_paid_by}
                      onChange={(e) => handleOfflineFormChange("umpire_paid_by", e.target.value)}
                      className="bg-black/40 border-white/10"
                    />
                  </div>
                </div>
                <Button
                  onClick={createOfflineBooking}
                  className="w-full bg-emerald-500"
                >
                  Create Booking
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper Components (same as before)
function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    yellow: "bg-yellow-500/20 text-yellow-400"
  };
  return (
    <Card className="border-white/10 bg-zinc-950/55">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-white/50">{title}</p>
          </div>
          <div className={`p-2 rounded-xl ${colors[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingCard({ booking, onUpdatePayment, onUpdateStaff }) {
  return (
    <Card className="border-white/10 bg-zinc-950/55">
      <CardContent className="p-4">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-pink-400">{booking.ground?.name}</h3>
            <p className="text-white/50 text-sm">{booking.booking_date} • {booking.slot?.start_time} - {booking.slot?.end_time}</p>
            <p className="text-white/70 text-sm mt-1">User: {booking.user?.name} ({booking.user?.phone})</p>
            <p className="text-emerald-400 font-semibold mt-1">₹{booking.total_price}</p>
          </div>
          <div>
            <Badge className={booking.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
              {booking.status}
            </Badge>
            <Badge className={booking.payment_status === "paid" ? "bg-green-500/20 text-green-400 ml-2" : "bg-red-500/20 text-red-400 ml-2"}>
              {booking.payment_status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={onUpdatePayment} className="bg-blue-500/20 text-blue-300">
            Payment
          </Button>
          <Button size="sm" onClick={onUpdateStaff} className="bg-violet-500/20 text-violet-300">
            Staff
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentCard({ booking, onUpdatePayment }) {
  return (
    <Card className="border-white/10 bg-zinc-950/55">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold">{booking.ground?.name}</h3>
            <p className="text-white/50 text-sm">{booking.booking_date}</p>
            <p className="text-emerald-400 font-semibold">₹{booking.total_price}</p>
          </div>
          <Button size="sm" onClick={onUpdatePayment} className="bg-emerald-500/20 text-emerald-300">
            Mark Paid
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StaffPaymentCard({ booking, onUpdate }) {
  return (
    <Card className="border-white/10 bg-zinc-950/55">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold">{booking.ground?.name}</h3>
            <p className="text-white/50 text-sm">{booking.booking_date}</p>
            <p className="text-white/70 text-sm">Umpire: {booking.umpire_name || "Not assigned"}</p>
            <p className="text-white/70 text-sm">Groundsman: {booking.groundsman_name || "Not assigned"}</p>
          </div>
          <Button size="sm" onClick={onUpdate} className="bg-violet-500/20 text-violet-300">
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}