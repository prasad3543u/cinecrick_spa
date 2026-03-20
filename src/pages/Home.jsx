import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearToken } from "../lib/api";
import {
  Zap, Compass, Lock, Trophy, LogOut, Menu, X, Calendar, Users, LayoutDashboard,
  MapPin, ClipboardList, UserCog, CalendarCheck, Settings, BookOpen,
  User, Bell, ChevronRight, Star, Clock, Phone, Mail, MessageCircle,
  ArrowRight, Shield, CheckCircle, Sparkles, TrendingUp, Award, Sun, Moon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";


export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadUser(retry = 0) {
      try {
        const data = await api("/me");
        if (!cancelled) {
          setUser(data.user);
          localStorage.setItem("cinecrick_user", JSON.stringify(data.user));
          setLoadingUser(false);
        }
      } catch (err) {
        if (retry < 3 && !cancelled) {
          setTimeout(() => loadUser(retry + 1), 3000);
          return;
        }
        if (!cancelled) {
          clearToken();
          setLoadingUser(false);
          navigate("/", { replace: true });
        }
      }
    }
    loadUser();
    return () => { cancelled = true; };
  }, [navigate]);

  function logout() {
    clearToken();
    navigate("/", { replace: true });
  }

  // Navigation sections
  const mainNavigation = [
    { 
      icon: <MapPin className="h-6 w-6" />, 
      label: "Find Grounds", 
      description: "Browse available cricket grounds",
      path: "/grounds",
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400"
    },
    { 
      icon: <Calendar className="h-6 w-6" />, 
      label: "My Bookings", 
      description: "View and manage your bookings",
      path: "/my-bookings",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400"
    },
    { 
      icon: <User className="h-6 w-6" />, 
      label: "My Profile", 
      description: "Update your personal info",
      path: "/profile",
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-400"
    },
    { 
      icon: <Settings className="h-6 w-6" />, 
      label: "Settings", 
      description: "Account preferences",
      path: "/settings",
      color: "from-gray-500 to-slate-600",
      bgColor: "bg-gray-500/10",
      textColor: "text-gray-400"
    },
  ];

  const adminNavigation = [
    { 
      icon: <LayoutDashboard className="h-6 w-6" />, 
      label: "Dashboard", 
      description: "View platform analytics",
      path: "/admin/dashboard",
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-400"
    },
    { 
      icon: <CalendarCheck className="h-6 w-6" />, 
      label: "Today's Matches", 
      description: "Manage today's games",
      path: "/admin/today",
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400"
    },
    { 
      icon: <ClipboardList className="h-6 w-6" />, 
      label: "All Bookings", 
      description: "Manage all bookings",
      path: "/admin/bookings",
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-400"
    },
    { 
      icon: <MapPin className="h-6 w-6" />, 
      label: "Manage Grounds", 
      description: "Add/edit cricket grounds",
      path: "/admin/grounds",
      color: "from-cyan-500 to-teal-600",
      bgColor: "bg-cyan-500/10",
      textColor: "text-cyan-400"
    },
    { 
      icon: <UserCog className="h-6 w-6" />, 
      label: "Manage Users", 
      description: "Control user roles",
      path: "/admin/users",
      color: "from-yellow-500 to-amber-600",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-400"
    },
    { 
      icon: <Settings className="h-6 w-6" />, 
      label: "Settings", 
      description: "Admin preferences",
      path: "/settings",
      color: "from-gray-500 to-slate-600",
      bgColor: "bg-gray-500/10",
      textColor: "text-gray-400"
    },
  ];

  const features = [
    { icon: <Zap className="h-5 w-5" />, title: "Instant Booking", desc: "Book in seconds" },
    { icon: <Clock className="h-5 w-5" />, title: "24/7 Access", desc: "Any time, any day" },
    { icon: <MessageCircle className="h-5 w-5" />, title: "WhatsApp Alerts", desc: "Instant updates" },
    { icon: <Users className="h-5 w-5" />, title: "Team Management", desc: "Umpires & staff" },
    { icon: <Shield className="h-5 w-5" />, title: "Secure", desc: "Safe payments" },
    { icon: <Trophy className="h-5 w-5" />, title: "Premium Grounds", desc: "Top locations" },
  ];

  const stats = [
    { value: "50+", label: "Cricket Grounds", icon: <MapPin className="h-4 w-4" /> },
    { value: "1000+", label: "Happy Players", icon: <Users className="h-4 w-4" /> },
    { value: "500+", label: "Bookings/Month", icon: <Calendar className="h-4 w-4" /> },
    { value: "4.8", label: "Rating", icon: <Star className="h-4 w-4" /> },
  ];

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading CrickOps...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/home")}>
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-md opacity-50 group-hover:opacity-100 transition"></div>
                <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                CrickOps
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <NavButton icon={<Home className="h-4 w-4" />} label="Home" active onClick={() => navigate("/home")} />
              <NavButton icon={<MapPin className="h-4 w-4" />} label="Grounds" onClick={() => navigate("/grounds")} />
              <NavButton icon={<Calendar className="h-4 w-4" />} label="Bookings" onClick={() => navigate("/my-bookings")} />
              <NavButton icon={<User className="h-4 w-4" />} label="Profile" onClick={() => navigate("/profile")} />
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-sm text-white/80">{user.email}</span>
                {user.role === "admin" && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    Admin
                  </Badge>
                )}
              </div>
              <Avatar className="h-9 w-9 ring-2 ring-emerald-500/30">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                  {String(user.name || user.email)[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                onClick={logout}
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-white/10 mt-2">
              <MobileNavItem icon={<Home className="h-5 w-5" />} label="Home" onClick={() => { navigate("/home"); setMobileMenuOpen(false); }} />
              <MobileNavItem icon={<MapPin className="h-5 w-5" />} label="Grounds" onClick={() => { navigate("/grounds"); setMobileMenuOpen(false); }} />
              <MobileNavItem icon={<Calendar className="h-5 w-5" />} label="My Bookings" onClick={() => { navigate("/my-bookings"); setMobileMenuOpen(false); }} />
              <MobileNavItem icon={<User className="h-5 w-5" />} label="Profile" onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} />
              <MobileNavItem icon={<Settings className="h-5 w-5" />} label="Settings" onClick={() => { navigate("/settings"); setMobileMenuOpen(false); }} />
              <div className="pt-3 border-t border-white/10 mt-2">
                <MobileNavItem icon={<LogOut className="h-5 w-5" />} label="Logout" onClick={logout} danger />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent rounded-3xl"></div>
          <div className="relative text-center py-12">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-4">
              {greeting}, Player!
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                {user.name?.split(" ")[0] || "Player"}
              </span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Ready for your next match? Book the best cricket grounds, manage your team, and enjoy the game.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Button 
                onClick={() => navigate("/grounds")}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-6 text-lg"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Find a Ground
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                onClick={() => navigate("/my-bookings")}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                <Calendar className="mr-2 h-5 w-5" />
                View Bookings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, idx) => (
            <Card key={idx} className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-white/50">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Navigation Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {mainNavigation.map((item, idx) => (
              <NavCard
                key={idx}
                icon={item.icon}
                label={item.label}
                description={item.description}
                onClick={() => navigate(item.path)}
                color={item.color}
                bgColor={item.bgColor}
                textColor={item.textColor}
              />
            ))}
          </div>
        </div>

        {/* Admin Section */}
        {user.role === "admin" && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                Admin Controls
              </h2>
              <Badge className="bg-emerald-500/20 text-emerald-300">
                Admin Access
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {adminNavigation.map((item, idx) => (
                <AdminCard
                  key={idx}
                  icon={item.icon}
                  label={item.label}
                  description={item.description}
                  onClick={() => navigate(item.path)}
                  color={item.color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-400" />
            Why Choose CrickOps?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="inline-flex p-2 rounded-lg bg-emerald-500/20 mb-2">
                  {feature.icon}
                </div>
                <p className="font-semibold text-sm">{feature.title}</p>
                <p className="text-xs text-white/40">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <Card className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 border-emerald-500/30">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold mb-2">Ready to Play?</h3>
                <p className="text-white/60">Book your slot now and start your cricket journey!</p>
              </div>
              <Button
                onClick={() => navigate("/grounds")}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold px-8 py-6"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Browse Grounds
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="text-lg font-bold">CrickOps</span>
              </div>
              <p className="text-sm text-white/40">
                Your complete cricket ground management platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="cursor-pointer hover:text-emerald-400 transition" onClick={() => navigate("/grounds")}>Browse Grounds</li>
                <li className="cursor-pointer hover:text-emerald-400 transition" onClick={() => navigate("/my-bookings")}>My Bookings</li>
                <li className="cursor-pointer hover:text-emerald-400 transition" onClick={() => navigate("/profile")}>My Profile</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2"><Phone className="h-3 w-3" /> +91 9110546558</li>
                <li className="flex items-center gap-2"><Mail className="h-3 w-3" /> support@crickops.com</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="cursor-pointer hover:text-emerald-400 transition">Privacy Policy</li>
                <li className="cursor-pointer hover:text-emerald-400 transition">Terms of Service</li>
                <li className="cursor-pointer hover:text-emerald-400 transition">Refund Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-white/30">
            © {new Date().getFullYear()} CrickOps. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        active ? "text-emerald-400 bg-emerald-500/10" : "text-white/60 hover:text-white hover:bg-white/10"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        danger ? "text-red-400 hover:bg-red-500/10" : "text-white/80 hover:bg-white/10"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function NavCard({ icon, label, description, onClick, color, bgColor, textColor }) {
  return (
    <button
      onClick={onClick}
      className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left hover:-translate-y-1"
    >
      <div className={`inline-flex p-3 rounded-xl ${bgColor} mb-3 group-hover:scale-110 transition-transform`}>
        <div className={textColor}>{icon}</div>
      </div>
      <h3 className="font-bold text-lg mb-1">{label}</h3>
      <p className="text-sm text-white/40">{description}</p>
    </button>
  );
}

function AdminCard({ icon, label, description, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all text-center hover:-translate-y-1"
    >
      <div className={`inline-flex p-2 rounded-lg bg-${color.split("-")[1]}-500/10 mb-2`}>
        <div className={`text-${color.split("-")[1]}-400`}>{icon}</div>
      </div>
      <p className="font-semibold text-xs">{label}</p>
      <p className="text-xs text-white/30 hidden lg:block">{description}</p>
    </button>
  );
}