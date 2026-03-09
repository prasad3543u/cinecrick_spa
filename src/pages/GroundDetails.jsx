import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getToken } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GroundDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ground, setGround] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadPageData() {
    try {
      setLoading(true);
      setError("");

      const [groundData, slotData] = await Promise.all([
        api(`/grounds/${id}`),
        api(`/slots?ground_id=${id}`),
      ]);

      setGround(groundData);
      setSlots(Array.isArray(slotData) ? slotData : []);
    } catch (err) {
      setError(err.message || "Failed to load ground details");
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(slot) {
    if (!getToken()) {
      navigate("/", { replace: true });
      return;
    }

    try {
      setError("");
      setMessage("");
      setBookingId(slot.id);

      await api("/bookings", {
        method: "POST",
        auth: true,
        body: {
          ground_id: Number(id),
          slot_id: slot.id,
          booking_date: slot.slot_date,
          total_price: Number(slot.price),
        },
      });

      setMessage("Booking successful.");
      const updatedSlots = await api(`/slots?ground_id=${id}`);
      setSlots(Array.isArray(updatedSlots) ? updatedSlots : []);
    } catch (err) {
      setError(err.message || "Booking failed");
    } finally {
      setBookingId(null);
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
      <div className="min-h-screen bg-[#070812] text-red-400 flex items-center justify-center px-6">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-pink-400">
            {ground?.name || "Ground Details"}
          </h1>
          <p className="mt-2 text-white/70">{ground?.location}</p>
          <p className="text-white/70">
            Amenities: {ground?.amenities || "Not available"}
          </p>
          <p className="text-white/70">
            Timings: {ground?.opening_time || "--:--"} - {ground?.closing_time || "--:--"}
          </p>
        </div>

        <Button
          onClick={() => navigate("/grounds")}
          className="bg-white/10 text-white hover:bg-white/15"
        >
          Back to Grounds
        </Button>
      </div>

      {ground?.image_url ? (
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10">
          <img
            src={ground.image_url}
            alt={ground.name}
            className="h-[260px] w-full object-cover"
          />
        </div>
      ) : null}

      {message ? (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      ) : null}

      <h2 className="mb-5 text-2xl font-bold">Available Sessions / Slots</h2>

      {slots.length === 0 ? (
        <p className="text-white/70">No slots found for this ground.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {slots.map((slot) => {
            const isAvailable = slot.status === "available";
            const isProcessing = bookingId === slot.id;

            return (
              <Card
                key={slot.id}
                className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)]"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="text-2xl font-black">
                    {slot.start_time} - {slot.end_time}
                  </div>

                  <p className="text-white/70">Date: {slot.slot_date}</p>

                  <p className="text-lg font-bold text-pink-400">
                    ₹{slot.price}
                  </p>

                  <p
                    className={
                      isAvailable ? "font-semibold text-green-400" : "font-semibold text-red-400"
                    }
                  >
                    {slot.status}
                  </p>

                  <Button
                    onClick={() => handleBook(slot)}
                    disabled={!isAvailable || isProcessing}
                    className="w-full bg-gradient-to-r from-pink-500 to-violet-500 disabled:opacity-50"
                  >
                    {isProcessing
                      ? "Booking..."
                      : isAvailable
                      ? "Book Now"
                      : "Unavailable"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}