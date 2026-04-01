import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Clock, Calendar, Users, DollarSign, 
  Briefcase, User, Phone, Mail, Loader2, ArrowLeft 
} from "lucide-react";
import { toast } from "sonner";

export default function AdminOfflineBooking() {
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [selectedGround, setSelectedGround] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [matchType, setMatchType] = useState("with_opponents");
  const [teams, setTeams] = useState([
    { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" },
    { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
  ]);
  const [umpire, setUmpire] = useState({
    name: "",
    amount: "",
    status: "pending",
    paid_by: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGrounds();
  }, []);

  useEffect(() => {
    if (selectedGround && selectedDate) {
      loadSlots();
    }
  }, [selectedGround, selectedDate]);

  // Adjust teams based on match type
  useEffect(() => {
    if (matchType === "with_opponents") {
      setTeams([
        { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" },
        { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
      ]);
    } else {
      setTeams([
        { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
      ]);
    }
  }, [matchType]);

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
      const data = await api(`/slots?ground_id=${selectedGround.id}&slot_date=${selectedDate}`);
      setSlots(data);
      setSelectedSlot(null);
    } catch (err) {
      toast.error("Failed to load slots");
    }
  }

  function handleTeamChange(index, field, value) {
    const newTeams = [...teams];
    newTeams[index][field] = value;
    setTeams(newTeams);
  }

  function handleUmpireChange(field, value) {
    setUmpire(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error("Please select a slot");
      return;
    }
    if (teams.some(t => !t.name || !t.phone || !t.email || !t.payment_amount)) {
      toast.error("Please fill all team details");
      return;
    }

    setLoading(true);
    try {
      await api("/admin/offline_bookings", {
        method: "POST",
        body: {
          ground_id: selectedGround.id,
          slot_id: selectedSlot.id,
          booking_date: selectedDate,
          match_type: matchType,
          users: teams,
          umpire_name: umpire.name,
          umpire_amount: umpire.amount,
          umpire_paid: umpire.status,
          umpire_paid_by: umpire.paid_by
        }
      });
      toast.success("Offline booking(s) created successfully");
      // Reset form
      setSelectedGround(null);
      setSelectedDate("");
      setSlots([]);
      setSelectedSlot(null);
      setMatchType("with_opponents");
      setTeams([
        { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" },
        { name: "", phone: "", email: "", payment_amount: "", payment_status: "paid" }
      ]);
      setUmpire({ name: "", amount: "", status: "pending", paid_by: "" });
    } catch (err) {
      toast.error(err?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 lg:px-20 py-6 sm:py-10">
      
      {/* Back Button */}
      <Button
        onClick={() => navigate("/admin/dashboard")}
        className="mb-5 bg-white/10 text-white hover:bg-white/15"
      >
        ← Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN – Ground Info & Slot Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ground Selector Card */}
          <Card className="bg-zinc-900 border border-white/10">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-xl font-bold mb-4">Select Ground</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Ground</Label>
                  <Select
                    value={selectedGround?.id?.toString()}
                    onValueChange={(val) => {
                      const ground = grounds.find(g => g.id.toString() === val);
                      setSelectedGround(ground);
                    }}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 mt-1">
                      <SelectValue placeholder="Choose a ground" />
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
              </div>

              {selectedGround && (
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/70">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-pink-400" />
                    <span>{selectedGround.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-violet-400" />
                    <span>{selectedGround.opening_time} - {selectedGround.closing_time}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Slots */}
          {selectedGround && selectedDate && (
            <>
              <h2 className="text-xl font-bold">Available Slots</h2>
              {slots.length === 0 ? (
                <Card className="bg-zinc-900 border border-white/10">
                  <CardContent className="p-8 text-center text-white/50">
                    No slots available for this date.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slots.map((slot) => {
                    const taken = slot.teams_booked_count || 0;
                    const max = slot.max_teams || 2;
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <Card
                        key={slot.id}
                        className={`cursor-pointer border bg-zinc-900 transition ${
                          isSelected ? "border-pink-500 ring-2 ring-pink-500/50" : "border-white/10 hover:border-pink-400"
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <CardContent className="p-4">
                          <h3 className="text-lg font-bold mb-1">
                            {slot.start_time} – {slot.end_time}
                          </h3>
                          <p className="text-pink-400 font-semibold">₹{slot.price} per team</p>
                          <p className="text-white/50 text-sm mt-1">
                            Teams: {taken}/{max} • Available: {max - taken}
                          </p>
                          <Badge className={`mt-2 ${slot.status === "available" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {slot.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT COLUMN – Booking Form (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-pink-500/30">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-pink-400 mb-4">Offline Booking Form</h2>

                {!selectedSlot ? (
                  <div className="text-center py-8 text-white/50">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select a ground, date and slot to continue</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Match Type Toggle */}
                    <div>
                      <Label>Match Type</Label>
                      <div className="flex gap-4 mt-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="with_opponents"
                            checked={matchType === "with_opponents"}
                            onChange={() => setMatchType("with_opponents")}
                          />
                          With Opponents (2 teams)
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="without_opponents"
                            checked={matchType === "without_opponents"}
                            onChange={() => setMatchType("without_opponents")}
                          />
                          Without Opponents (1 team)
                        </label>
                      </div>
                    </div>

                    {/* Team Details */}
                    <div className="space-y-4">
                      {teams.map((team, idx) => (
                        <div key={idx} className="border border-white/10 rounded-lg p-3 space-y-2">
                          <p className="font-semibold text-pink-400">Team {idx + 1}</p>
                          <Input
                            placeholder="Team / Captain Name"
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
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="Payment Amount (₹)"
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
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Umpire Payment */}
                    <div className="space-y-3">
                      <p className="font-semibold text-pink-400">Umpire Payment</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Umpire Name"
                          value={umpire.name}
                          onChange={(e) => handleUmpireChange("name", e.target.value)}
                          className="bg-black/40 border-white/10"
                        />
                        <Input
                          type="number"
                          placeholder="Amount (₹)"
                          value={umpire.amount}
                          onChange={(e) => handleUmpireChange("amount", e.target.value)}
                          className="bg-black/40 border-white/10"
                        />
                        <Select
                          value={umpire.status}
                          onValueChange={(val) => handleUmpireChange("status", val)}
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
                          value={umpire.paid_by}
                          onChange={(e) => handleUmpireChange("paid_by", e.target.value)}
                          className="bg-black/40 border-white/10"
                        />
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount</span>
                        <span className="text-pink-400">
                          ₹{teams.reduce((sum, t) => sum + (parseFloat(t.payment_amount) || 0), 0)}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Offline Booking
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}