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

      const requestedBy = user?.name
        ? `${user.name} (${user.email || "no email"})`
        : user?.email || "User";

      const adminNumber = String(ground.admin_phone).replace(/\D/g, "");

      const message = `Hello ${ground.admin_name || "Admin"},

Ground Booking Request

Ground: ${ground.name}
Location: ${ground.location}
Date: ${selectedDate}
Time: ${selectedSession.start_time} - ${selectedSession.end_time}
Price: ₹${selectedSession.price}
Match Type: ${formatMatchType()}

Requested by:
${requestedBy}

Please confirm availability.`;

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
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <p className="text-white/70">Loading ground...</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 lg:px-20 py-10">

      {/* Back button */}
      <Button
        onClick={() => navigate("/grounds")}
        className="mb-6 bg-white/10 text-white hover:bg-white/15"
      >
        ← Back to Grounds
      </Button>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      <Card className="bg-zinc-900 border border-white/10 mb-8">
        <CardContent className="p-6">
          <img
            src={ground.image_url}
            alt={ground.name}
            className="w-full h-80 object-cover rounded-xl mb-5"
          />
          <h1 className="text-4xl font-bold mb-2">{ground.name}</h1>
          <p className="text-white/70 mb-2">Location: {ground.location}</p>
          <p className="text-white/70 mb-2">Timings: {ground.opening_time} - {ground.closing_time}</p>
          <p className="text-white/70 mb-2">Amenities: {ground.amenities}</p>
          <p className="text-white/70 text-sm">Ground Owner: {ground.admin_name || "Not set"}</p>
          <p className="text-white/70 text-sm">WhatsApp: {ground.admin_phone || "Not set"}</p>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Select Match Date</h2>
      <div className="mb-8">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-white"
        />
      </div>

      <h2 className="text-2xl font-bold mb-4">Available Match Sessions</h2>

      {slotError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {slotError}
        </div>
      )}

      {!selectedDate ? (
        <p className="text-white/70 mb-10">Please select a date to see slots.</p>
      ) : loadingSlots ? (
        <p className="text-white/70 mb-10">Loading slots...</p>
      ) : slots.length === 0 ? (
        <p className="text-white/70 mb-10">No slots available for this date.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mb-10">
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
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">
                    {session.start_time} - {session.end_time}
                  </h3>
                  <p className="text-white/70">Date: {session.slot_date}</p>
                  <p className="text-pink-400 font-semibold mt-2">₹{session.price} per team</p>
                  <p className="text-white/70 mt-2">
                    Teams: {session.teams_booked_count || 0} / {session.max_teams || 2}
                  </p>
                  <p className={`mt-2 font-medium ${
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

      <h2 className="text-2xl font-bold mb-4">Match Type</h2>
      <div className="space-y-3 mb-10">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="match"
            value="with_opponents"
            checked={matchType === "with_opponents"}
            onChange={(e) => setMatchType(e.target.value)}
          />
          Ground Needed With Opponents
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="match"
            value="without_opponents"
            checked={matchType === "without_opponents"}
            onChange={(e) => setMatchType(e.target.value)}
          />
          Ground Needed Without Opponents
        </label>
      </div>

       {selectedSession && (
  <Card className="bg-zinc-900 border border-white/10 mb-8">
    <CardContent className="p-5">
      <h3 className="text-xl font-bold mb-2 text-pink-400">Selected Session</h3>
      <p className="text-white/80">{selectedSession.start_time} - {selectedSession.end_time}</p>
      <p className="text-white/70">Date: {selectedSession.slot_date}</p>
      <p className="text-white/70">
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

      <Button
        onClick={handleWhatsAppBooking}
        disabled={bookingLoading}
        className="bg-green-500 hover:bg-green-600 text-black font-bold text-lg px-8 py-4"
      >
        {bookingLoading ? "Creating request..." : "Book via WhatsApp"}
      </Button>
    </div>
  );
}