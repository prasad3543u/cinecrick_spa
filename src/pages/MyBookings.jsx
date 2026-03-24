import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Calendar, Clock, MapPin, DollarSign, User, 
  XCircle, Download, Share2, AlertCircle, 
  Loader2, FileText, Info
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "../components/ConfirmDialog";

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await api("/bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // CANCELLATION POLICY LOGIC
  // ============================================
  
  // Check if booking can be cancelled (only allowed if more than 2 days before)
  const canCancel = (booking) => {
    const matchDateTime = new Date(`${booking.booking_date} ${booking.slot?.start_time}`);
    const now = new Date();
    const hoursDiff = (matchDateTime - now) / (1000 * 60 * 60);
    return hoursDiff > 48 && booking.status === "confirmed";
  };

  // Get cancellation refund percentage based on time before match
  const getRefundPercentage = (booking) => {
    const matchDateTime = new Date(`${booking.booking_date} ${booking.slot?.start_time}`);
    const now = new Date();
    const hoursDiff = (matchDateTime - now) / (1000 * 60 * 60);
    
    if (hoursDiff > 72) {
      return 100; // 4+ days before (more than 72 hours)
    } else if (hoursDiff > 48) {
      return 25; // 3 days before (49-72 hours)
    } else {
      return 0; // 2 days or less (≤ 48 hours)
    }
  };

  // Get cancellation deadline text
  const getCancellationDeadline = (booking) => {
    const matchDateTime = new Date(`${booking.booking_date} ${booking.slot?.start_time}`);
    const deadline2Days = new Date(matchDateTime.getTime() - 48 * 60 * 60 * 1000);
    const deadline3Days = new Date(matchDateTime.getTime() - 72 * 60 * 60 * 1000);
    
    const now = new Date();
    const hoursDiff = (matchDateTime - now) / (1000 * 60 * 60);
    
    if (hoursDiff > 72) {
      return `Cancel before ${deadline3Days.toLocaleDateString()} for 100% refund, or before ${deadline2Days.toLocaleDateString()} for 25% refund`;
    } else if (hoursDiff > 48) {
      return `Cancel before ${deadline2Days.toLocaleDateString()} for 25% refund`;
    } else {
      return `No refund available for cancellations within 48 hours of match`;
    }
  };

  async function handleCancelBooking() {
    if (!bookingToCancel) return;
    
    try {
      setCancellingId(bookingToCancel.id);
      toast.info("Cancelling booking...");
      await api(`/bookings/${bookingToCancel.id}/cancel`, { method: "PATCH" });
      toast.success("Booking cancelled successfully!");
      await loadBookings();
    } catch (err) {
      toast.error(err?.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
      setBookingToCancel(null);
      setShowCancelDialog(false);
    }
  }

  // Share booking via WhatsApp
  const shareBooking = (booking) => {
    const message = `*Booking Confirmation - CrickOps*

Ground: ${booking.ground?.name}
Location: ${booking.ground?.location}
Date: ${booking.booking_date}
Time: ${booking.slot?.start_time} - ${booking.slot?.end_time}
Match Type: ${booking.match_type === "with_opponents" ? "With Opponents" : "Full Ground"}
Price: Rs.${booking.total_price}
Status: ${booking.status}

Thank you for booking with CrickOps!`;

    if (navigator.share) {
      navigator.share({
        title: "Booking Confirmation",
        text: message,
        url: window.location.href
      }).catch(() => {
        const phone = booking.user?.phone || "";
        if (phone) {
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
        } else {
          toast.error("Share failed");
        }
      });
    } else {
      const phone = booking.user?.phone || "";
      if (phone) {
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
      } else {
        navigator.clipboard.writeText(message);
        toast.success("Booking details copied to clipboard!");
      }
    }
  };

  // Download booking receipt
  const downloadReceipt = (booking) => {
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Receipt - CrickOps</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
          .receipt { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: #ec489a; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 20px; font-weight: bold; margin-top: 20px; padding-top: 15px; border-top: 2px solid #ec489a; color: #ec489a; }
          .footer { text-align: center; padding: 20px; background: #f9f9f9; color: #666; font-size: 12px; }
          .cancellation-policy { background: #fff3e0; padding: 15px; margin-top: 20px; border-radius: 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h2>CrickOps</h2>
            <p>Booking Receipt</p>
          </div>
          <div class="content">
            <p style="text-align: center; color: #666; margin-bottom: 20px;">Booking ID: ${booking.id}</p>
            
            <div class="detail-row">
              <strong>Ground:</strong> <span>${booking.ground?.name}</span>
            </div>
            <div class="detail-row">
              <strong>Location:</strong> <span>${booking.ground?.location}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong> <span>${booking.booking_date}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong> <span>${booking.slot?.start_time} - ${booking.slot?.end_time}</span>
            </div>
            <div class="detail-row">
              <strong>Match Type:</strong> <span>${booking.match_type === "with_opponents" ? "With Opponents" : "Full Ground"}</span>
            </div>
            <div class="detail-row">
              <strong>Price:</strong> <span>Rs. ${booking.total_price}</span>
            </div>
            <div class="detail-row">
              <strong>Status:</strong> <span>${booking.status}</span>
            </div>
            
            <div class="total">
              Total Paid: Rs. ${booking.total_price}
            </div>
            
            <div class="cancellation-policy">
              <strong>Cancellation Policy:</strong><br/>
              • Cancel more than 3 days before match: 100% refund<br/>
              • Cancel between 2-3 days before match: 25% refund<br/>
              • Cancel within 48 hours of match: No refund
            </div>
          </div>
          <div class="footer">
            <p>Thank you for choosing CrickOps!</p>
            <p>For support: +91 9110546558 | support@crickops.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking_receipt_${booking.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded!");
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const matchDateTime = new Date(`${booking.booking_date} ${booking.slot?.start_time}`);
    const now = new Date();
    const isPast = matchDateTime < now;
    
    if (activeTab === "upcoming") {
      return !isPast && booking.status === "confirmed";
    } else if (activeTab === "past") {
      return isPast && booking.status === "confirmed";
    } else if (activeTab === "cancelled") {
      return booking.status === "cancelled";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 py-6 sm:px-6">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-pink-400">My Bookings</h1>
        <p className="text-white/50 text-sm mt-1">
          Manage your bookings and view history
        </p>
      </div>

      {/* Cancellation Policy Info Banner */}
      <Card className="bg-blue-500/10 border border-blue-500/30 mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-300">Cancellation Policy</p>
              <p className="text-xs text-white/60 mt-1">
                • Cancel more than 3 days before match: 100% refund<br/>
                • Cancel between 2-3 days before match: 25% refund<br/>
                • Cancel within 48 hours of match: No refund
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-zinc-900 border border-white/10">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-pink-500">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-pink-500">
            Past
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-pink-500">
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-white/20 mb-3" />
              <p className="text-white/50">No upcoming bookings</p>
              <Button onClick={() => navigate("/grounds")} className="mt-4">
                Book a Ground
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  canCancel={canCancel(booking)}
                  refundPercentage={getRefundPercentage(booking)}
                  cancellationDeadline={getCancellationDeadline(booking)}
                  onCancel={() => {
                    setBookingToCancel(booking);
                    setShowCancelDialog(true);
                  }}
                  onShare={() => shareBooking(booking)}
                  onDownload={() => downloadReceipt(booking)}
                  cancelling={cancellingId === booking.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-white/20 mb-3" />
              <p className="text-white/50">No past bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isPast={true}
                  onShare={() => shareBooking(booking)}
                  onDownload={() => downloadReceipt(booking)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 mx-auto text-white/20 mb-3" />
              <p className="text-white/50">No cancelled bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isCancelled={true}
                  onShare={() => shareBooking(booking)}
                  onDownload={() => downloadReceipt(booking)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Booking"
        description={
          <div className="space-y-2">
            <p>Are you sure you want to cancel this booking?</p>
            {bookingToCancel && (
              <div className={`p-3 rounded-lg ${
                getRefundPercentage(bookingToCancel) === 100 ? "bg-green-500/10" :
                getRefundPercentage(bookingToCancel) === 25 ? "bg-yellow-500/10" :
                "bg-red-500/10"
              }`}>
                <p className={`text-sm ${
                  getRefundPercentage(bookingToCancel) === 100 ? "text-green-400" :
                  getRefundPercentage(bookingToCancel) === 25 ? "text-yellow-400" :
                  "text-red-400"
                }`}>
                  Refund: {getRefundPercentage(bookingToCancel)}% of total amount
                </p>
                <p className="text-xs text-white/50 mt-1">
                  {getCancellationDeadline(bookingToCancel)}
                </p>
              </div>
            )}
          </div>
        }
        onConfirm={handleCancelBooking}
        confirmText="Yes, Cancel"
        cancelText="No, Keep it"
        variant="danger"
      />
    </div>
  );
}

// Booking Card Component
function BookingCard({ booking, canCancel, refundPercentage, cancellationDeadline, onCancel, onShare, onDownload, cancelling, isPast, isCancelled }) {
  const matchDateTime = new Date(`${booking.booking_date} ${booking.slot?.start_time}`);
  const now = new Date();
  const isUpcoming = matchDateTime > now && booking.status === "confirmed";
  
  // Get color based on refund percentage
  const getRefundColor = () => {
    if (refundPercentage === 100) return "bg-green-500/10 border-green-500/30 text-green-400";
    if (refundPercentage === 25) return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    return "bg-red-500/10 border-red-500/30 text-red-400";
  };
  
  return (
    <Card className="border-white/10 bg-zinc-950/55 overflow-hidden">
      <div className={`h-1 w-full ${
        booking.status === "confirmed" ? "bg-gradient-to-r from-green-500 to-emerald-400" :
        booking.status === "cancelled" ? "bg-gradient-to-r from-red-500 to-rose-400" :
        "bg-gradient-to-r from-yellow-500 to-orange-400"
      }`} />
      
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-pink-400">{booking.ground?.name}</h3>
            <div className="flex items-center gap-2 text-white/50 text-sm mt-1">
              <MapPin className="h-3 w-3" />
              <span>{booking.ground?.location}</span>
            </div>
          </div>
          <Badge className={`text-xs ${
            booking.status === "confirmed" ? "bg-green-500/20 text-green-400" :
            booking.status === "cancelled" ? "bg-red-500/20 text-red-400" :
            "bg-yellow-500/20 text-yellow-400"
          }`}>
            {booking.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-pink-400" />
            <span>{booking.booking_date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-violet-400" />
            <span>{booking.slot?.start_time} - {booking.slot?.end_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span>Rs. {booking.total_price}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-cyan-400" />
            <span>{booking.match_type === "with_opponents" ? "With Opponents" : "Full Ground"}</span>
          </div>
        </div>

        {/* Cancellation Policy Info */}
        {isUpcoming && !isCancelled && (
          <div className={`mt-3 p-2 rounded-lg border ${getRefundColor()}`}>
            <div className="flex items-start gap-2">
              <AlertCircle className={`h-4 w-4 mt-0.5 ${
                refundPercentage === 100 ? "text-green-400" :
                refundPercentage === 25 ? "text-yellow-400" :
                "text-red-400"
              }`} />
              <div>
                <p className="text-xs font-medium">
                  {refundPercentage === 100 && "100% refund available"}
                  {refundPercentage === 25 && "25% refund available"}
                  {refundPercentage === 0 && "No refund available"}
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  {cancellationDeadline}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {isUpcoming && !isCancelled && canCancel && (
            <Button
              onClick={onCancel}
              disabled={cancelling}
              size="sm"
              className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
            >
              <XCircle className="h-4 w-4 mr-1" />
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          )}
          
          <Button
            onClick={onShare}
            size="sm"
            variant="outline"
            className="border-white/10 text-white/70 hover:text-white"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          
          <Button
            onClick={onDownload}
            size="sm"
            variant="outline"
            className="border-white/10 text-white/70 hover:text-white"
          >
            <Download className="h-4 w-4 mr-1" />
            Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}