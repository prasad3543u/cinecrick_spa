import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Shield, User, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRetry } from "../hooks/useRetry";

export default function GroundDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ground, setGround] = useState(null);
  const [user, setUser] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null); // FIX: Changed from selectedSession
  const [matchType, setMatchType] = useState("with_opponents");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingProgress, setBookingProgress] = useState(null);
  const [error, setError] = useState("");
  const [slotError, setSlotError] = useState("");

  // Initialize retry hook
  const { withRetry, retrying, retryCount } = useRetry(3, 1000);

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
      setSelectedSlot(null);
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

  function calculateTotalPrice() {
    if (!selectedSlot) return 0;
    return matchType === "without_opponents" 
      ? selectedSlot.price * 2 
      : selectedSlot.price;
  }

  async function handleBooking() {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    if (!matchType) {
      toast.error("Please select match type");
      return;
    }

    setBookingLoading(true);
    setBookingProgress("Creating your booking...");
    
    const toastId = toast.loading("Creating your booking...", {
      duration: Infinity,
    });

    try {
      const bookingData = {
        slot_id: selectedSlot.id,
        ground_id: ground.id,
        match_type: matchType,
      };

      setBookingProgress("Booking your slot...");
      
      // WRAP API CALL WITH RETRY LOGIC
      const result = await withRetry(
        async () => {
          return await api("/bookings", {
            method: "POST",
            body: bookingData,
            timeout: 30000,
          });
        },
        {
          retryMessage: "Booking taking longer than expected. Retrying...",
          successMessage: "Booking created successfully!",
          showToasts: true
        }
      );

      // Show retry count if it happened
      if (retryCount > 0) {
        toast.info(`Booking completed after ${retryCount} retry attempt(s)`, {
          duration: 3000,
        });
      }

      toast.loading("Booking created! Waiting for confirmation...", { id: toastId });
      setBookingProgress("Processing confirmation...");

      // Success!
      toast.success(
        `Booking created! ${matchType === "without_opponents" ? "You've booked both teams." : "Waiting for another team to join."}`,
        { id: toastId, duration: 5000 }
      );
      
      // Navigate to my bookings
      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);
      
    } catch (error) {
      console.error("Booking error:", error);
      
      let errorMessage = error.message || "Failed to create booking. Please try again.";
      
      // Provide specific guidance based on error
      if (errorMessage.includes("already booked")) {
        errorMessage = "This slot is already booked. Please select another time.";
      } else if (errorMessage.includes("fully booked")) {
        errorMessage = "This slot is fully booked. Please select another time.";
      } else if (errorMessage.includes("busy")) {
        errorMessage = "The server is busy. Please try again in a moment.";
      }
      
      toast.error(errorMessage, {
        id: toastId,
        duration: 5000,
      });
      setBookingProgress(null);
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
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 lg:px-20 py-6 sm:py-10">

      <Button
        onClick={() => navigate("/grounds")}
        className="mb-5 bg-white/10 text-white hover:bg-white/15"
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
            className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-xl mb-4"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600";
            }}
          />
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{ground.name}</h1>
          <div className="grid sm:grid-cols-2 gap-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-pink-400 shrink-0" />
              <span>{ground.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-400 shrink-0" />
              <span>{ground.opening_time} - {ground.closing_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>{ground.amenities || "Not listed"}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{ground.admin_name || "Not set"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-yellow-400 shrink-0" />
              <span>{ground.admin_phone || "Not set"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <h2 className="text-xl sm:text-2xl font-bold mb-3">Select Match Date</h2>
      <div className="mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full sm:w-auto rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-white"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Available Sessions */}
      <h2 className="text-xl sm:text-2xl font-bold mb-3">Available Match Sessions</h2>

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
      <h2 className="text-xl sm:text-2xl font-bold mb-3">Match Type</h2>
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

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <Card className="bg-zinc-900 border border-white/10 mb-6">
          <CardContent className="p-4 sm:p-5">
            <h3 className="text-lg font-bold mb-2 text-pink-400">Selected Session</h3>
            <p className="text-white/80 text-sm">{selectedSlot.start_time} - {selectedSlot.end_time}</p>
            <p className="text-white/70 text-sm">Date: {selectedSlot.slot_date}</p>
            <p className="text-white/70 text-sm">
              Price: ₹{calculateTotalPrice()}
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

      {/* Retry Indicator */}
      {retrying && (
        <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
            <p className="text-yellow-300 text-sm">
              Retrying... Attempt {retryCount} of 3
            </p>
          </div>
          <p className="text-yellow-300/70 text-xs text-center mt-1">
            The request is taking longer than expected. Please wait...
          </p>
        </div>
      )}

      {/* Book Button */}
      <Button
        onClick={handleBooking}
        disabled={!selectedSlot || !matchType || bookingLoading}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 font-bold text-lg py-6 disabled:opacity-50"
      >
        {bookingLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {retryCount > 0 ? (
              <span>Retrying... (Attempt {retryCount}/3)</span>
            ) : (
              <span>{bookingProgress || "Processing..."}</span>
            )}
          </div>
        ) : (
          `Book Now - ₹${calculateTotalPrice()}`
        )}
      </Button>

      {/* Timeout Warning */}
      {bookingLoading && bookingProgress === "Creating your booking..." && (
        <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-yellow-300 text-sm text-center">
            This may take a few seconds. Please don't close the page.
          </p>
        </div>
      )}
    </div>
  );
}