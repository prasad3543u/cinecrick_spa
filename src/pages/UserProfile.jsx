import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearToken } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", dob: "", interest: "",
  });

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      setLoading(true);
      const data = await api("/me");
      setUser(data.user);
      setForm({
        name: data.user.name || "",
        dob: data.user.dob || "",
        interest: data.user.interest || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      setError("");
      const data = await api("/me/update", {
        method: "PATCH",
        body: form,
      });
      setUser(data.user);
      localStorage.setItem("cinecrick_user", JSON.stringify(data.user));
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-white px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-black text-pink-400">My Profile</h1>
        <Button onClick={() => navigate("/home")} className="bg-white/10 text-white hover:bg-white/15">
          Back to Home
        </Button>
      </div>

      <div className="max-w-lg mx-auto">
        <Card className="border-white/10 bg-zinc-950/55">
          <CardContent className="p-8">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-violet-500 text-white text-3xl font-black">
                  {String(user?.email || "U")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-white/60 text-sm">{user?.email}</p>
              <span className="mt-1 rounded-full bg-pink-500/20 border border-pink-500/30 px-3 py-0.5 text-xs text-pink-300 font-semibold">
                {user?.role || "user"}
              </span>
            </div>

            {message && (
              <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300 text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">Name</label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="bg-black/40 border-white/10"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-1 block">Date of Birth</label>
                <Input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  className="bg-black/40 border-white/10"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-1 block">Interest</label>
                <Select
                  value={form.interest}
                  onValueChange={(value) => setForm((p) => ({ ...p, interest: value }))}
                >
                  <SelectTrigger className="bg-black/40 border-white/10">
                    <SelectValue placeholder="Select Interest" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/10 text-white">
                    <SelectItem value="Cricket">Cricket</SelectItem>
                    <SelectItem value="Movies">Movies</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-1 block">Email</label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-black/20 border-white/5 text-white/40"
                />
                <p className="text-xs text-white/40 mt-1">Email cannot be changed</p>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500 font-bold"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <Button
                onClick={() => navigate("/my-bookings")}
                className="w-full bg-white/10 text-white hover:bg-white/15 mb-3"
              >
                View My Bookings
              </Button>
              <Button
                onClick={() => { clearToken(); navigate("/"); }}
                className="w-full bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}