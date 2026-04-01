import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Users, Calendar, Clock, DollarSign, Briefcase, User, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export default function AdminOfflineBooking() {
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ground_id: "",
    slot_id: "",
    booking_date: "",
    match_type: "with_opponents",
    users: [
      { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" },
      { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
    ],
    umpire_paid: "pending",
    umpire_name: "",
    umpire_amount: "",
    umpire_paid_by: ""
  });
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    loadGrounds();
  }, []);

  useEffect(() => {
    if (form.ground_id && form.booking_date) {
      loadSlots();
    }
  }, [form.ground_id, form.booking_date]);

  async function loadGrounds() {
    try {
      const data = await api("/grounds");
      setGrounds(data);
    } catch (err) {
      toast.error("Failed to load grounds");
    }
  }

  async function loadSlots() {
    try {
      const data = await api(`/slots?ground_id=${form.ground_id}&slot_date=${form.booking_date}`);
      setSlots(data);
    } catch (err) {
      toast.error("Failed to load slots");
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleTeamChange(index, field, value) {
    const newUsers = [...form.users];
    newUsers[index][field] = value;
    setForm({ ...form, users: newUsers });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/admin/offline_bookings", {
        method: "POST",
        body: form
      });
      toast.success("Offline booking created successfully");
      // Reset form
      setForm({
        ground_id: "",
        slot_id: "",
        booking_date: "",
        match_type: "with_opponents",
        users: [
          { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" },
          { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
        ],
        umpire_paid: "pending",
        umpire_name: "",
        umpire_amount: "",
        umpire_paid_by: ""
      });
      setSlots([]);
    } catch (err) {
      toast.error(err?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  // Adjust number of teams based on match type
  useEffect(() => {
    if (form.match_type === "with_opponents") {
      setForm(prev => ({
        ...prev,
        users: [
          { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" },
          { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
        ]
      }));
    } else {
      setForm(prev => ({
        ...prev,
        users: [
          { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
        ]
      }));
    }
  }, [form.match_type]);

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Button
          onClick={() => navigate("/admin/dashboard")}
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-pink-400">Offline Booking</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {/* Selection Card */}
        <Card className="border-white/10 bg-zinc-950/55">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Ground</Label>
                <Select
                  value={form.ground_id}
                  onValueChange={(val) => setForm({ ...form, ground_id: val, slot_id: "" })}
                >
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
                  name="booking_date"
                  value={form.booking_date}
                  onChange={handleChange}
                  className="bg-black/40 border-white/10 mt-1"
                />
              </div>
              {form.ground_id && form.booking_date && (
                <div>
                  <Label>Slot</Label>
                  <Select value={form.slot_id} onValueChange={(val) => setForm({ ...form, slot_id: val })}>
                    <SelectTrigger className="bg-black/40 border-white/10 mt-1">
                      <SelectValue placeholder="Select slot" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      {slots.map(slot => (
                        <SelectItem key={slot.id} value={slot.id.toString()}>
                          {slot.start_time} - {slot.end_time} (₹{slot.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.slot_id && (
                <div>
                  <Label>Match Type</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="with_opponents"
                        checked={form.match_type === "with_opponents"}
                        onChange={() => setForm({ ...form, match_type: "with_opponents" })}
                      />
                      With Opponents (2 teams)
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="without_opponents"
                        checked={form.match_type === "without_opponents"}
                        onChange={() => setForm({ ...form, match_type: "without_opponents" })}
                      />
                      Without Opponents (1 team)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Cards */}
        {form.slot_id && (
          <div className="space-y-6">
            {form.users.map((team, idx) => (
              <Card key={idx} className="border-white/10 bg-zinc-950/55">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-pink-400" />
                    <h2 className="text-lg font-semibold">Team {idx + 1}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        placeholder="Captain / Team Name"
                        value={team.name}
                        onChange={(e) => handleTeamChange(idx, "name", e.target.value)}
                        className="bg-black/40 border-white/10 mt-1"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        placeholder="Phone"
                        value={team.phone}
                        onChange={(e) => handleTeamChange(idx, "phone", e.target.value)}
                        className="bg-black/40 border-white/10 mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>WhatsApp / Email</Label>
                      <Input
                        placeholder="Email (or WhatsApp number)"
                        value={team.email}
                        onChange={(e) => handleTeamChange(idx, "email", e.target.value)}
                        className="bg-black/40 border-white/10 mt-1"
                      />
                    </div>
                    <div>
                      <Label>Payment Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="Amount paid"
                        value={team.payment_amount}
                        onChange={(e) => handleTeamChange(idx, "payment_amount", e.target.value)}
                        className="bg-black/40 border-white/10 mt-1"
                      />
                    </div>
                    <div>
                      <Label>Payment Status</Label>
                      <Select
                        value={team.payment_status}
                        onValueChange={(val) => handleTeamChange(idx, "payment_status", val)}
                      >
                        <SelectTrigger className="bg-black/40 border-white/10 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Umpire Payment Card */}
        {form.slot_id && (
          <Card className="border-white/10 bg-zinc-950/55">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-pink-400" />
                <h2 className="text-lg font-semibold">Umpire Payment</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Umpire Name</Label>
                  <Input
                    name="umpire_name"
                    value={form.umpire_name}
                    onChange={handleChange}
                    placeholder="Umpire name"
                    className="bg-black/40 border-white/10 mt-1"
                  />
                </div>
                <div>
                  <Label>Amount (₹)</Label>
                  <Input
                    name="umpire_amount"
                    type="number"
                    value={form.umpire_amount}
                    onChange={handleChange}
                    placeholder="Amount"
                    className="bg-black/40 border-white/10 mt-1"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={form.umpire_paid}
                    onValueChange={(val) => setForm({ ...form, umpire_paid: val })}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 mt-1">
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
                    name="umpire_paid_by"
                    value={form.umpire_paid_by}
                    onChange={handleChange}
                    placeholder="Who paid?"
                    className="bg-black/40 border-white/10 mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        {form.slot_id && (
          <Button
            type="submit"
            disabled={loading || !form.slot_id || form.users.some(u => !u.name || !u.phone || !u.email || !u.payment_amount)}
            className="w-full bg-emerald-500"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Offline Booking
          </Button>
        )}
      </form>
    </div>
  );
}