import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearToken } from "../lib/api";
import {
  Zap, Compass, Lock, Trophy, LogOut, Menu, X, Calendar, Users, LayoutDashboard,
  MapPin, ClipboardList, UserCog, CalendarCheck, Settings, Home, BookOpen, 
  User, Bell, ChevronRight, Star, Clock, Phone, Mail, MessageCircle
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
  const [activeTab, setActiveTab] = useState("user");

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

  const userActions = [
    { icon: <Home className="h-5 w-5" />, label: "Home", path: "/home", color: "emerald" },
    { icon: <MapPin className="h-5 w-5" />, label: "Browse Grounds", path: "/grounds", color: "blue" },
    { icon: <BookOpen className="h-5 w-5" />, label: "My Bookings", path: "/my-bookings", color: "violet" },
    { icon: <User className="h-5 w-5" />, label: "My Profile", path: "/profile", color: "cyan" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", path: "/settings", color: "gray" },
  ];

  const adminActions = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", path: "/admin/dashboard", color: "pink" },
    { icon: <CalendarCheck className="h-5 w-5" />, label: "Today's Matches", path: "/admin/today", color: "emerald" },
    { icon: <ClipboardList className="h-5 w-5" />, label: "All Bookings", path: "/admin/bookings", color: "violet" },
    { icon: <MapPin className="h-5 w-5" />, label: "Manage Grounds", path: "/admin/grounds", color: "cyan" },
    { icon: <UserCog className="h-5 w-5" />, label: "Manage Users", path: "/admin/users", color: "yellow" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", path: "/settings", color: "gray" },
  ];

  const quickStats = [
    { icon: <Trophy className="h-6 w-6" />, label: "Active Grounds", value: "15+", color: "emerald" },
    { icon: <Users className="h-6 w-6" />, label: "Happy Players", value: "500+", color: "blue" },
    { icon: <Calendar className="h-6 w-6" />, label: "Bookings Today", value: "24", color: "violet" },
    { icon: <Star className="h-6 w-6" />, label: "Rating", value: "4.8 ★", color: "yellow" },
  ];

  const features = [
    { icon: <Zap className="h-8 w-8" />, title: "Instant Booking", desc: "Book your favorite ground in seconds", color: "emerald" },
    { icon: <Clock className="h-8 w-8" />, title: "24/7 Availability", desc: "Check slots anytime, anywhere", color: "blue" },
    { icon: <MessageCircle className="h-8 w-8" />, title: "WhatsApp Alerts", desc: "Get instant confirmations", color: "green" },
    { icon: <Users className="h-8 w-8" />, title: "Team Management", desc: "Manage umpires & groundsmen", color: "violet" },
  ];

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading CrickOps...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070812] to-[#0a0c16] text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="w-full px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/home")}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 font-black text-white shadow-lg">
                C
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                CrickOps
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {userActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  {action.icon}
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
              
              <div className="h-8 w-px bg-white/20 mx-2"></div>
              
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 ring-2 ring-emerald-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                    {String(user.name || user.email)[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{user.name || "User"}</p>
                  <p className="text-xs text-white/50">{user.email}</p>
                </div>
                {user.role === "admin" && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Admin
                  </Badge>
                )}
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
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
            <div className="md:hidden mt-4 pb-4 space-y-2">
              {userActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    navigate(action.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  {action.icon}
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-emerald-500">
                    {String(user.name || user.email)[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name || "User"}</p>
                  <p className="text-xs text-white/50">{user.email}</p>
                </div>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            Welcome back, <span className="text-emerald-400">{user.name || "Player"}!</span>
          </h1>
          <p className="text-white/60">Ready to play? Book your favorite cricket ground now.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="bg-zinc-900/50 border-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-${stat.color}-500/20`}>
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

        {/* User Actions Grid */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Home className="h-5 w-5 text-emerald-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {userActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="group p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all"
            >
              <div className={`text-${action.color}-400 mb-2 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <p className="font-medium text-sm">{action.label}</p>
            </button>
          ))}
        </div>

        {/* Admin Section */}
        {user.role === "admin" && (
          <>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-emerald-400" />
              Admin Controls
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {adminActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-center"
                >
                  <div className={`text-${action.color}-400 mb-2`}>
                    {action.icon}
                  </div>
                  <p className="font-medium text-sm">{action.label}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Features Section */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-emerald-400" />
          Why Choose CrickOps?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-zinc-900/50 border-white/10">
              <CardContent className="p-5 text-center">
                <div className={`inline-flex p-3 rounded-xl bg-${feature.color}-500/20 mb-3`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold mb-1">{feature.title}</h3>
                <p className="text-sm text-white/50">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Book Section */}
        <Card className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border-emerald-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold mb-2">Ready to Play?</h3>
                <p className="text-white/70">Book your slot now and start your cricket journey!</p>
              </div>
              <Button
                onClick={() => navigate("/grounds")}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold px-8 py-6 text-lg"
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
      <footer className="mt-12 border-t border-white/10 bg-black/50">
        <div className="w-full px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="text-xl font-bold">CrickOps</span>
              </div>
              <p className="text-sm text-white/50">
                Your complete cricket ground management platform. Book, manage, and play!
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="cursor-pointer hover:text-emerald-400" onClick={() => navigate("/grounds")}>Browse Grounds</li>
                <li className="cursor-pointer hover:text-emerald-400" onClick={() => navigate("/my-bookings")}>My Bookings</li>
                <li className="cursor-pointer hover:text-emerald-400" onClick={() => navigate("/profile")}>Profile</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex items-center gap-2"><Phone className="h-3 w-3" /> +91 9110546558</li>
                <li className="flex items-center gap-2"><Mail className="h-3 w-3" /> support@crickops.com</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <div className="p-2 rounded-full bg-white/5 cursor-pointer hover:bg-emerald-500/20 transition">📘</div>
                <div className="p-2 rounded-full bg-white/5 cursor-pointer hover:bg-emerald-500/20 transition">🐦</div>
                <div className="p-2 rounded-full bg-white/5 cursor-pointer hover:bg-emerald-500/20 transition">📸</div>
              </div>
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