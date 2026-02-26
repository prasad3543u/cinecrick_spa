import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  // ✅ Protected route (safe JSON parse)
  const userStr = localStorage.getItem("cinecrick_user");
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    localStorage.removeItem("cinecrick_user");
    return <Navigate to="/" replace />;
  }

  if (!user) return <Navigate to="/" replace />;

  // ✅ Menus (7–8 options each)
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

  // ✅ Dropdown state
  const [openMenu, setOpenMenu] = useState(null);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);

  // Close dropdown on outside click / Esc
  useEffect(() => {
    function onDocClick(e) {
      if (!e.target.closest(".cc-nav")) setOpenMenu(null);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Autofocus search when menu opens
  useEffect(() => {
    if (openMenu) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [openMenu]);

  function open(menu) {
    setOpenMenu((prev) => (prev === menu ? null : menu));
    setQuery("");
  }

  function logout() {
    localStorage.removeItem("cinecrick_user");
    navigate("/", { replace: true });
  }

  // ✅ Slideshow (memoized so it doesn't recreate each render)
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

  const activeItems =
    openMenu &&
    MENUS[openMenu].filter((x) => x.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="cc-page">
      {/* ===== BIG HEADER + NAV ===== */}
      <header className="cc-header">
        <div className="cc-top">
          <div className="cc-brand">
            <span className="cc-brandMark">C</span>
            <span className="cc-brandText">CineCrick</span>
          </div>

          <div className="cc-userChip" title="Logged in user">
            <span className="dot" />
            <span className="cc-userEmail">{user.email}</span>
          </div>
        </div>

        <nav className="cc-nav">
          {menuKeys.map((k) => (
            <div key={k} className="cc-navItem">
              <button
                className={`cc-navBtn ${openMenu === k ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  open(k);
                }}
                type="button"
              >
                {k} <span className="caret">▾</span>
              </button>

              {openMenu === k && (
                <div
                  className="cc-drop"
                  onClick={(e) => e.stopPropagation()}
                  role="menu"
                >
                  <div className="cc-dropHead">
                    <div className="cc-dropTitle">{k}</div>
                    <button
                      className="cc-x"
                      onClick={() => setOpenMenu(null)}
                      type="button"
                      aria-label="Close menu"
                    >
                      ✕
                    </button>
                  </div>

                  <input
                    ref={searchRef}
                    className="cc-search"
                    placeholder={`Search in ${k}...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />

                  <div className="cc-dropList">
                    {activeItems.map((item) => (
                      <button
                        key={item}
                        className="cc-dropItem"
                        type="button"
                        onClick={() => {
                          setOpenMenu(null); // ✅ close on selection
                          if (item === "Logout") logout();
                          else alert(`${k} → ${item}`);
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="cc-dropHint">
                    Tip: press <b>Esc</b> to close
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </header>

      {/* ===== HERO SLIDESHOW ===== */}
      <section className="cc-hero">
        <div className="cc-heroCard">
          <img
            className="cc-heroImg"
            src={slides[slide].img}
            alt={slides[slide].title}
          />

          <div className="cc-heroOverlay">
            <div className="pill">{slides[slide].tag}</div>
            <h1 className="cc-heroTitle">{slides[slide].title}</h1>
            <p className="cc-heroSub">{slides[slide].subtitle}</p>

            <div className="cc-heroActions">
              <button
                className="btn primary"
                type="button"
                onClick={() => alert("Explore clicked")}
              >
                Explore
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() => alert("View offers clicked")}
              >
                View offers
              </button>
            </div>

            <div className="cc-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`dotBtn ${i === slide ? "on" : ""}`}
                  onClick={() => setSlide(i)}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              className="cc-arrow left"
              type="button"
              onClick={() =>
                setSlide((s) => (s - 1 + slides.length) % slides.length)
              }
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button
              className="cc-arrow right"
              type="button"
              onClick={() => setSlide((s) => (s + 1) % slides.length)}
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* ===== ABOUT + PROS (below slideshow) ===== */}
      <section className="cc-info">
        <div className="cc-infoCard">
          <h2>About CineCrick</h2>
          <p>
            CineCrick is a single place for <b>movies</b>, <b>cricket</b>, and{" "}
            <b>events</b>. Discover what’s trending, check schedules, and manage
            bookings easily.
          </p>
        </div>

        <div className="cc-pros">
          <h2>Why CineCrick</h2>
          <div className="cc-proGrid">
            <div className="pro">
              <div className="proIcon">⚡</div>
              <div>
                <h3>Fast booking</h3>
                <p>Quick flow from selection to confirmation.</p>
              </div>
            </div>

            <div className="pro">
              <div className="proIcon">🧭</div>
              <div>
                <h3>Smart navigation</h3>
                <p>Dropdown menus with search + scrollable options.</p>
              </div>
            </div>

            <div className="pro">
              <div className="proIcon">🔒</div>
              <div>
                <h3>Protected pages</h3>
                <p>Home is accessible only after registration.</p>
              </div>
            </div>

            <div className="pro">
              <div className="proIcon">🎬</div>
              <div>
                <h3>Entertainment hub</h3>
                <p>Movies + cricket + events in one dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="cc-footer">
        <div className="cc-footer-main">
          {/* Brand */}
          <div className="cc-footer-col">
            <h2 className="cc-footer-brand">CineCrick</h2>
            <p>
              Your one-stop destination for movies 🎬, cricket 🏏, events,
              bookings, and entertainment.
            </p>
          </div>

          {/* Quick Links */}
          <div className="cc-footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li>Home</li>
              <li>Movies</li>
              <li>Cricket</li>
              <li>Bookings</li>
              <li>News</li>
            </ul>
          </div>

          {/* Services */}
          <div className="cc-footer-col">
            <h3>Services</h3>
            <ul>
              <li>Movie Tickets</li>
              <li>Ground Booking</li>
              <li>Live Scores</li>
              <li>Event Booking</li>
              <li>Offers</li>
            </ul>
          </div>

          {/* Support */}
          <div className="cc-footer-col">
            <h3>Support</h3>
            <ul>
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="cc-footer-bottom">
          © {new Date().getFullYear()} CineCrick. All rights reserved.
        </div>
      </footer>
    </div>
  );
}