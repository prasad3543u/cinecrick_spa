import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Film, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { api, setToken } from "../lib/api";

export default function Signup() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    dob: "",
    interest: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setError("");
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password || !form.dob || !form.interest) {
      setError("Please fill all fields");
      return;
    }

    const email = form.email.trim();
    const password = form.password;
    const name = email.includes("@") ? email.split("@")[0] : email;

    try {
      setLoading(true);
      setError("");

      const data = await api("/auth/signup", {
        method: "POST",
        body: {
          name,
          email,
          password,
          password_confirmation: password,
          dob: form.dob,
          interest: form.interest,
        },
      });

      setToken(data.token);
      localStorage.setItem("cinecrick_user", JSON.stringify(data.user));
      localStorage.setItem("cinecrick_logged_in", "true");

      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* LEFT IMAGE */}
      <div className="absolute left-0 top-0 h-full w-1/2 hidden lg:block">
        <div className="h-full w-full bg-[url('/cricket.jpg')] bg-cover bg-center scale-105 animate-[slowZoom_20s_linear_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      </div>

      {/* RIGHT IMAGE */}
      <div className="absolute right-0 top-0 h-full w-1/2 hidden lg:block">
        <div className="h-full w-full bg-[url('/movies.jpg')] bg-cover bg-center scale-105 animate-[slowZoom_20s_linear_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-transparent" />
      </div>

      {/* CENTER GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/90 via-[#0f172a]/95 to-[#0b1220]/95" />

      {/* LOGO */}
      <h1 className="relative z-20 pt-8 text-center text-5xl font-extrabold tracking-tight text-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]">
        CineCrick
      </h1>

      {/* CENTER CARD */}
      <div className="relative z-20 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md bg-black/70 backdrop-blur-2xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-3xl animate-fadeUp">
          <CardContent className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Create Account</h2>
              <p className="text-sm text-white/60">
                Movies <Film size={14} className="inline mx-1" />
                + Cricket <Trophy size={14} className="inline mx-1" /> in one place
              </p>
            </div>

            {error && (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={handleChange}
                value={form.email}
                className="bg-black/40 border-white/10 focus-visible:ring-pink-500/40"
                required
              />

              <div className="relative">
                <Input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Password"
                  onChange={handleChange}
                  value={form.password}
                  className="bg-black/40 border-white/10 pr-10 focus-visible:ring-pink-500/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Input
                type="date"
                name="dob"
                onChange={handleChange}
                value={form.dob}
                className="bg-black/40 border-white/10 focus-visible:ring-pink-500/40"
                required
              />

              <Select
                value={form.interest}
                onValueChange={(value) =>
                  setForm((p) => ({ ...p, interest: value }))
                }
              >
                <SelectTrigger className="bg-black/40 border-white/10 focus:ring-pink-500/40">
                  <SelectValue placeholder="Select Interest" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 backdrop-blur-xl border border-white/10 text-white rounded-xl shadow-2xl">
                  <SelectItem value="Cricket" className="focus:bg-pink-500 focus:text-white">
                    Cricket
                  </SelectItem>
                  <SelectItem value="Movies" className="focus:bg-pink-500 focus:text-white">
                    Movies
                  </SelectItem>
                  <SelectItem value="Both" className="focus:bg-pink-500 focus:text-white">
                    Both
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* ✅ FIXED: added type="submit" */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-pink-500 to-rose-400 font-semibold hover:scale-[1.02] transition-all duration-300 shadow-lg disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Get Started →"}
              </Button>

              <p className="text-sm text-white/70 text-center mt-4">
                Already have an account?{" "}
                <Link
                  to="/"
                  className="text-pink-400 hover:text-pink-300 font-semibold transition"
                >
                  Login
                </Link>
              </p>

              <p className="text-center text-xs text-white/50">
                By signing up, you agree to CineCrick Terms & Privacy Policy.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <style>
        {`
          @keyframes slowZoom {
            0% { transform: scale(1.05); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1.05); }
          }
          @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeUp {
            animation: fadeUp 0.8s ease forwards;
          }
        `}
      </style>
    </div>
  );
}