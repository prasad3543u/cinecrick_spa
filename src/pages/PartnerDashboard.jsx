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
import { Calendar, DollarSign, Users, Briefcase, Loader2, ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    loadDashboard();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Bookings" value={stats.total_bookings} icon={<Calendar className="h-5 w-5" />} color="blue" />
          <StatCard title="Confirmed" value={stats.confirmed_bookings} icon={<Users className="h-5 w-5" />} color="green" />
          <StatCard title="Total Revenue" value={`₹${stats.total_revenue?.toLocaleString() || 0}`} icon={<DollarSign className="h-5 w-5" />} color="emerald" />
          <StatCard title="Pending Payments" value={`₹${stats.pending_payments?.toLocaleString() || 0}`} icon={<Briefcase className="h-5 w-5" />} color="yellow" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-900 border border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
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

        <TabsContent value="bookings" className="mt-4">
          <div className="space-y-3">
            {bookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onUpdatePayment={() => {
                  setSelectedBooking(booking);
                  setPaymentForm({ amount: booking.total_price, status: "paid", notes: "" });
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
                  setStaffForm({
                    staff_type: "umpire",
                    name: "",
                    amount: "",
                    status: "pending",
                    paid_by: ""
                  });
                  setShowStaffDialog(true);
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
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

      {/* Staff Payment Dialog */}
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
    </div>
  );
}

// Stat Card Component
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
        <div className="flex justify-between items-start">
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
            Staff Payment
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