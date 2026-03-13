import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearToken } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User, Lock, Palette, Bell, Trash2,
  ArrowLeft, Loader2, Sun, Moon, Monitor,
  Mail, Calendar, Heart, ShieldAlert, CheckCircle2,
  Eye, EyeOff
} from "lucide-react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile
  const [profile, setProfile] = useState({ name: "", dob: "", interest: "" });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password
  const [passwords, setPasswords] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });

  // Appearance
  const [theme, setTheme] = useState(() => localStorage.getItem("cinecrick_theme") || "dark");

  // Notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cinecrick_notifications")) || {
        bookingCreated: true,
        bookingConfirmed: true,
        bookingCancelled: true,
        promotions: false,
      };
    } catch {
      return { bookingCreated: true, bookingConfirmed: true, bookingCancelled: true, promotions: false };
    }
  });

  // Danger Zone
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api("/me");
        setUser(data.user);
        setProfile({
          name: data.user.name || "",
          dob: data.user.dob || "",
          interest: data.user.interest || "",
        });
      } catch {
        clearToken();
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  async function handleProfileSave(e) {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error("Name cannot be empty."); return; }
    try {
      setProfileLoading(true);
      toast.info("Saving profile...");
      const data = await api("/me/update", { method: "PATCH", body: profile });
      setUser(data.user);
      localStorage.setItem("cinecrick_user", JSON.stringify(data.user));
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    if (!passwords.current || !passwords.newPwd || !passwords.confirm) {
      toast.error("Please fill all password fields."); return;
    }
    if (passwords.newPwd.length < 6) {
      toast.error("New password must be at least 6 characters."); return;
    }
    if (passwords.newPwd !== passwords.confirm) {
      toast.error("New passwords do not match."); return;
    }
    try {
      setPwdLoading(true);
      toast.info("Updating password...");
      await api("/me/change_password", {
        method: "PATCH",
        body: {
          current_password: passwords.current,
          password: passwords.newPwd,
          password_confirmation: passwords.confirm,
        },
      });
      toast.success("Password changed successfully!");
      setPasswords({ current: "", newPwd: "", confirm: "" });
    } catch (err) {
      toast.error(err?.message || "Failed to change password.");
    } finally {
      setPwdLoading(false);
    }
  }

  function handleThemeChange(value) {
    setTheme(value);
    localStorage.setItem("cinecrick_theme", value);
    toast.success(`Theme set to ${value}. Full theming coming soon!`);
  }

  function handleNotifToggle(key) {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem("cinecrick_notifications", JSON.stringify(updated));
    toast.success("Notification preference saved.");
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== user?.email) {
      toast.error("Email doesn't match. Please type your email exactly."); return;
    }
    try {
      setDeleteLoading(true);
      toast.info("Deleting account...");
      await api("/me/delete", { method: "DELETE" });
      clearToken();
      toast.success("Account deleted.");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err?.message || "Failed to delete account.");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
      </div>
    );
  }

  const pwdLabels = {
    current: "Current Password",
    newPwd: "New Password",
    confirm: "Confirm New Password",
  };

  const pwdPlaceholders = {
    current: "Enter current password",
    newPwd: "Min. 6 characters",
    confirm: "Repeat new password",
  };

  return (
    <div className="min-h-screen bg-[#070812] text-white px-4 sm:px-6 lg:px-20 py-8">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button onClick={() => navigate("/home")} className="bg-white/10 hover:bg-white/15 text-white">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-black text-white">Settings</h1>
          <p className="text-white/50 text-sm mt-0.5">Manage your account preferences</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* ── SECTION 1: Profile ── */}
        <SettingsCard
          icon={<User className="h-5 w-5 text-pink-400" />}
          title="Profile"
          subtitle="Update your personal information"
          color="pink"
        >
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Full Name
              </Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-pink-500/40 h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-white/5 border-white/10 text-white/40 h-11 cursor-not-allowed"
              />
              <p className="text-xs text-white/30">Email cannot be changed.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Date of Birth
              </Label>
              <Input
                type="date"
                value={profile.dob}
                onChange={(e) => setProfile(p => ({ ...p, dob: e.target.value }))}
                className="bg-white/5 border-white/10 text-white h-11 [color-scheme:dark] focus-visible:ring-pink-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" /> Interest
              </Label>
              <Select
                value={profile.interest}
                onValueChange={(v) => setProfile(p => ({ ...p, interest: v }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:ring-pink-500/40">
                  <SelectValue placeholder="Select interest" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 text-white rounded-xl">
                  <SelectItem value="Cricket" className="focus:bg-pink-500/20">Cricket</SelectItem>
                  <SelectItem value="Movies" className="focus:bg-pink-500/20">Movies</SelectItem>
                  <SelectItem value="Both" className="focus:bg-pink-500/20">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={profileLoading}
              className="bg-gradient-to-r from-pink-500 to-violet-500 font-bold hover:opacity-95 disabled:opacity-60"
            >
              {profileLoading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                : <><CheckCircle2 className="mr-2 h-4 w-4" /> Save Profile</>
              }
            </Button>
          </form>
        </SettingsCard>

        {/* ── SECTION 2: Change Password ── */}
        <SettingsCard
          icon={<Lock className="h-5 w-5 text-violet-400" />}
          title="Change Password"
          subtitle="Update your account password"
          color="violet"
        >
          <form onSubmit={handlePasswordSave} className="space-y-4">
            {["current", "newPwd", "confirm"].map((field) => (
              <div key={field} className="space-y-1.5">
                <Label className="text-white/70 text-sm">
                  {pwdLabels[field]}
                </Label>
                <div className="relative">
                  <Input
                    type={showPwd[field] ? "text" : "password"}
                    value={passwords[field]}
                    onChange={(e) => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                    placeholder={pwdPlaceholders[field]}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-11 h-11 focus-visible:ring-violet-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => ({ ...p, [field]: !p[field] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                  >
                    {showPwd[field]
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />
                    }
                  </button>
                </div>
              </div>
            ))}

            <Button
              type="submit"
              disabled={pwdLoading}
              className="bg-gradient-to-r from-violet-500 to-cyan-500 font-bold hover:opacity-95 disabled:opacity-60"
            >
              {pwdLoading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                : <><Lock className="mr-2 h-4 w-4" /> Update Password</>
              }
            </Button>
          </form>
        </SettingsCard>

        {/* ── SECTION 3: Appearance ── */}
        <SettingsCard
          icon={<Palette className="h-5 w-5 text-cyan-400" />}
          title="Appearance"
          subtitle="Choose your display theme"
          color="cyan"
        >
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "dark", label: "Dark", icon: <Moon className="h-5 w-5" /> },
              { value: "light", label: "Light", icon: <Sun className="h-5 w-5" /> },
              { value: "system", label: "System", icon: <Monitor className="h-5 w-5" /> },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleThemeChange(t.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                  theme === t.value
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                    : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.icon}
                <span className="text-xs font-semibold">{t.label}</span>
                {theme === t.value && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-3">Full theme switching coming in a future update.</p>
        </SettingsCard>

        {/* ── SECTION 4: Notifications ── */}
        <SettingsCard
          icon={<Bell className="h-5 w-5 text-yellow-400" />}
          title="Notification Preferences"
          subtitle="Control when you get notified"
          color="yellow"
        >
          <div className="space-y-3">
            {[
              { key: "bookingCreated", label: "Booking Created", desc: "When you make a new booking request" },
              { key: "bookingConfirmed", label: "Booking Confirmed", desc: "When admin confirms your booking" },
              { key: "bookingCancelled", label: "Booking Cancelled", desc: "When a booking is cancelled" },
              { key: "promotions", label: "Promotions & Offers", desc: "Special deals and CineCrick updates" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotifToggle(item.key)}
                  className={`relative h-6 w-11 rounded-full transition-all duration-300 ${
                    notifications[item.key] ? "bg-yellow-500" : "bg-white/10"
                  }`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                    notifications[item.key] ? "left-[22px]" : "left-0.5"
                  }`} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-3">Email notifications require Batch B setup.</p>
        </SettingsCard>

        {/* ── SECTION 5: Danger Zone ── */}
        <SettingsCard
          icon={<ShieldAlert className="h-5 w-5 text-red-400" />}
          title="Danger Zone"
          subtitle="Irreversible account actions"
          color="red"
        >
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-4">
            <div>
              <p className="text-sm font-bold text-red-300">Delete Account</p>
              <p className="text-xs text-white/50 mt-1">
                This will permanently delete your account, all bookings, and data. This cannot be undone.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">
                Type <span className="text-red-300 font-mono">{user?.email}</span> to confirm
              </Label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type your email to confirm"
                className="bg-white/5 border-red-500/20 text-white placeholder:text-white/20 focus-visible:ring-red-500/40 h-11"
              />
            </div>
            <Button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteLoading || deleteConfirm !== user?.email}
              className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleteLoading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                : <><Trash2 className="mr-2 h-4 w-4" /> Delete My Account</>
              }
            </Button>
          </div>
        </SettingsCard>

      </div>
    </div>
  );
}

function SettingsCard({ icon, title, subtitle, color, children }) {
  const borders = {
    pink: "border-pink-500/20",
    violet: "border-violet-500/20",
    cyan: "border-cyan-500/20",
    yellow: "border-yellow-500/20",
    red: "border-red-500/20",
  };
  const tops = {
    pink: "bg-gradient-to-r from-pink-500 to-violet-500",
    violet: "bg-gradient-to-r from-violet-500 to-cyan-500",
    cyan: "bg-gradient-to-r from-cyan-500 to-blue-500",
    yellow: "bg-gradient-to-r from-yellow-500 to-orange-400",
    red: "bg-gradient-to-r from-red-500 to-rose-400",
  };
  return (
    <Card className={`border ${borders[color]} bg-zinc-950/55 overflow-hidden`}>
      <div className={`h-0.5 w-full ${tops[color]}`} />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className={`grid h-9 w-9 place-items-center rounded-xl border ${borders[color]} bg-white/5`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-xs text-white/40">{subtitle}</p>
          </div>
        </div>
        <Separator className="mb-5 bg-white/5" />
        {children}
      </CardContent>
    </Card>
  );
}