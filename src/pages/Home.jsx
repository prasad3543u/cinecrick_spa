import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearToken } from "../lib/api";
import {
  Zap, Compass, Lock, Film as FilmIcon, Trophy,
  ChevronDown, Search, LogOut, Menu, X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu, NavigationMenuItem, NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList,
} from "@/components/ui/command";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  function handleMenuPick(category, item) {
    setMobileMenuOpen(false);
    if (category === "Account" && item === "Logout") { logout(); return; }
    if (item === "Grounds" || item === "Ground Booking") { navigate("/grounds"); return; }
    if (item === "My Bookings") { navigate("/my-bookings"); return; }
    if (item === "Admin Grounds") { navigate("/admin/grounds"); return; }
    if (item === "Admin Bookings") { navigate("/admin/bookings"); return; }
    if (item === "Admin Dashboard") { navigate("/admin/dashboard"); return; }
    if (item === "Profile") { navigate("/profile"); return; }
    if (item === "Admin Users") { navigate("/admin/users"); return; }
  }

  const MENUS = useMemo(() => {
    const base = {
      Movies: ["Now Showing", "Upcoming", "Top Rated", "Genres", "Offers", "Near Me", "Trailers", "Reviews"],
      Cricket: ["Grounds", "Live Matches", "Scores", "Schedule", "Teams", "Highlights", "Rankings", "Stats"],
      Bookings: ["Ground Booking", "My Bookings", "Cancel Booking", "Refund Status", "Payment Help", "Support", "Offers"],
      News: ["Sports News", "Film News", "Trending", "Match Reports", "Box Office", "Interviews", "Reviews", "Rumours"],
      Events: ["Concerts", "Standup", "Theatre", "Festivals", "Kids", "Workshops", "Online", "Nearby"],
      Account: user?.role === "admin"
        ? ["Profile", "Admin Dashboard", "Admin Users", "Admin Grounds", "Admin Bookings", "My Bookings", "Settings", "Logout"]
        : ["Profile", "My Bookings", "Settings", "Logout"],
    };
    return base;
  }, [user]);

  const slides = useMemo(() => [
    {
      title: "Book Cricket Grounds Instantly",
      subtitle: "Check slots, compare prices, and confirm bookings in minutes",
      img: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=1800&q=80",
      tag: "Cricket",
    },
    {
      title: "Track Available Time Slots",
      subtitle: "Morning, evening, and premium hours with live slot status",
      img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1800&q=80",
      tag: "Booking",
    },
    {
      title: "Manage Your Bookings Easily",
      subtitle: "View booked slots, prices, and booking history in one place",
      img: "https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=1800&q=80",
      tag: "My Bookings",
    },
  ], []);

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
        <div className="text-white/70">Waking server... please wait</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070812] text-white">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-10 h-[520px] w-[520px] rounded-full bg-pink-500/20 blur-3xl animate-[blob_14s_infinite]" />
        <div className="absolute top-10 right-[-120px] h-[560px] w-[560px] rounded-full bg-violet-500/20 blur-3xl animate-[blob_18s_infinite]" />
        <div className="absolute bottom-[-220px] left-1/3 h-[620px] w-[620px] rounded-full bg-cyan-500/10 blur-3xl animate-[blob_20s_infinite]" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_0%,rgba(255,46,99,.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_100%,rgba(124,58,237,.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,.65)_75%)]" />
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.08); }
          66% { transform: translate(-20px, 30px) scale(0.96); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/55 backdrop-blur-xl">
        <div className="w-full px-4 lg:px-14 py-3">

          {/* Top row */}
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 font-black text-sm shadow-[0_16px_35px_rgba(255,46,99,.22)]">
                C
              </div>
              <div className="text-2xl font-black tracking-tight">CineCrick</div>
            </div>

            {/* Desktop user info */}
            <div className="hidden md:flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,.14)]" />
              <span className="max-w-[200px] truncate text-sm text-white/80">{user.email || "—"}</span>
              {user.role === "admin" && (
                <span className="rounded-full bg-pink-500/20 border border-pink-500/30 px-2 py-0.5 text-xs text-pink-300 font-semibold">
                  Admin
                </span>
              )}
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/10 text-white/90">
                  {String(user.email || "U")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                onClick={logout}
                size="sm"
                className="h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 font-bold hover:opacity-95"
              >
                <LogOut className="mr-1 h-3 w-3" />
                Logout
              </Button>
            </div>

            {/* Mobile: avatar + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {user.role === "admin" && (
                <span className="rounded-full bg-pink-500/20 border border-pink-500/30 px-2 py-0.5 text-xs text-pink-300 font-semibold">
                  Admin
                </span>
              )}
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/10 text-white/90">
                  {String(user.email || "U")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Desktop nav menus */}
          <div className="hidden md:block mt-4">
            <NavigationMenu>
              <NavigationMenuList className="flex flex-wrap gap-2">
                {Object.keys(MENUS).map((k) => (
                  <NavigationMenuItem key={k}>
                    <MenuDropdown label={k} items={MENUS[k]} onPick={(item) => handleMenuPick(k, item)} />
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 space-y-2">
              {/* User info */}
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-white/70 truncate">{user.email}</span>
              </div>

              {/* Menu items flat list */}
              {Object.entries(MENUS).map(([category, items]) => (
                <div key={category}>
                  <p className="text-xs text-white/40 uppercase tracking-widest px-2 pt-2 pb-1">{category}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {items.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleMenuPick(category, item)}
                        className="text-left rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Logout */}
              <div className="pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Slider */}
      <section className="w-full px-4 lg:px-14 pt-4">
        <Card className="overflow-hidden border-white/10 bg-zinc-950/40 shadow-[0_28px_80px_rgba(0,0,0,.65)]">
          <CardContent className="relative p-0">
            <img
              src={slides[slide].img}
              alt={slides[slide].title}
              className="h-[280px] sm:h-[380px] lg:h-[460px] w-full object-cover saturate-125 contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent p-4 sm:p-7">
              <Badge className="bg-pink-500/15 text-pink-200 border border-pink-500/25">
                {slides[slide].tag}
              </Badge>
              <div className="mt-2 max-w-2xl">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight drop-shadow">
                  {slides[slide].title}
                </h1>
                <p className="mt-1 text-white/80 text-sm sm:text-lg">{slides[slide].subtitle}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  onClick={() => navigate("/grounds")}
                  className="bg-gradient-to-r from-pink-500 to-violet-500 font-bold hover:opacity-95 text-sm"
                >
                  Explore Grounds
                </Button>
                <Button
                  onClick={() => navigate("/my-bookings")}
                  variant="secondary"
                  className="bg-white/10 text-white hover:bg-white/15 text-sm"
                >
                  My Bookings
                </Button>
              </div>

              <div className="absolute bottom-4 left-4 sm:left-7 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`h-2 w-2 rounded-full transition ${i === slide ? "bg-white" : "bg-white/30 hover:bg-white/50"}`}
                    type="button"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSlide((s) => (s - 1 + slides.length) % slides.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 grid h-8 w-8 sm:h-11 sm:w-11 place-items-center rounded-full border border-white/10 bg-black/40 text-xl hover:bg-black/60"
              >‹</button>

              <button
                type="button"
                onClick={() => setSlide((s) => (s + 1) % slides.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 sm:h-11 sm:w-11 place-items-center rounded-full border border-white/10 bg-black/40 text-xl hover:bg-black/60"
              >›</button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* About section */}
      <section className="w-full px-4 lg:px-14 py-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <DarkCard title="About CineCrick">
            <p className="text-white/80 leading-relaxed text-sm sm:text-base">
              CineCrick is a single place for <b>movies</b>, <b>cricket</b>, and{" "}
              <b>events</b>. Discover trending content, check schedules, and manage
              bookings with a premium experience.
            </p>
            <div className="mt-4 space-y-1 text-sm text-white">
              <p><span className="font-semibold text-pink-400">Email:</span> {user.email || "—"}</p>
              <p><span className="font-semibold text-pink-400">DOB:</span> {user.dob || "Not provided"}</p>
              <p><span className="font-semibold text-pink-400">Interest:</span> {user.interest || "Not selected"}</p>
              <p><span className="font-semibold text-pink-400">Role:</span> {user.role || "user"}</p>
            </div>
            <Separator className="my-5 bg-white/10" />
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <FilmIcon className="h-4 w-4" /> Movies
              <span className="mx-1">•</span>
              <Trophy className="h-4 w-4" /> Cricket
              <span className="mx-1">•</span>
              <Zap className="h-4 w-4" /> Offers
            </div>
          </DarkCard>

          <DarkCard title="Why CineCrick">
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <Pro icon={<Zap className="h-6 w-6" />} title="Fast booking" desc="Quick flow from selection to confirmation." />
              <Pro icon={<Compass className="h-6 w-6" />} title="Smart navigation" desc="Dropdown menus with search + scrollable options." />
              <Pro icon={<Lock className="h-6 w-6" />} title="Protected pages" desc="Home opens only after signup." />
              <Pro icon={<FilmIcon className="h-6 w-6" />} title="Entertainment hub" desc="Movies + cricket + events in one dashboard." />
            </div>
          </DarkCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-14 border-t border-pink-500/30 bg-gradient-to-b from-black to-[#070812] shadow-[0_-20px_80px_rgba(236,72,153,0.25)]">
        <div className="w-full px-4 lg:px-14 py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="text-3xl font-black text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.7)]">
              CineCrick
            </div>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              Your one-stop destination for movies, cricket, events, and bookings.
            </p>
          </div>
          <FooterCol title="Quick Links" items={["Home", "Movies", "Cricket", "Bookings", "News"]} />
          <FooterCol title="Services" items={["Movie Tickets", "Ground Booking", "Live Scores", "Event Booking", "Offers"]} />
          <FooterCol title="Support" items={["Help Center", "Privacy Policy", "Terms", "Contact Us"]} />
        </div>
        <div className="border-t border-pink-500/20 py-4 text-center text-xs text-white/55">
          © {new Date().getFullYear()} CineCrick. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function MenuDropdown({ label, items, onPick }) {
  const inputRef = useRef(null);
  return (
    <DropdownMenu onOpenChange={(open) => open && setTimeout(() => inputRef.current?.focus(), 0)}>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 text-sm">
          {label}
          <ChevronDown className="ml-2 h-4 w-4 opacity-80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 sm:w-80 rounded-2xl border-white/10 bg-zinc-950/95 text-white shadow-2xl backdrop-blur-xl">
        <Command className="bg-transparent text-white">
          <div className="px-3 pt-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
              <Search className="h-4 w-4 text-white/60" />
              <CommandInput ref={inputRef} placeholder={`Search in ${label}...`} className="text-white placeholder:text-white/45" />
            </div>
          </div>
          <CommandList className="max-h-64">
            <CommandEmpty className="py-6 text-center text-sm text-white/60">No results found.</CommandEmpty>
            <CommandGroup heading={label} className="text-white/70">
              {items.map((it) => (
                <CommandItem key={it} value={it} onSelect={() => onPick(it)} className="cursor-pointer aria-selected:bg-pink-500/20 aria-selected:text-white">
                  {it}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DarkCard({ title, children }) {
  return (
    <Card className="border-white/10 bg-zinc-950/55 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
      <CardContent className="p-5 sm:p-6">
        <h2 className="text-xl font-black">{title}</h2>
        <div className="mt-2">{children}</div>
      </CardContent>
    </Card>
  );
}

function Pro({ icon, title, desc }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 hover:bg-white/10 transition">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-pink-500/20 bg-pink-500/10 text-pink-200">
        {icon}
      </div>
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-xs text-white/70 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div className="font-bold text-white">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-white/70">
        {items.map((x) => (
          <li key={x} className="cursor-pointer hover:text-pink-400 hover:translate-x-1 transition-all duration-200">
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}