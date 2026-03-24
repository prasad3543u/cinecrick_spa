import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Clock, Shield, User, Phone, Loader2, 
  Calendar as CalendarIcon, CheckCircle, XCircle, Users, DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { useRetry } from "../hooks/useRetry";

export default function GroundDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ground, setGround] = useState(null);
  const [user, setUser] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [matchType, setMatchType] = useState("with_opponents");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingProgress, setBookingProgress] = useState(null);
  const [error, setError] = useState("");
  const [slotError, setSlotError] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);

  const { withRetry, retrying, retryCount } = useRetry(3, 1000);

  useEffect(() => {
    loadGround();
    loadUser();
    loadAvailableDates();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      loadSlotsByDate(selectedDate);
    }
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

  async function loadAvailableDates() {
    try {
      const allSlots = await api(`/slots?ground_id=${id}`);
      const dates = allSlots.reduce((acc, slot) => {
        if (slot.status === "available") {
          acc.available.push(slot.slot_date);
        } else if (slot.status === "booked" || slot.status === "pending") {
          acc.booked.push(slot.slot_date);
        }
        return acc;
      }, { available: [], booked: [] });
      
      setAvailableDates([...new Set(dates.available)]);
      setBookedDates([...new Set(dates.booked)]);
    } catch (err) {
      console.error("Failed to load dates", err);
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

  function calculateDuration() {
    if (!selectedSlot) return 0;
    const start = selectedSlot.start_time.split(":");
    const end = selectedSlot.end_time.split(":");
    const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
    const durationHours = (endMinutes - startMinutes) / 60;
    return durationHours.toFixed(1);
  }

  function openWhatsAppToAdmin() {
    if (!ground) return;
    
    const adminNumber = ground.admin_phone;
    
    if (!adminNumber) {
      console.log("No admin phone number found");
      toast.warning("Admin contact not available. Your booking is saved but admin will need to contact you.");
      return;
    }
    
    const number = String(adminNumber).replace(/\D/g, "");
    
    const message = `NEW BOOKING REQUEST

User Details:
Name: ${user?.name || "Guest"}
Phone: ${user?.phone || "Not provided"}
Email: ${user?.email || "Not provided"}

Booking Details:
Ground: ${ground.name}
Date: ${selectedSlot?.slot_date}
Time: ${selectedSlot?.start_time} - ${selectedSlot?.end_time}
Match Type: ${matchType === "with_opponents" ? "With Opponents" : "Full Ground"}
Price: Rs.${calculateTotalPrice()}

Message: I have created a booking request. Please confirm availability.

— CrickOps`;
    
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
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

      if (retryCount > 0) {
        toast.info(`Booking completed after ${retryCount} retry attempt(s)`, {
          duration: 3000,
        });
      }

      setBookingProgress("Opening WhatsApp...");
      openWhatsAppToAdmin();
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(
        `Booking created! ${matchType === "without_opponents" ? "You've booked both teams." : "Waiting for another team to join."}`,
        { id: toastId, duration: 5000 }
      );
      
      setTimeout(() => {
        navigate("/my-bookings");
      }, 2000);
      
    } catch (error) {
      console.error("Booking error:", error);
      
      let errorMessage = error.message || "Failed to create booking. Please try again.";
      
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

  // Custom day render for calendar
  const renderDay = (day) => {
    const dateStr = day.toISOString().split('T')[0];
    let status = "";
    let statusColor = "";
    
    if (availableDates.includes(dateStr)) {
      status = "available";
      statusColor = "bg-green-500/20 text-green-400";
    } else if (bookedDates.includes(dateStr)) {
      status = "booked";
      statusColor = "bg-red-500/20 text-red-400";
    }
    
    return (
      <div className="relative">
        <span>{day.getDate()}</span>
        {status && (
          <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${statusColor === "bg-green-500/20" ? "bg-green-500" : "bg-red-500"}`} />
        )}
      </div>
    );
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Ground Info & Calendar */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ground Info Card */}
          <Card className="bg-zinc-900 border border-white/10">
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

          {/* Calendar */}
          <Card className="bg-zinc-900 border border-white/10">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-pink-400" />
                Select Match Date
              </h2>
              <Calendar
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={(date) => setSelectedDate(date ? date.toISOString().split('T')[0] : "")}
                className="rounded-md border-white/10 bg-zinc-800"
                modifiers={{
                  available: availableDates.map(d => new Date(d)),
                  booked: bookedDates.map(d => new Date(d))
                }}
                modifiersStyles={{
                  available: { backgroundColor: "rgba(34,197,94,0.1)", color: "white", fontWeight: "bold" },
                  booked: { backgroundColor: "rgba(239,68,68,0.1)", textDecoration: "line-through", color: "rgb(156,163,175)" }
                }}
                disabled={(date) => date < new Date() || bookedDates.includes(date.toISOString().split('T')[0])}
              />
              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-white/60">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-white/60">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span className="text-white/60">Disabled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Price Summary Card (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-pink-500/30">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-pink-400">Booking Summary</h2>
                
                {!selectedSlot ? (
                  <div className="text-center py-8 text-white/50">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select a date and time slot</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Ground</span>
                        <span className="font-semibold">{ground.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Date</span>
                        <span className="font-semibold">{selectedSlot.slot_date}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Time</span>
                        <span className="font-semibold">{selectedSlot.start_time} - {selectedSlot.end_time}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Duration</span>
                        <span className="font-semibold">{calculateDuration()} hours</span>
                      </div>
                      <Separator className="bg-white/10 my-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Slot Price</span>
                        <span>Rs. {selectedSlot.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Match Type</span>
                        <span className="capitalize">{matchType === "with_opponents" ? "With Opponents" : "Full Ground"}</span>
                      </div>
                      {matchType === "without_opponents" && (
                        <div className="flex justify-between text-sm text-yellow-400">
                          <span>Full Ground (2x)</span>
                          <span>+ Rs. {selectedSlot.price}</span>
                        </div>
                      )}
                      <Separator className="bg-white/10 my-2" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount</span>
                        <span className="text-pink-400">Rs. {calculateTotalPrice()}</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleBooking}
                      disabled={bookingLoading}
                      className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:opacity-90 transition"
                    >
                      {bookingLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {bookingProgress || "Processing..."}
                        </div>
                      ) : (
                        `Book Now - Rs. ${calculateTotalPrice()}`
                      )}
                    </Button>
                    
                    {retrying && (
                      <p className="text-xs text-yellow-400 text-center">
                        Retrying... Attempt {retryCount}/3
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Available Sessions Section */}
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Available Match Sessions</h2>

        {slotError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
            {slotError}
          </div>
        )}

        {!selectedDate ? (
          <p className="text-white/70 text-sm">Please select a date from the calendar to see available slots.</p>
        ) : loadingSlots ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <span className="ml-2 text-white/70">Loading slots...</span>
          </div>
        ) : slots.length === 0 ? (
          <p className="text-white/70 text-sm">No slots available for this date.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <p className="text-pink-400 font-semibold mt-1">Rs. {slot.price} per team</p>
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
      </div>

      {/* Match Type Section */}
      <div className="mt-8">
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
      </div>

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