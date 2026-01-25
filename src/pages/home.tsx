import { useEffect, useRef, useState } from "react";

import logoUrl from "../assets/images/LogoMobile.svg";
import bagUrl from "../assets/images/Bag.svg";
import profileUrl from "../assets/images/profile1.svg";
import searchIconUrl from "../assets/images/SearchMobile.svg";
import heroMobileUrl from "../assets/images/heroImageUrlMobile.svg";

import { SidebarProfile } from "../components/layout/SidebarProfile";
import { HomeNavCards } from "../components/menu/HomeNavCards";

export function HomePage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isProfileOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsProfileOpen(false);
    }

    function onMouseDown(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof Node)) return;

      if (profileMenuRef.current?.contains(target)) return;
      if (profileButtonRef.current?.contains(target)) return;

      setIsProfileOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [isProfileOpen]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <section
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          backgroundImage: `url(\"${heroMobileUrl}\")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-label="Hero"
      >
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-4 pt-4">
          <header className="flex items-center justify-between">
            <img src={logoUrl} alt="Foody" className="h-10 w-10" />

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                aria-label="Open cart"
              >
                <img
                  src={bagUrl}
                  alt=""
                  className="h-7 w-7"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                ref={profileButtonRef}
                onClick={() => setIsProfileOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                aria-label="Open profile"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                aria-controls="sidebar-profile-menu"
              >
                <img
                  src={profileUrl}
                  alt=""
                  className="h-10 w-10 rounded-full"
                  aria-hidden="true"
                />
              </button>
            </div>
          </header>

          {isProfileOpen ? (
            <div
              id="sidebar-profile-menu"
              ref={profileMenuRef}
              className="absolute z-50"
              style={{ top: 64, left: 182 }}
            >
              <SidebarProfile onClose={() => setIsProfileOpen(false)} />
            </div>
          ) : null}

          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <h1
              className="max-w-[340px] font-extrabold tracking-[0] text-center"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "var(--text-display-lg)",
                lineHeight: "var(--leading-display-lg)",
                letterSpacing: "0%",
                color: "var(--Base-White, #FFFFFF)",
              }}
            >
              Explore Culinary Experiences
            </h1>
            <p
              className="max-w-[320px] text-center"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "var(--text-text-lg)",
                lineHeight: "var(--leading-text-lg)",
                letterSpacing: "-3%",
                color: "var(--Base-White, #FFFFFF)",
              }}
            >
              Search and refine your choice to discover the perfect restaurant.
            </p>

            <button
              type="button"
              className="mt-1 inline-flex h-12 w-[349px] max-w-full items-center gap-[6px] rounded-full bg-white px-4 py-2 opacity-100 shadow-[0px_8px_20px_0px_#00000033]"
              style={{ fontFamily: "var(--font-body)" }}
              aria-label="Search"
            >
              <img
                src={searchIconUrl}
                alt=""
                className="h-5 w-5"
                aria-hidden="true"
              />
              <span
                className="text-left"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "var(--text-text-sm)",
                  lineHeight: "var(--leading-text-sm)",
                  letterSpacing: "-2%",
                  color: "var(--Neutral-600, #535862)",
                }}
              >
                Search restaurants, food and drink
              </span>
            </button>
          </div>
        </div>
      </section>

      <section
        className="w-full bg-[hsl(var(--background))]"
        aria-label="Home navigation"
      >
        <div className="mx-auto w-full max-w-[430px] px-4 py-6">
          <HomeNavCards />
        </div>
      </section>
    </div>
  );
}
