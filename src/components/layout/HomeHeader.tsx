import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import logoMobileUrl from "../../assets/images/LogoMobile.svg";
import logoUrl from "../../assets/images/Logo.svg";
import bagUrl from "../../assets/images/Bag.svg";
import bagBlackMobileUrl from "../../assets/images/BagBlackMobile.svg";
import profileUrl from "../../assets/images/profile1.svg";

import { useAppSelector } from "../../features/hooks";
import { ROUTES } from "../../config/routes";

import { SidebarProfile } from "./SidebarProfile";

type HomeHeaderProps = {
  /** Use the mobile logo only for the Home page hero; other pages should use the main logo. */
  logoVariant?: "home" | "default";
};

export function HomeHeader({ logoVariant = "default" }: HomeHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const cartCount = useAppSelector((s) =>
    Object.values(s.cart.itemsById).reduce(
      (sum, item) => sum + item.quantity,
      0,
    ),
  );

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
    <>
      <header className="flex items-center justify-between">
        <img
          src={logoVariant === "home" ? logoMobileUrl : logoUrl}
          alt="Foody"
          className="h-10 w-10"
        />

        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.cart}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            aria-label="Open cart"
          >
            <span className="relative inline-flex">
              <img
                src={logoVariant === "home" ? bagUrl : bagBlackMobileUrl}
                alt=""
                className="h-7 w-7"
                aria-hidden
              />

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
              aria-hidden
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
    </>
  );
}
