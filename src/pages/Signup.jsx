import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Trophy, User, Mail, Lock, Calendar, Phone, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api, setToken } from "../lib/api";

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "bg-red-500" };
  if (score === 2) return { score, label: "Fair",   color: "bg-yellow-500" };
  if (score === 3) return { score, label: "Good",   color: "bg-blue-500" };
  return             { score, label: "Strong", color: "bg-green-500" };
}

export default function Signup() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", dob: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

  function handleChange(e) {
    const { name, value } = e.target;
    setError("");
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.dob || !form.phone) {
      setError("Please fill all fields."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    try {
      setLoading(true); setError("");
      const data = await api("/auth/signup", {
        method: "POST",
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          password_confirmation: form.password,
          dob: form.dob,
          phone: form.phone.trim(),
        },
      });
      setToken(data.token);
      localStorage.setItem("cinecrick_user", JSON.stringify(data.user));
      localStorage.setItem("cinecrick_logged_in", "true");
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">

      {/* Background — full cricket */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[url('/cricket.jpg')] bg-cover bg-center scale-105 animate-[slowZoom_20s_linear_infinite]" />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_0%,rgba(16,185,129,.18),transparent_60%)]" />

      {/* Logo */}
      <div className="relative z-20 pt-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 font-black text-lg shadow-[0_16px_35px_rgba(16,185,129,.4)]">
            C
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]">
            CrickOps
          </h1>
        </div>
        <p className="text-white/50 text-sm flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-emerald-400" />
          Cricket Ground Management Platform
        </p>
      </div>

      {/* Card */}
      <div className="relative z-20 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md bg-black/70 backdrop-blur-2xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-3xl animate-fadeUp">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black">Create Account</h2>
              <p className="text-sm text-white/50 mt-1">Join CrickOps today — it's free.</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                <span className="shrink-0">⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-emerald-400" /> Full Name
                </Label>
                <Input name="name" type="text" placeholder="Your full name"
                  onChange={handleChange} value={form.name} autoComplete="off"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/40 h-11"
                  required />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-emerald-400" /> Email Address
                </Label>
                <Input name="email" type="email" placeholder="you@example.com"
                  onChange={handleChange} value={form.email} autoComplete="off"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/40 h-11"
                  required />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" /> Password
                </Label>
                <div className="relative">
                  <Input name="password" type={showPwd ? "text" : "password"}
                    placeholder="Min. 6 characters" onChange={handleChange}
                    value={form.password} autoComplete="new-password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/40 pr-11 h-11"
                    required />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : "bg-white/10"}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      strength.label === "Weak"   ? "text-red-400"    :
                      strength.label === "Fair"   ? "text-yellow-400" :
                      strength.label === "Good"   ? "text-blue-400"   : "text-green-400"}`}>
                      Password strength: {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* DOB */}
              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Date of Birth
                </Label>
                <Input type="date" name="dob" onChange={handleChange} value={form.dob}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-emerald-500/40 h-11 [color-scheme:dark]"
                  required />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" /> Phone Number
                </Label>
                <Input name="phone" type="tel" placeholder="+91 9999999999"
                  onChange={handleChange} value={form.phone} autoComplete="off"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/40 h-11"
                  required />
                <p className="text-xs text-white/30">Used for WhatsApp booking confirmations.</p>
              </div>

              {/* Submit */}
              <Button type="submit" disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 font-bold hover:opacity-95 transition-all disabled:opacity-60 text-base mt-2">
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                  : "Get Started →"
                }
              </Button>

              <p className="text-sm text-white/60 text-center">
                Already have an account?{" "}
                <Link to="/" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
                  Login
                </Link>
              </p>

              <p className="text-center text-xs text-white/40">
                By signing up, you agree to CrickOps Terms & Privacy Policy.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes slowZoom {
          0%   { transform: scale(1.05); }
          50%  { transform: scale(1.1);  }
          100% { transform: scale(1.05); }
        }
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0);    }
        }
        .animate-fadeUp { animation: fadeUp 0.8s ease forwards; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.05) inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}