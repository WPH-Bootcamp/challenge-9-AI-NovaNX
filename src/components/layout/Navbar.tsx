import { Link, NavLink, useNavigate } from "react-router-dom";

import logoUrl from "../../assets/images/Logo.svg";

import { Button } from "../../ui/button";
import { ROUTES } from "../../config/routes";
import { clearAuthToken, getAuthToken } from "../../services/auth/token";
import { useAppSelector } from "../../features/hooks";
import { formatCurrency } from "../../lib/utils";

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

  const itemsById = useAppSelector((s) => s.cart.itemsById);
  const itemCount = countCartItems(itemsById);
  const total = cartTotal(itemsById);

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
            <Button
              variant="ghost"
              onClick={() => {
                clearAuthToken();
                navigate(ROUTES.login, { replace: true });
              }}
            >
              Logout
            </Button>
          ) : (
            <Button asChild variant="default">
              <Link to={ROUTES.login}>Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
