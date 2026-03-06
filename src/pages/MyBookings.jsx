import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await api("/bookings", { auth: true });
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <h1 className="text-4xl font-black text-pink-400 mb-8">
        My Bookings
      </h1>

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <Card
            key={booking.id}
            className="border-white/10 bg-zinc-950/55"
          >
            <CardContent className="p-5 space-y-2">

              <h2 className="text-xl font-bold text-pink-400">
                {booking.ground.name}
              </h2>

              <p>Date: {booking.booking_date}</p>

              <p>
                Slot: {booking.slot.start_time} - {booking.slot.end_time}
              </p>

              <p>Total Price: ₹{booking.total_price}</p>

              <p>Status: {booking.status}</p>

              <p>Payment: {booking.payment_status}</p>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}