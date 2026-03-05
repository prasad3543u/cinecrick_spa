import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Zap,
  Compass,
  Lock,
  Film as FilmIcon,
  Trophy,
  ChevronDown,
  Search,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function Home() {
  const navigate = useNavigate();

  // ✅ Protected route
  const userStr = localStorage.getItem("cinecrick_user");
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    localStorage.removeItem("cinecrick_user");
    return <Navigate to="/" replace />;
  }

  if (!user) return <Navigate to="/" replace />;

  function logout() {
    localStorage.removeItem("cinecrick_logged_in");
    navigate("/", { replace: true });
  }

  // ✅ Menus
  const MENUS = useMemo(
    () => ({
      Movies: [
        "Now Showing",
        "Upcoming",
        "Top Rated",
        "Genres",
        "Offers",
        "Near Me",
        "Trailers",
        "Reviews",
      ],
      Cricket: [
        "Live Matches",
        "Scores",
        "Schedule",
        "Teams",
        "Highlights",
        "Rankings",
        "Stats",
        "Grounds",
      ],
      Bookings: [
        "Ground Booking",
        "Movie Tickets",
        "My Bookings",
        "Cancel Booking",
        "Refund Status",
        "Payment Help",
        "Support",
        "Offers",
      ],
      News: [
        "Sports News",
        "Film News",
        "Trending",
        "Match Reports",
        "Box Office",
        "Interviews",
        "Reviews",
        "Rumours",
      ],
      Events: [
        "Concerts",
        "Standup",
        "Theatre",
        "Festivals",
        "Kids",
        "Workshops",
        "Online",
        "Nearby",
      ],
      Account: [
        "Profile",
        "Settings",
        "Privacy",
        "Notifications",
        "Help Center",
        "Terms",
        "About",
        "Logout",
      ],
    }),
    []
  );

  const menuKeys = Object.keys(MENUS);

  // ✅ Slideshow
  const slides = useMemo(
    () => [
      {
        title: "Tonight: Movie + Match Combo",
        subtitle: "Book tickets and ground slots in one place",
        img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=80",
        tag: "Trending",
      },
      {
        title: "Live Cricket Updates",
        subtitle: "Scores • Schedule • Highlights",
        img: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=1800&q=80",
        tag: "Cricket",
      },
      {
        title: "Weekend Events",
        subtitle: "Concerts • Standup • Theatre • Festivals",
        img: "https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=1800&q=80",
        tag: "Events",
      },
    ],
    []
  );

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070812] text-white">
      {/* ===== HYPNOTIC BACKGROUND ===== */}
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

      {/* ===== HEADER (FULL WIDTH) ===== */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/55 backdrop-blur-xl">
        <div className="w-full px-6 lg:px-14 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 font-black shadow-[0_16px_35px_rgba(255,46,99,.22)]">
                C
              </div>
              <div className="text-4xl font-black tracking-tight">CineCrick</div>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,.14)]" />
              <span className="max-w-[38vw] truncate text-sm text-white/80">
                {user.email}
              </span>

              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/10 text-white/90">
                  {String(user.email || "U")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button
                onClick={logout}
                size="sm"
                className="h-9 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 font-bold hover:opacity-95"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* NAV */}
          <div className="mt-4">
            <NavigationMenu>
              <NavigationMenuList className="flex flex-wrap gap-2">
                {menuKeys.map((k) => (
                  <NavigationMenuItem key={k}>
                    <MenuDropdown
                      label={k}
                      items={MENUS[k]}
                      onPick={(item) => {
                        if (k === "Account" && item === "Logout") logout();
                        else alert(`${k} → ${item}`);
                      }}
                    />
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      {/* ===== HERO (FULL WIDTH) ===== */}
      <section className="w-full px-6 lg:px-14 pt-6">
        <Card className="overflow-hidden border-white/10 bg-zinc-950/40 shadow-[0_28px_80px_rgba(0,0,0,.65)]">
          <CardContent className="relative p-0">
            <img
              src={slides[slide].img}
              alt={slides[slide].title}
              className="h-[460px] w-full object-cover saturate-125 contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent p-7">
              <Badge className="bg-pink-500/15 text-pink-200 border border-pink-500/25">
                {slides[slide].tag}
              </Badge>

              <div className="mt-3 max-w-2xl">
                <h1 className="text-5xl font-black leading-tight drop-shadow">
                  {slides[slide].title}
                </h1>
                <p className="mt-2 text-white/80 text-lg">
                  {slides[slide].subtitle}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button className="bg-gradient-to-r from-pink-500 to-violet-500 font-bold hover:opacity-95">
                  Explore
                </Button>
                <Button
                  variant="secondary"
                  className="bg-white/10 text-white hover:bg-white/15"
                >
                  View offers
                </Button>
              </div>

              <div className="absolute bottom-6 left-7 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      i === slide ? "bg-white" : "bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                    type="button"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSlide((s) => (s - 1 + slides.length) % slides.length)
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/40 text-2xl hover:bg-black/60"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setSlide((s) => (s + 1) % slides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/40 text-2xl hover:bg-black/60"
                aria-label="Next slide"
              >
                ›
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ===== BELOW SLIDESHOW (FULL WIDTH) ===== */}
      <section className="w-full px-6 lg:px-14 py-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <DarkCard title="About CineCrick">
            <p className="text-white/80 leading-relaxed">
              CineCrick is a single place for <b>movies</b>, <b>cricket</b>, and{" "}
              <b>events</b>. Discover trending content, check schedules, and manage
              bookings with a premium experience.
            </p>

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

      {/* ===== FOOTER (FULL WIDTH) ===== */}
      <footer className="mt-10 border-t border-white/10 bg-black/50">
        <div className="w-full px-6 lg:px-14 py-10 grid gap-8 md:grid-cols-4">
          <div>
            <div className="text-2xl font-black text-pink-400">CineCrick</div>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              Your one-stop destination for movies, cricket, events, and bookings.
            </p>
          </div>

          <FooterCol title="Quick Links" items={["Home", "Movies", "Cricket", "Bookings", "News"]} />
          <FooterCol title="Services" items={["Movie Tickets", "Ground Booking", "Live Scores", "Event Booking", "Offers"]} />
          <FooterCol title="Support" items={["Help Center", "Privacy Policy", "Terms", "Contact Us"]} />
        </div>

        <div className="border-t border-white/10 py-4 text-center text-xs text-white/55">
          © {new Date().getFullYear()} CineCrick. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function MenuDropdown({ label, items, onPick }) {
  const inputRef = useRef(null);

  return (
    <DropdownMenu
      onOpenChange={(open) => open && setTimeout(() => inputRef.current?.focus(), 0)}
    >
      <DropdownMenuTrigger asChild>
        <Button className="rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10">
          {label}
          <ChevronDown className="ml-2 h-4 w-4 opacity-80" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-80 rounded-2xl border-white/10 bg-zinc-950/95 text-white shadow-2xl backdrop-blur-xl"
      >
        <Command className="bg-transparent text-white">
          <div className="px-3 pt-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
              <Search className="h-4 w-4 text-white/60" />
              <CommandInput
                ref={inputRef}
                placeholder={`Search in ${label}...`}
                className="text-white placeholder:text-white/45"
              />
            </div>
          </div>

          <CommandList className="max-h-64">
            <CommandEmpty className="py-6 text-center text-sm text-white/60">
              No results found.
            </CommandEmpty>

            <CommandGroup heading={label} className="text-white/70">
              {items.map((it) => (
                <CommandItem
                  key={it}
                  value={it}
                  onSelect={() => onPick(it)}
                  className="cursor-pointer aria-selected:bg-pink-500/20 aria-selected:text-white"
                >
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
      <CardContent className="p-6">
        <h2 className="text-xl font-black">{title}</h2>
        <div className="mt-2">{children}</div>
      </CardContent>
    </Card>
  );
}

function Pro({ icon, title, desc }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
      <div className="grid h-10 w-10 place-items-center rounded-xl border border-pink-500/20 bg-pink-500/10 text-pink-200">
        {icon}
      </div>
      <div>
        <div className="font-bold">{title}</div>
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
          <li key={x} className="cursor-pointer hover:text-pink-400 transition">
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}