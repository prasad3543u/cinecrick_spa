import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GroundDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ground, setGround] = useState(null);
  const [user, setUser] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [matchType, setMatchType] = useState("with_opponents");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [slotError, setSlotError] = useState("");

  useEffect(() => {
    loadGround();
    loadUser();
  }, [id]);

  useEffect(() => {
    if (selectedDate) loadSlotsByDate(selectedDate);
  }, [selectedDate]);

  async function loadGround() {
    try {
      const data = await api(`/grounds/${id}`);
      setGround(data);
    } catch (err) {
      setError("Failed to load ground details.");
    }
  }

  async function loadUser() {
    try {
      const data = await api("/me");
      setUser(data.user);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadSlotsByDate(date) {
    try {
      setLoadingSlots(true);
      setSelectedSession(null);
      setSlotError("");
      const data = await api(`/slots?ground_id=${id}&slot_date=${date}`);
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      setSlotError("Failed to load slots. Please try again.");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleSelectSession(session) {
    if (session.status?.toLowerCase() === "booked") {
      setSlotError("This slot is already booked. Please choose another.");
      return;
    }
    setSlotError("");
    setSelectedSession(session);
  }

  function formatMatchType() {
    return matchType === "with_opponents"
      ? "Ground Needed With Opponents"
      : "Ground Needed Without Opponents";
  }

  async function handleWhatsAppBooking() {
    setError("");
    if (!selectedDate) { setError("Please select a date first."); return; }
    if (!selectedSession) { setError("Please select a session first."); return; }
    if (!ground?.admin_phone) { setError("Ground owner WhatsApp number is not set."); return; }

    try {
      setBookingLoading(true);

      await api("/bookings", {
        method: "POST",
        body: {
          ground_id: ground.id,
          slot_id: selectedSession.id,
          booking_date: selectedSession.slot_date,
          total_price: selectedSession.price,
          match_type: matchType,
        },
      });

      const adminNumber = String(ground.admin_phone).replace(/\D/g, "");
      const message = `Hello ${ground.admin_name || "Admin"},

🏏 Ground Booking Request

Ground: ${ground.name}
Location: ${ground.location}
Date: ${selectedDate}
Time: ${selectedSession.start_time} - ${selectedSession.end_time}
Price: ₹${matchType === "without_opponents" ? selectedSession.price * 2 : selectedSession.price}
Match Type: ${formatMatchType()}

Requested by:
Name: ${user?.name || "User"}
Email: ${user?.email || ""}

⚠️ Please share your payment details for advance payment to confirm this booking.

Note: Cancellation after confirmation — No refund.`;

      const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
      await loadSlotsByDate(selectedDate);
      window.open(url, "_blank");
    } catch (err) {
      setError(err.message || "Failed to create booking request.");
    } finally {
      setBookingLoading(false);
    }
  }

  if (!ground) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        {error ? <p className="text-red-400">{error}</p> : <p className="text-white/70">Loading ground...</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 lg:px-20 py-6">

      <Button
        onClick={() => navigate("/grounds")}
        className="mb-5 bg-white/10 text-white hover:bg-white/15 text-sm"
      >
        ← Back to Grounds
      </Button>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Ground Info Card */}
      <Card className="bg-zinc-900 border border-white/10 mb-6">
        <CardContent className="p-4 sm:p-6">
          <img
            src={ground.image_url}
            alt={ground.name}
            className="w-full h-48 sm:h-72 object-cover rounded-xl mb-4"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600";
            }}
          />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{ground.name}</h1>
          <div className="space-y-1 text-sm text-white/70">
            <p>Location: {ground.location}</p>
            <p>Timings: {ground.opening_time} - {ground.closing_time}</p>
            <p>Amenities: {ground.amenities}</p>
            <p>Ground Owner: {ground.admin_name || "Not set"}</p>
            <p>WhatsApp: {ground.admin_phone || "Not set"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Date Picker */}
      <h2 className="text-xl sm:text-2xl font-bold mb-3">Select Match Date</h2>
      <div className="mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full sm:w-auto rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-white text-sm"
        />
      </div>

      {/* Slots */}
      <h2 className="text-xl sm:text-2xl font-bold mb-3">Available Match Sessions</h2>

      {slotError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {slotError}
        </div>
      )}

      {!selectedDate ? (
        <p className="text-white/70 mb-8 text-sm">Please select a date to see slots.</p>
      ) : loadingSlots ? (
        <p className="text-white/70 mb-8 text-sm">Loading slots...</p>
      ) : slots.length === 0 ? (
        <p className="text-white/70 mb-8 text-sm">No slots available for this date.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {slots.map((session) => {
            let statusText = "Available";
            if (session.status?.toLowerCase() === "booked") {
              statusText = "Booked";
            } else if (Number(session.teams_booked_count || 0) === 1) {
              statusText = "Available (1 team joined)";
            }

            const isSelected = selectedSession?.id === session.id;
            const isBooked = statusText === "Booked";

            return (
              <Card
                key={session.id}
                className={`cursor-pointer border bg-zinc-900 transition ${
                  isSelected ? "border-pink-500" : "border-white/10"
                } ${isBooked ? "opacity-80 cursor-not-allowed" : "hover:border-pink-400"}`}
                onClick={() => handleSelectSession(session)}
              >
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-1">
                    {session.start_time} - {session.end_time}
                  </h3>
                  <p className="text-white/70 text-sm">Date: {session.slot_date}</p>
                  <p className="text-pink-400 font-semibold mt-1 text-sm">₹{session.price} per team</p>
                  <p className="text-white/70 mt-1 text-sm">
                    Teams: {session.teams_booked_count || 0} / {session.max_teams || 2}
                  </p>
                  <p className={`mt-1 font-medium text-sm ${
                    statusText === "Booked" ? "text-red-400" : "text-green-400"
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
      <h2 className="text-xl sm:text-2xl font-bold mb-3">Match Type</h2>
      <div className="space-y-3 mb-8">
        <label className="flex items-center gap-3 cursor-pointer text-sm sm:text-base">
          <input
            type="radio"
            name="match"
            value="with_opponents"
            checked={matchType === "with_opponents"}
            onChange={(e) => setMatchType(e.target.value)}
            className="accent-pink-500"
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
            className="accent-pink-500"
          />
          Ground Needed Without Opponents
        </label>
      </div>

      {/* Selected Session Summary */}
      {selectedSession && (
        <Card className="bg-zinc-900 border border-white/10 mb-6">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold mb-2 text-pink-400">Selected Session</h3>
            <p className="text-white/80 text-sm">{selectedSession.start_time} - {selectedSession.end_time}</p>
            <p className="text-white/70 text-sm">Date: {selectedSession.slot_date}</p>
            <p className="text-white/70 text-sm">
              Price: ₹{matchType === "without_opponents"
                ? selectedSession.price * 2
                : selectedSession.price}
              {matchType === "without_opponents" && (
                <span className="ml-2 text-xs text-yellow-400">(Full ground — 2x price)</span>
              )}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {matchType === "without_opponents"
                ? "You are booking the entire ground for yourself."
                : "You are booking one team slot. Another team can join."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Book Button */}
      <Button
        onClick={handleWhatsAppBooking}
        disabled={bookingLoading}
        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-black font-bold text-base px-8 py-4"
      >
        {bookingLoading ? "Creating request..." : "Book via WhatsApp"}
      </Button>
    </div>
  );
}