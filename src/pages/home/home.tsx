import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import searchIconUrl from "../../assets/images/SearchMobile.svg";
import heroMobileUrl from "../../assets/images/Image.svg";
import logoMobileUrl from "../../assets/images/LogoMobile.svg";
import bagUrl from "../../assets/images/Bag.svg";
import profileUrl from "../../assets/images/profile1.svg";

import { HomeHeader } from "../../components/layout/HomeHeader";
import { SidebarProfile } from "../../components/layout/SidebarProfile";
import { HomeNavCards } from "../../components/menu/HomeNavCards";
import { RecommendedRestaurantPage } from "../recommendedrestaurant/RecommendedRestaurant.tsx";
import { FooterPage } from "../footer/footer.tsx";

import { ROUTES } from "../../config/routes";
import { useAppSelector } from "../../features/hooks";
import { getAuthUserName } from "../../services/auth/token";

export function HomePage() {
  const cartCount = useAppSelector((s) =>
    Object.values(s.cart.itemsById).reduce(
      (sum, item) => sum + item.quantity,
      0,
    ),
  );

  const userName = getAuthUserName() || "John Doe";

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [profileMenuPos, setProfileMenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (!isProfileOpen) return;

    function updatePos() {
      const btn = profileButtonRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const menuWidth = 197;
      const gutter = 12;

      const top = rect.bottom + gutter;
      const left = Math.min(
        Math.max(gutter, rect.right - menuWidth),
        window.innerWidth - menuWidth - gutter,
      );

      setProfileMenuPos({ top, left });
    }

    updatePos();

    window.addEventListener("scroll", updatePos, { passive: true });
    window.addEventListener("resize", updatePos);

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
      window.removeEventListener("scroll", updatePos);
      window.removeEventListener("resize", updatePos);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [isProfileOpen]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <section
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          backgroundImage: `url("${heroMobileUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-label="Hero"
      >
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pt-4">
          <div className="lg:hidden">
            <HomeHeader logoVariant="home" />
          </div>

          <header
            className="hidden items-center justify-between lg:flex"
            aria-label="Desktop hero header"
          >
            <Link
              to={ROUTES.home}
              className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              aria-label="Foody"
            >
              <img src={logoMobileUrl} alt="Foody" className="h-9 w-9" />
              <span
                className="text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 22,
                  lineHeight: "28px",
                }}
              >
                Foody
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.cart}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Open cart"
              >
                <span className="relative inline-flex">
                  <img src={bagUrl} alt="" className="h-6 w-6" aria-hidden />
                  {cartCount > 0 ? (
                    <span
                      className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-(--Primary-100,#C12116) px-1 text-xs font-bold text-white"
                      aria-label={`${cartCount} items in cart`}
                    >
                      {cartCount}
                    </span>
                  ) : null}
                </span>
              </Link>

              <button
                type="button"
                ref={profileButtonRef}
                onClick={() => setIsProfileOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Open profile"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                aria-controls="home-profile-menu"
              >
                <img
                  src={profileUrl}
                  alt=""
                  className="h-7 w-7 rounded-full"
                  aria-hidden
                />
                <span
                  className="max-w-44 truncate text-white"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: 14,
                    lineHeight: "20px",
                  }}
                >
                  {userName}
                </span>
              </button>
            </div>
          </header>

          {isProfileOpen ? (
            <div
              id="home-profile-menu"
              ref={profileMenuRef}
              className="fixed z-9999 hidden lg:block"
              style={{ top: profileMenuPos.top, left: profileMenuPos.left }}
            >
              <SidebarProfile onClose={() => setIsProfileOpen(false)} />
            </div>
          ) : null}

          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <h1
              className="max-w-85 font-extrabold tracking-[0] text-center lg:max-w-3xl"
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
              className="max-w-[320px] text-center lg:max-w-xl"
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

            <div
              className="mt-1 flex h-12 w-87.25 max-w-full items-center gap-2 rounded-full bg-white px-4 py-2 shadow-[0px_8px_20px_0px_#00000033] lg:w-160"
              aria-label="Search"
            >
              <img
                src={searchIconUrl}
                alt=""
                className="h-5 w-5"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search restaurants, food and drink"
                className="h-full w-full bg-transparent text-sm text-[#0A0D12] outline-none placeholder:text-[#535862]"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="w-full bg-[hsl(var(--background))]"
        aria-label="Home navigation"
      >
        <div className="mx-auto w-full max-w-107.5 px-4 py-6">
          <HomeNavCards />
        </div>
      </section>

      <section
        className="w-full bg-[hsl(var(--background))]"
        aria-label="Recommended restaurants"
      >
        <RecommendedRestaurantPage />
      </section>

      <FooterPage />
    </div>
  );
}
