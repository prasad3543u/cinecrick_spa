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
  ChevronLeft, ChevronRight, Star, ChevronDown, LayoutGrid, List
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
  const [calendarView, setCalendarView] = useState("compact"); // "compact" or "full"
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  // Generate next 30 days for compact view
  const getNextDates = () => {
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const nextDates = getNextDates();

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  // Check if date is today
  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // Full Calendar Helpers
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
    // Add next month days to make 42 cells
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  if (!ground) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        {error ? <p className="text-red-400">{error}</p> : <p className="text-white/70">Loading ground...</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 py-4 sm:py-6 sm:px-6 lg:px-20">
      
      {/* Back Button */}
      <Button
        onClick={() => navigate("/grounds")}
        variant="ghost"
        className="mb-4 text-white/70 hover:text-white hover:bg-white/10"
      >
        ← Back to Grounds
      </Button>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Mobile Layout - Stacked */}
      <div className="space-y-4">
        
        {/* Ground Info Card - Compact */}
        <Card className="bg-zinc-900 border border-white/10 overflow-hidden">
          <div className="relative h-40 sm:h-48">
            <img
              src={ground.image_url}
              alt={ground.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h1 className="text-xl sm:text-2xl font-bold">{ground.name}</h1>
              <div className="flex flex-wrap gap-2 text-xs text-white/70 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {ground.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {ground.opening_time} - {ground.closing_time}
                </span>
              </div>
            </div>
          </div>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/10 text-white/70 text-xs">{ground.sport_type}</Badge>
              {ground.amenities?.split(',').slice(0, 2).map((item, i) => (
                <Badge key={i} className="bg-white/10 text-white/70 text-xs">{item.trim()}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Date Selection with View Toggle */}
        <Card className="bg-zinc-900 border border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-pink-400" />
                Select Date
              </h2>
              <div className="flex gap-1">
                <Button
                  variant={calendarView === "compact" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCalendarView("compact")}
                  className={`h-8 px-2 ${calendarView === "compact" ? "bg-pink-500 text-white" : "text-white/50"}`}
                >
                  <List className="h-3.5 w-3.5 mr-1" />
                  Compact
                </Button>
                <Button
                  variant={calendarView === "full" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCalendarView("full")}
                  className={`h-8 px-2 ${calendarView === "full" ? "bg-pink-500 text-white" : "text-white/50"}`}
                >
                  <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                  Full
                </Button>
              </div>
            </div>

            {/* COMPACT VIEW - Horizontal Scroll */}
            {calendarView === "compact" && (
              <>
                <div className="overflow-x-auto pb-2 -mx-1 px-1">
                  <div className="flex gap-2 min-w-max">
                    {nextDates.map((date) => {
                      const status = getDateStatus(date);
                      const isSelected = selectedDate === date;
                      const isTodayDate = isToday(date);
                      const isDisabled = status === "booked";
                      
                      let bgColor = "bg-white/5";
                      let textColor = "text-white/80";
                      let borderColor = "border-transparent";
                      
                      if (isSelected) {
                        bgColor = "bg-pink-500";
                        textColor = "text-white";
                        borderColor = "border-pink-400";
                      } else if (status === "available") {
                        bgColor = "bg-green-500/20";
                        textColor = "text-green-400";
                        borderColor = "border-green-500/30";
                      } else if (status === "booked") {
                        bgColor = "bg-red-500/10";
                        textColor = "text-red-400/50";
                      }
                      
                      return (
                        <button
                          key={date}
                          onClick={() => !isDisabled && setSelectedDate(date)}
                          disabled={isDisabled}
                          className={`
                            flex flex-col items-center min-w-[70px] p-2 rounded-xl border transition-all
                            ${bgColor} ${textColor} ${borderColor}
                            ${!isDisabled && status !== "booked" ? "active:scale-95" : "opacity-50"}
                          `}
                        >
                          <span className="text-xs font-medium">
                            {new Date(date).toLocaleDateString("en-IN", { weekday: "short" })}
                          </span>
                          <span className="text-lg font-bold mt-1">
                            {new Date(date).getDate()}
                          </span>
                          <span className="text-[10px] mt-0.5">
                            {new Date(date).toLocaleDateString("en-IN", { month: "short" })}
                          </span>
                          {status === "available" && (
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                          )}
                          {isTodayDate && !isSelected && (
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-pink-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="text-xs text-white/40 text-center mt-2">
                  Swipe to see more dates
                </div>
              </>
            )}

            {/* FULL CALENDAR VIEW - Month Grid */}
            {calendarView === "full" && (
              <>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousMonth}
                    className="h-8 w-8 text-white/60 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
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

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-white/50 py-1">
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
                    const isPast = date < new Date().setHours(0, 0, 0, 0);
                    const isTodayDate = isToday(dateStr);
                    const isDisabled = isPast || status === "booked" || (!status && !isCurrentMonth);

                    let bgColor = "bg-transparent";
                    let textColor = "text-white/70";
                    let borderClass = "border-transparent";

                    if (isSelected) {
                      bgColor = "bg-pink-500";
                      textColor = "text-white";
                    } else if (status === "available" && isCurrentMonth && !isPast) {
                      bgColor = "bg-green-500/20";
                      textColor = "text-green-400";
                    } else if (status === "booked") {
                      bgColor = "bg-red-500/10";
                      textColor = "text-red-400/50";
                    } else if (!isCurrentMonth) {
                      textColor = "text-white/20";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => !isDisabled && setSelectedDate(dateStr)}
                        disabled={isDisabled}
                        className={`
                          relative aspect-square rounded-lg transition-all duration-200
                          ${bgColor} ${textColor}
                          ${!isDisabled && status === "available" ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"}
                          ${isTodayDate && !isSelected && status !== "booked" ? "ring-1 ring-pink-500/50" : ""}
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
              </>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3 pt-2 text-xs border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-white/50">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-white/50">Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span className="text-white/50">Selected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Summary Card - Compact */}
        {selectedSlot && (
          <Card className="bg-gradient-to-r from-pink-500/10 to-violet-500/10 border border-pink-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-pink-400">Booking Summary</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSlot(null)}
                  className="h-6 text-xs text-white/50"
                >
                  Change
                </Button>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Ground</span>
                  <span className="font-medium">{ground.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Date</span>
                  <span>{formatDate(selectedSlot.slot_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Time</span>
                  <span>{selectedSlot.start_time} - {selectedSlot.end_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Duration</span>
                  <span>{calculateDuration()} hrs</span>
                </div>
                <Separator className="bg-white/10 my-1.5" />
                <div className="flex justify-between">
                  <span className="text-white/60">Slot Price</span>
                  <span>Rs. {selectedSlot.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Match Type</span>
                  <span className="capitalize text-xs bg-white/10 px-2 py-0.5 rounded-full">
                    {matchType === "with_opponents" ? "With Opponents" : "Full Ground"}
                  </span>
                </div>
                {matchType === "without_opponents" && (
                  <div className="flex justify-between text-yellow-400 text-xs">
                    <span>Full Ground (2x)</span>
                    <span>+ Rs. {selectedSlot.price}</span>
                  </div>
                )}
                <Separator className="bg-white/10 my-1.5" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-pink-400">Rs. {calculateTotalPrice()}</span>
                </div>
              </div>
              
              <Button
                onClick={handleBooking}
                disabled={bookingLoading}
                className="w-full mt-4 bg-gradient-to-r from-pink-500 to-violet-500 hover:opacity-90 py-5 text-base font-bold"
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
                <p className="text-xs text-yellow-400 text-center mt-2">
                  Retrying... Attempt {retryCount}/3
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Available Sessions */}
        {selectedDate && (
          <div>
            <h2 className="text-base font-bold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-pink-400" />
              Available Slots • {formatDate(selectedDate)}
            </h2>

            {slotError && (
              <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300 text-xs">
                {slotError}
              </div>
            )}

            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
              </div>
            ) : slots.length === 0 ? (
              <Card className="bg-zinc-900 border border-white/10">
                <CardContent className="p-8 text-center">
                  <Clock className="h-8 w-8 mx-auto text-white/20 mb-2" />
                  <p className="text-white/50 text-sm">No slots available for this date</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {slots.map((slot) => {
                  let statusText = "Available";
                  let isDisabled = false;
                  
                  if (slot.status?.toLowerCase() === "booked") {
                    statusText = "Booked";
                    isDisabled = true;
                  } else if (slot.status?.toLowerCase() === "pending") {
                    statusText = "Pending";
                    isDisabled = true;
                  } else if (Number(slot.teams_booked_count || 0) === 1) {
                    statusText = "1 Team Joined";
                  }

                  const isSelected = selectedSlot?.id === slot.id;

                  return (
                    <Card
                      key={slot.id}
                      className={`cursor-pointer border transition-all ${
                        isSelected 
                          ? "border-pink-500 bg-pink-500/5" 
                          : "border-white/10 bg-zinc-900"
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => !isDisabled && handleSelectSlot(slot)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Clock className={`h-4 w-4 ${isSelected ? "text-pink-400" : "text-white/40"}`} />
                            <span className="font-semibold text-sm">
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="text-pink-400 font-medium">Rs. {slot.price}</span>
                            <span className="text-white/40">|</span>
                            <span className="text-white/40">
                              {slot.teams_booked_count || 0}/{slot.max_teams || 2} teams
                            </span>
                          </div>
                        </div>
                        <Badge className={`text-xs ${
                          statusText === "Available" ? "bg-green-500/20 text-green-400" :
                          statusText === "Booked" ? "bg-red-500/20 text-red-400" :
                          statusText === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {statusText}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Match Type - Compact */}
        <Card className="bg-zinc-900 border border-white/10">
          <CardContent className="p-4">
            <h2 className="text-base font-bold mb-3">Match Type</h2>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 p-2 rounded-lg transition cursor-pointer ${matchType === "with_opponents" ? "bg-white/10" : "hover:bg-white/5"}`}>
                <input
                  type="radio"
                  name="match"
                  value="with_opponents"
                  checked={matchType === "with_opponents"}
                  onChange={(e) => setMatchType(e.target.value)}
                  className="h-4 w-4 accent-pink-500 shrink-0"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">With Opponents</span>
                  <p className="text-xs text-white/40">Need opponents to play</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-2 rounded-lg transition cursor-pointer ${matchType === "without_opponents" ? "bg-white/10" : "hover:bg-white/5"}`}>
                <input
                  type="radio"
                  name="match"
                  value="without_opponents"
                  checked={matchType === "without_opponents"}
                  onChange={(e) => setMatchType(e.target.value)}
                  className="h-4 w-4 accent-pink-500 shrink-0"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">Without Opponents</span>
                  <p className="text-xs text-white/40">Full ground (2x price)</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Timeout Warning */}
        {bookingLoading && bookingProgress === "Creating your booking..." && (
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-yellow-300 text-xs text-center">
              This may take a few seconds. Please don't close the page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}