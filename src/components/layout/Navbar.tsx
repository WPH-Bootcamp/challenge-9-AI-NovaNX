import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import logoUrl from "../../assets/images/Logo.svg";
import profileUrl from "../../assets/images/profile1.svg";

import { Button } from "../../ui/button";
import { ROUTES } from "../../config/routes";
import { getAuthToken } from "../../services/auth/token";
import { useAppSelector } from "../../features/hooks";
import { formatCurrency } from "../../lib/utils";

import { SidebarProfile } from "./SidebarProfile";

function countCartItems(itemsById: Record<string, { quantity: number }>) {
  return Object.values(itemsById).reduce((sum, item) => sum + item.quantity, 0);
}

function cartTotal(
  itemsById: Record<string, { price: number; quantity: number }>,
) {
  return Object.values(itemsById).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const token = getAuthToken();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [profileMenuPos, setProfileMenuPos] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });

  const itemsById = useAppSelector((s) => s.cart.itemsById);
  const itemCount = countCartItems(itemsById);
  const total = cartTotal(itemsById);

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
    <header className="sticky top-0 z-30 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.home}
            className="inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
            aria-label="Foody"
          >
            <img
              src={logoUrl}
              alt="Foody"
              className="block h-6 w-auto"
              loading="eager"
            />
          </Link>
          <nav
            className="hidden items-center gap-2 sm:flex"
            aria-label="Primary"
          >
            <NavLink
              to={ROUTES.menu}
              className={({ isActive }) =>
                isActive
                  ? "rounded-sm px-3 py-2 text-sm font-semibold text-[hsl(var(--foreground))]"
                  : "rounded-sm px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              }
            >
              Menu
            </NavLink>
            <NavLink
              to={ROUTES.orders}
              className={({ isActive }) =>
                isActive
                  ? "rounded-sm px-3 py-2 text-sm font-semibold text-[hsl(var(--foreground))]"
                  : "rounded-sm px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              }
            >
              History
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.cart}
            className="hidden text-sm font-medium text-[hsl(var(--foreground))] sm:inline-flex"
          >
            {itemCount > 0
              ? `Cart (${itemCount}) · ${formatCurrency(total)}`
              : "Cart"}
          </Link>
          <Button asChild variant="outline" className="sm:hidden">
            <Link to={ROUTES.cart} aria-label="Open cart">
              Cart{itemCount > 0 ? ` (${itemCount})` : ""}
            </Link>
          </Button>

          {token ? (
            <div>
              <button
                type="button"
                ref={profileButtonRef}
                onClick={() => setIsProfileOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                aria-label="Open profile"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                aria-controls="navbar-profile-menu"
              >
                <img
                  src={profileUrl}
                  alt=""
                  className="h-10 w-10 rounded-full"
                  aria-hidden
                />
              </button>

              {isProfileOpen ? (
                <div
                  id="navbar-profile-menu"
                  ref={profileMenuRef}
                  className="fixed z-9999"
                  style={{ top: profileMenuPos.top, left: profileMenuPos.left }}
                >
                  <SidebarProfile onClose={() => setIsProfileOpen(false)} />
                </div>
              ) : null}
            </div>
          ) : (
            <Button
              variant="default"
              onClick={() => navigate(ROUTES.login)}
              aria-label="Login"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
