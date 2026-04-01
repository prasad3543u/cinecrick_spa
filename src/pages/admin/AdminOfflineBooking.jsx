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
  MapPin, Clock, Shield, User, Phone, Loader2, 
  Calendar as CalendarIcon, CheckCircle, Users, DollarSign, Briefcase
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
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");

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
      setLoadingSlots(true);
      setSelectedSlot(null);
      setSlotError("");
      const data = await api(`/slots?ground_id=${selectedGround.id}&slot_date=${selectedDate}`);
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      setSlotError("Failed to load slots. Please try again.");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleSelectSlot(slot) {
    if (slot.status?.toLowerCase() === "booked") {
      setSlotError("This slot is already booked. Please choose another.");
      return;
    }
    if (slot.status?.toLowerCase() === "pending") {
      setSlotError("This slot is pending confirmation. Please choose another.");
      return;
    }
    setSlotError("");
    setSelectedSlot(slot);
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
      toast.error("Please select a time slot");
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
      // Reset everything except grounds list
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

  function calculateTotalPrice() {
    return teams.reduce((sum, t) => sum + (parseFloat(t.payment_amount) || 0), 0);
  }

  // Helper to format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  if (!selectedGround && grounds.length === 0) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 lg:px-20 py-6 sm:py-10">

      <Button
        onClick={() => navigate("/admin/dashboard")}
        className="mb-5 bg-white/10 text-white hover:bg-white/15"
      >
        ← Back to Dashboard
      </Button>

      {/* Ground Selector */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Select Ground</h2>
        <Select
          value={selectedGround?.id?.toString()}
          onValueChange={(val) => {
            const ground = grounds.find(g => g.id.toString() === val);
            setSelectedGround(ground);
          }}
        >
          <SelectTrigger className="bg-black/40 border-white/10">
            <SelectValue placeholder="Choose a ground" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            {grounds.map(g => (
              <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedGround && (
        <>
          {/* Ground Info Card */}
          <Card className="bg-zinc-900 border border-white/10 mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="relative h-48 sm:h-64">
                <img
                  src={selectedGround.image_url}
                  alt={selectedGround.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-2xl sm:text-3xl font-bold">{selectedGround.name}</h1>
                  <div className="flex flex-wrap gap-2 text-sm text-white/70 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-pink-400" /> {selectedGround.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-violet-400" /> {selectedGround.opening_time} - {selectedGround.closing_time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  <span>{selectedGround.amenities || "Not listed"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-400" />
                  <span>{selectedGround.admin_name || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-yellow-400" />
                  <span>{selectedGround.admin_phone || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-pink-400" />
                  <span>₹{selectedGround.price_per_hour}/hour</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <h2 className="text-xl font-bold mb-3">Select Date</h2>
          <div className="mb-6">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-white"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Available Slots */}
          <h2 className="text-xl font-bold mb-3">Available Slots</h2>

          {slotError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
              {slotError}
            </div>
          )}

          {!selectedDate ? (
            <p className="text-white/70 mb-8 text-sm">Please select a date to see slots.</p>
          ) : loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              <span className="ml-2 text-white/70">Loading slots...</span>
            </div>
          ) : slots.length === 0 ? (
            <p className="text-white/70 mb-8 text-sm">No slots available for this date.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {slots.map((slot) => {
                let statusText = "Available";
                let isDisabled = false;
                if (slot.status?.toLowerCase() === "booked") {
                  statusText = "Booked";
                  isDisabled = true;
                } else if (slot.status?.toLowerCase() === "pending") {
                  statusText = "Pending Confirmation";
                  isDisabled = true;
                } else if (Number(slot.teams_booked_count || 0) === 1) {
                  statusText = "Available (1 team joined)";
                }

                const isSelected = selectedSlot?.id === slot.id;

                return (
                  <Card
                    key={slot.id}
                    className={`cursor-pointer border bg-zinc-900 transition ${
                      isSelected ? "border-pink-500 ring-2 ring-pink-500/50" : "border-white/10"
                    } ${isDisabled ? "opacity-60 cursor-not-allowed" : "hover:border-pink-400"}`}
                    onClick={() => !isDisabled && handleSelectSlot(slot)}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold mb-2">
                        {slot.start_time} - {slot.end_time}
                      </h3>
                      <p className="text-white/70 text-sm">Date: {slot.slot_date}</p>
                      <p className="text-pink-400 font-semibold mt-1">₹{slot.price} per team</p>
                      <p className="text-white/70 mt-1 text-sm">
                        Teams: {slot.teams_booked_count || 0} / {slot.max_teams || 2}
                      </p>
                      <p className={`mt-1 font-medium text-sm ${
                        isDisabled ? "text-red-400" : "text-green-400"
                      }`}>
                        {statusText}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Match Type */}
          {selectedSlot && (
            <>
              <h2 className="text-xl font-bold mb-3">Match Type</h2>
              <div className="space-y-3 mb-8">
                <label className="flex items-center gap-3 cursor-pointer text-sm sm:text-base">
                  <input
                    type="radio"
                    name="match"
                    value="with_opponents"
                    checked={matchType === "with_opponents"}
                    onChange={(e) => setMatchType(e.target.value)}
                    className="h-4 w-4 accent-pink-500"
                  />
                  Ground Needed With Opponents
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm sm:text-base">
                  <input
                    type="radio"
                    name="match"
                    value="without_opponents"
                    checked={matchType === "without_opponents"}
                    onChange={(e) => setMatchType(e.target.value)}
                    className="h-4 w-4 accent-pink-500"
                  />
                  Ground Needed Without Opponents
                </label>
              </div>
            </>
          )}

          {/* Selected Slot Summary */}
          {selectedSlot && (
            <Card className="bg-zinc-900 border border-white/10 mb-6">
              <CardContent className="p-4 sm:p-5">
                <h3 className="text-lg font-bold mb-2 text-pink-400">Selected Session</h3>
                <p className="text-white/80 text-sm">{selectedSlot.start_time} - {selectedSlot.end_time}</p>
                <p className="text-white/70 text-sm">Date: {selectedSlot.slot_date}</p>
                <p className="text-white/70 text-sm">
                  Price: ₹{selectedSlot.price} per team
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {matchType === "without_opponents"
                    ? "Full ground booking (single team)"
                    : "Two teams will be booked"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Offline Booking Form */}
          {selectedSlot && (
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-pink-500/30">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-pink-400 mb-4">Offline Booking Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Team Details */}
                  <div className="space-y-4">
                    {teams.map((team, idx) => (
                      <div key={idx} className="border border-white/10 rounded-lg p-4 space-y-3">
                        <p className="font-semibold text-pink-400">Team {idx + 1}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Name</Label>
                            <Input
                              placeholder="Team / Captain Name"
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
                            <Label>Email / WhatsApp</Label>
                            <Input
                              placeholder="Email (or WhatsApp number)"
                              value={team.email}
                              onChange={(e) => handleTeamChange(idx, "email", e.target.value)}
                              className="bg-black/40 border-white/10 mt-1"
                            />
                          </div>
                          <div>
                            <Label>Amount Paid (₹)</Label>
                            <Input
                              type="number"
                              placeholder="Amount"
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
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Umpire Payment */}
                  <div className="space-y-3">
                    <p className="font-semibold text-pink-400">Umpire Payment</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Umpire Name</Label>
                        <Input
                          placeholder="Umpire name"
                          value={umpire.name}
                          onChange={(e) => handleUmpireChange("name", e.target.value)}
                          className="bg-black/40 border-white/10 mt-1"
                        />
                      </div>
                      <div>
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={umpire.amount}
                          onChange={(e) => handleUmpireChange("amount", e.target.value)}
                          className="bg-black/40 border-white/10 mt-1"
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={umpire.status}
                          onValueChange={(val) => handleUmpireChange("status", val)}
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
                          placeholder="Who paid?"
                          value={umpire.paid_by}
                          onChange={(e) => handleUmpireChange("paid_by", e.target.value)}
                          className="bg-black/40 border-white/10 mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount Collected</span>
                      <span className="text-pink-400">₹{calculateTotalPrice()}</span>
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
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}