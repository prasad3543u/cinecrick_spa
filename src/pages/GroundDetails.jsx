import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, getToken } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GroundDetails() {
  const { id } = useParams();

  const [ground, setGround] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const groundData = await api(`/grounds/${id}`);
        const slotData = await api(`/slots?ground_id=${id}`);

        setGround(groundData);
        setSlots(slotData);
      } catch (err) {
        setError(err.message || "Failed to load ground details");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleBook(slot) {
    try {
      setMessage("");
      setError("");

      await api("/bookings", {
        method: "POST",
        auth: true,
        body: {
          ground_id: ground.id,
          slot_id: slot.id,
          booking_date: slot.slot_date,
          total_price: slot.price,
        },
      });

      setMessage("Booking successful!");

      const updatedSlots = await api(`/slots?ground_id=${id}`);
      setSlots(updatedSlots);
    } catch (err) {
      setError(err.message || "Booking failed");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        Loading ground details...
      </div>
    );
  }

  if (error && !ground) {
    return (
      <div className="min-h-screen bg-[#070812] text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      {ground && (
        <>
          <div className="mb-8">
            <h1 className="text-4xl font-black text-pink-400">{ground.name}</h1>
            <p className="text-white/70 mt-2">{ground.location}</p>
            <p className="text-white/70">Amenities: {ground.amenities}</p>
          </div>

          {message && (
            <p className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-green-300">
              {message}
            </p>
          )}

          {error && (
            <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300">
              {error}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <Card
                key={slot.id}
                className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)]"
              >
                <CardContent className="p-5 space-y-3">
                  <h2 className="text-xl font-bold">
                    {slot.start_time} - {slot.end_time}
                  </h2>
                  <p className="text-white/70">Date: {slot.slot_date}</p>
                  <p className="text-pink-400 font-semibold">₹{slot.price}</p>
                  <p
                    className={
                      slot.status === "available"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {slot.status}
                  </p>

                  <Button
                    disabled={slot.status !== "available" || !getToken()}
                    onClick={() => handleBook(slot)}
                    className="w-full bg-gradient-to-r from-pink-500 to-violet-500 disabled:opacity-50"
                  >
                    {slot.status === "available" ? "Book Now" : "Unavailable"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}