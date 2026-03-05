import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, KeyRound, Mail } from "lucide-react";

import { api, setToken, getToken } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const navigate = useNavigate();

  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });

  // Forgot password UI (demo)
  const [openForgot, setOpenForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  // ---- Load remembered email + remember flag ----
  useEffect(() => {
    const remembered = localStorage.getItem("cinecrick_remember") === "true";
    const rememberedEmail =
      localStorage.getItem("cinecrick_remember_email") || "";

    if (remembered) {
      setRemember(true);
      setForm((p) => ({ ...p, email: rememberedEmail }));
    }
  }, []);

  // ---- If already logged in (token exists), go home ----
  useEffect(() => {
    const token = getToken();
    if (token) navigate("/home", { replace: true });
  }, [navigate]);

  const savedEmailHint = useMemo(() => {
    return localStorage.getItem("cinecrick_remember_email") || "";
  }, [openForgot]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function persistRemember(choice, email) {
    localStorage.setItem("cinecrick_remember", choice ? "true" : "false");
    if (choice) localStorage.setItem("cinecrick_remember_email", email || "");
    else localStorage.removeItem("cinecrick_remember_email");
  }

  // ✅ REAL LOGIN (Rails API)
  async function handleSubmit(e) {
    e.preventDefault();

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      // ✅ store token + user (important)
      setToken(data.token);
      localStorage.setItem("cinecrick_user", JSON.stringify(data.user));
      localStorage.setItem("cinecrick_logged_in", "true");

      // remember me
      persistRemember(remember, email);

      navigate("/home", { replace: true });
    } catch (err) {
      alert(err?.message || "Login failed");
    }
  }

  function openForgotDialog() {
    setForgotMsg("");
    setForgotEmail(form.email.trim() || savedEmailHint || "");
    setOpenForgot(true);
  }

  // Demo only (real reset needs backend email service)
  function handleForgotSend() {
    const email = forgotEmail.trim();
    if (!email) {
      setForgotMsg("Please enter your registered email.");
      return;
    }

    setForgotMsg(
      "Reset link sent (demo). In real apps, an email will be sent to your inbox."
    );
  }

  return (
    <div className="relative min-h-screen bg-[#070812] text-white overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-10 h-[520px] w-[520px] rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute top-10 right-[-120px] h-[560px] w-[560px] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,.65)_75%)]" />
      </div>

      <div className="relative w-full px-6 lg:px-14 py-10 flex items-center justify-between">
        <div className="text-4xl font-black tracking-tight text-pink-400">
          CineCrick
        </div>

        <div className="hidden sm:flex items-center gap-2 text-white/70 text-sm">
          <Mail className="h-4 w-4" />
          Movies + Cricket in one place
        </div>
      </div>

      <div className="relative flex items-center justify-center px-6 pb-14">
        <Card className="w-full max-w-md border-white/10 bg-zinc-950/55 shadow-[0_28px_80px_rgba(0,0,0,.65)] rounded-2xl">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="text-2xl font-black">Welcome back</div>
              <p className="text-sm text-white/70">
                Login to continue to CineCrick.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter registered email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-white/75 cursor-pointer select-none">
                  <Checkbox
                    checked={remember}
                    onCheckedChange={(v) => setRemember(Boolean(v))}
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={openForgotDialog}
                  className="text-sm text-pink-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button className="w-full bg-gradient-to-r from-pink-500 to-violet-500 font-bold hover:opacity-95 h-11">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>

              <p className="text-sm text-white/70 text-center">
                New user?{" "}
                <Link className="text-pink-400 hover:underline" to="/signup">
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
              <KeyRound className="h-5 w-5 text-pink-400" />
              Forgot password
            </DialogTitle>
            <DialogDescription className="text-white/65">
              Demo only. Real reset needs backend email service.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Registered Email</Label>
            <Input
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />

            {savedEmailHint ? (
              <p className="text-xs text-white/55">
                Hint: remembered email is{" "}
                <span className="text-white/80 font-semibold">
                  {savedEmailHint}
                </span>
              </p>
            ) : (
              <p className="text-xs text-white/55">
                No remembered email found yet.
              </p>
            )}

            {forgotMsg ? (
              <p className="text-sm mt-2 text-pink-300">{forgotMsg}</p>
            ) : null}
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <Button
              variant="secondary"
              className="bg-white/10 border border-white/10 text-white hover:bg-white/15"
              onClick={() => setOpenForgot(false)}
              type="button"
            >
              Close
            </Button>

            <Button
              onClick={handleForgotSend}
              className="bg-gradient-to-r from-pink-500 to-violet-500 font-bold"
              type="button"
            >
              Send reset link (demo)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}