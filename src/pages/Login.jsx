import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, KeyRound, Mail, Loader2, Trophy } from "lucide-react";

import { api, setToken, getToken } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

export default function Login() {
  const navigate = useNavigate();

  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  useEffect(() => {
    const remembered = localStorage.getItem("cinecrick_remember") === "true";
    const rememberedEmail = localStorage.getItem("cinecrick_remember_email") || "";
    if (remembered) {
      setRemember(true);
      setForm((p) => ({ ...p, email: rememberedEmail }));
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) navigate("/home", { replace: true });
  }, [navigate]);

  const savedEmailHint = useMemo(() => {
    return localStorage.getItem("cinecrick_remember_email") || "";
  }, [openForgot]);

  function handleChange(e) {
    const { name, value } = e.target;
    setError("");
    setForm((p) => ({ ...p, [name]: value }));
  }

  function persistRemember(choice, email) {
    localStorage.setItem("cinecrick_remember", choice ? "true" : "false");
    if (choice) localStorage.setItem("cinecrick_remember_email", email || "");
    else localStorage.removeItem("cinecrick_remember_email");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const email = form.email.trim();
    const password = form.password;
    if (!email || !password) { setError("Please enter email and password."); return; }

    try {
      setLoading(true);
      setError("");
      const data = await api("/auth/login", { method: "POST", body: { email, password } });
      setToken(data.token);
      localStorage.setItem("cinecrick_user", JSON.stringify(data.user));
      localStorage.setItem("cinecrick_logged_in", "true");
      persistRemember(remember, email);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function openForgotDialog() {
    setForgotMsg("");
    setForgotEmail(form.email.trim() || savedEmailHint || "");
    setOpenForgot(true);
  }

  function handleForgotSend() {
    const email = forgotEmail.trim();
    if (!email) { setForgotMsg("Please enter your registered email."); return; }
    setForgotMsg("Reset link sent (demo). In production, an email will be sent.");
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* Background — full cricket */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[url('/cricket.jpg')] bg-cover bg-center scale-105 animate-[slowZoom_20s_linear_infinite]" />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Green glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_0%,rgba(16,185,129,.18),transparent_60%)]" />

      {/* Logo */}
      <div className="relative z-20 pt-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 font-black text-lg shadow-[0_16px_35px_rgba(16,185,129,.4)]">
            C
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]">
            CrickOps
          </h1>
        </div>
        <p className="text-white/50 text-sm flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-emerald-400" />
          Cricket Ground Management Platform
        </p>
      </div>

      {/* Card */}
      <div className="relative z-20 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md bg-black/70 backdrop-blur-2xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-3xl animate-fadeUp">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black">Welcome back</h2>
              <p className="text-sm text-white/60 mt-1">Login to continue to CrickOps.</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                <span className="shrink-0">⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-emerald-400" /> Email
                </Label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="new-email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/40 h-11"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-emerald-400" /> Password
                </Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/40 pr-11 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer select-none">
                  <Checkbox
                    checked={remember}
                    onCheckedChange={(v) => setRemember(Boolean(v))}
                    className="border-white/20"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={openForgotDialog}
                  className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline transition"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 font-bold hover:opacity-95 transition disabled:opacity-60 text-base"
              >
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</>
                  : <><LogIn className="mr-2 h-4 w-4" /> Login</>
                }
              </Button>

              <p className="text-sm text-white/60 text-center">
                New user?{" "}
                <Link className="text-emerald-400 hover:text-emerald-300 font-semibold transition" to="/signup">
                  Create account
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={openForgot} onOpenChange={setOpenForgot}>
        <DialogContent className="sm:max-w-md bg-zinc-950 text-white border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-400" />
              Forgot password
            </DialogTitle>
            <DialogDescription className="text-white/55">
              Demo only. Real reset requires backend email service.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-white/80">Registered Email</Label>
            <Input
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            {savedEmailHint && (
              <p className="text-xs text-white/50">
                Remembered email: <span className="text-white/80 font-semibold">{savedEmailHint}</span>
              </p>
            )}
            {forgotMsg && <p className="text-sm text-emerald-300 mt-1">{forgotMsg}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary"
              className="bg-white/10 border border-white/10 text-white hover:bg-white/15"
              onClick={() => setOpenForgot(false)} type="button">
              Close
            </Button>
            <Button onClick={handleForgotSend}
              className="bg-gradient-to-r from-green-500 to-emerald-600 font-bold" type="button">
              Send reset link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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