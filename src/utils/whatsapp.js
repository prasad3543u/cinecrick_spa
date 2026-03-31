import { toast } from "sonner";

export function openWhatsAppConfirmation(booking) {
  const phone = booking.user?.phone;
  if (!phone) {
    toast.error("User phone not found. Ask user to add phone in Settings.");
    return;
  }
  const number = String(phone).replace(/\D/g, "");
  const message = `Hi ${booking.user?.name || "there"},

Your CineCrick booking has been CONFIRMED!

Ground: ${booking.ground?.name || ""}
Location: ${booking.ground?.location || ""}
Date: ${booking.booking_date || ""}
Time: ${booking.slot?.start_time || ""} - ${booking.slot?.end_time || ""}
Price: Rs.${booking.total_price || ""}
Match Type: ${booking.match_type || ""}

Umpire: ${booking.umpire_name || "Will be assigned"}${booking.umpire_phone ? ` - ${booking.umpire_phone}` : ""}
Groundsman: ${booking.groundsman_name || "Will be assigned"}${booking.groundsman_phone ? ` - ${booking.groundsman_phone}` : ""}

Please arrive 10 minutes before your slot.
Thank you for booking with CineCrick!`;

  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
}

export function openWhatsAppReminder(booking) {
  const phone = booking.user?.phone;
  if (!phone) {
    toast.error("User phone not found.");
    return;
  }
  const number = String(phone).replace(/\D/g, "");
  const message = `Hi ${booking.user?.name || "there"}, reminder for your match tomorrow!

Ground: ${booking.ground?.name || ""}
Date: ${booking.booking_date || ""}
Time: ${booking.slot?.start_time || ""} - ${booking.slot?.end_time || ""}
Umpire: ${booking.umpire_name || "TBD"}${booking.umpire_phone ? ` - ${booking.umpire_phone}` : ""}
Groundsman: ${booking.groundsman_name || "TBD"}

Please be on time. Good luck!
— CineCrick`;

  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
}