import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Clock, Shield, User, Phone, Loader2, 
  Calendar as CalendarIcon, CheckCircle, XCircle, Users, DollarSign,
  ChevronLeft, ChevronRight, Star
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);

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

  // Get date status
  function getDateStatus(dateStr) {
    if (availableDates.includes(dateStr)) return "available";
    if (bookedDates.includes(dateStr)) return "booked";
    return null;
  }

  // Generate calendar for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    // Add previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
    // Add next month days to make 42 cells (6 rows)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
          <Card className="bg-zinc-900 border border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <img
                src={ground.image_url}
                alt={ground.name}
                className="w-full h-48 sm:h-56 object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600";
                }}
              />
              <div className="p-4 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{ground.name}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-white/70 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-pink-400" />
                    <span>{ground.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-violet-400" />
                    <span>{ground.opening_time} - {ground.closing_time}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/10 text-white/70">{ground.sport_type}</Badge>
                  {ground.amenities?.split(',').slice(0, 3).map((item, i) => (
                    <Badge key={i} className="bg-white/10 text-white/70">{item.trim()}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Calendar */}
          <Card className="bg-zinc-900 border border-white/10">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-pink-400" />
                  Select Match Date
                </h2>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousMonth}
                    className="h-8 w-8 text-white/60 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-3 py-1.5">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextMonth}
                    className="h-8 w-8 text-white/60 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-white/50 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ date, isCurrentMonth }, index) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const status = getDateStatus(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isTodayDate = isToday(date);
                  const isPast = date < new Date().setHours(0, 0, 0, 0);
                  const isHovered = hoveredDate === dateStr;
                  const isDisabled = isPast || status === "booked" || (!status && !isCurrentMonth);

                  let bgColor = "bg-transparent";
                  let textColor = "text-white/70";
                  let borderClass = "border-transparent";

                  if (isSelected) {
                    bgColor = "bg-pink-500";
                    textColor = "text-white";
                    borderClass = "border-pink-400";
                  } else if (status === "available" && isCurrentMonth && !isPast) {
                    bgColor = "bg-green-500/20";
                    textColor = "text-green-400";
                    borderClass = "border-green-500/30";
                  } else if (status === "booked") {
                    bgColor = "bg-red-500/10";
                    textColor = "text-red-400/50 line-through";
                  } else if (!isCurrentMonth) {
                    textColor = "text-white/20";
                  }

                  if (isHovered && !isSelected && status === "available") {
                    bgColor = "bg-green-500/30";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => !isDisabled && setSelectedDate(dateStr)}
                      onMouseEnter={() => setHoveredDate(dateStr)}
                      onMouseLeave={() => setHoveredDate(null)}
                      disabled={isDisabled}
                      className={`
                        relative aspect-square rounded-lg transition-all duration-200
                        ${bgColor} ${textColor} ${borderClass}
                        ${!isDisabled && isCurrentMonth && !isPast && status !== "booked" ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"}
                        ${isTodayDate && !isSelected ? "ring-1 ring-pink-500/50" : ""}
                      `}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-medium ${isSelected ? "font-bold" : ""}`}>
                          {date.getDate()}
                        </span>
                      </div>
                      {status === "available" && !isSelected && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
                      )}
                      {status === "booked" && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-white/60">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-white/60">Fully Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                  <span className="text-xs text-white/60">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <span className="text-xs text-white/60">No Slots</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Price Summary Card */}
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
                      className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:opacity-90 transition py-6 text-base"
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
          <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-white/10">
            <CalendarIcon className="h-12 w-12 mx-auto text-white/20 mb-3" />
            <p className="text-white/50">No slots available for this date</p>
          </div>
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
                  className={`cursor-pointer border transition-all duration-200 ${
                    isSelected 
                      ? "border-pink-500 ring-2 ring-pink-500/50 bg-pink-500/5" 
                      : "border-white/10 bg-zinc-900 hover:border-pink-400"
                  } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={() => !isDisabled && handleSelectSlot(slot)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold">
                          {slot.start_time} - {slot.end_time}
                        </h3>
                        <p className="text-white/50 text-xs mt-1">
                          {slot.slot_date}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-pink-500" />
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-pink-400 font-semibold">
                        Rs. {slot.price} <span className="text-white/50 text-xs">per team</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-white/40" />
                        <p className="text-xs text-white/50">
                          Teams: {slot.teams_booked_count || 0} / {slot.max_teams || 2}
                        </p>
                      </div>
                      <Badge className={`mt-2 text-xs ${
                        statusText === "Available" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        statusText === "Booked" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }`}>
                        {statusText}
                      </Badge>
                    </div>
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
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <input
              type="radio"
              name="match"
              value="with_opponents"
              checked={matchType === "with_opponents"}
              onChange={(e) => setMatchType(e.target.value)}
              className="h-4 w-4 accent-pink-500"
            />
            <div>
              <span className="font-medium">Ground Needed With Opponents</span>
              <p className="text-xs text-white/40">You need opponents to play. We'll help you find a team.</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <input
              type="radio"
              name="match"
              value="without_opponents"
              checked={matchType === "without_opponents"}
              onChange={(e) => setMatchType(e.target.value)}
              className="h-4 w-4 accent-pink-500"
            />
            <div>
              <span className="font-medium">Ground Needed Without Opponents</span>
              <p className="text-xs text-white/40">You have your own team. Full ground booking (2x price).</p>
            </div>
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