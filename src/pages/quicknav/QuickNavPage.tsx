import { NavLink } from "react-router-dom";

import allFoodUrl from "../../assets/images/AllFood.svg";
import locationUrl from "../../assets/images/Location1.svg";
import discountUrl from "../../assets/images/Discount.svg";
import bestSellerUrl from "../../assets/images/BestSeller.svg";
import deliveryUrl from "../../assets/images/Delivery.svg";
import lunchUrl from "../../assets/images/Lunch.svg";

import { ROUTES } from "../../config/routes";

import type { QuickNavPageProps } from "./QuickNavPage";

type NavItem = {
  title: string;
  to: string;
  iconUrl: string;
};

const NAV_ITEMS: NavItem[] = [
  { title: "All Restaurant", to: ROUTES.allRestaurant, iconUrl: allFoodUrl },
  { title: "Nearby", to: ROUTES.nearby, iconUrl: locationUrl },
  { title: "Discount", to: ROUTES.discount, iconUrl: discountUrl },
  { title: "Best Seller", to: ROUTES.bestSeller, iconUrl: bestSellerUrl },
  { title: "Delivery", to: ROUTES.delivery, iconUrl: deliveryUrl },
  { title: "Lunch", to: ROUTES.lunch, iconUrl: lunchUrl },
];

export function QuickNavPage({ title }: QuickNavPageProps) {
  return (
    <div className="mx-auto w-full max-w-[430px] px-4 lg:max-w-6xl lg:px-6">
      <nav
        className="hidden items-center gap-10 overflow-x-auto rounded-3xl bg-white px-10 py-6 shadow-[0px_0px_20px_0px_#CBCACA40] lg:flex lg:flex-nowrap lg:justify-between"
        aria-label="Quick navigation"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.title}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? "flex shrink-0 flex-col items-center gap-2 text-[#0A0D12]"
                : "flex shrink-0 flex-col items-center gap-2 text-[#0A0D12]/75 hover:text-[#0A0D12]"
            }
            aria-label={item.title}
          >
            <img
              src={item.iconUrl}
              alt=""
              className="h-9 w-9 object-contain"
              aria-hidden="true"
            />
            <span
              className="w-28 text-center"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "var(--text-text-xs)",
                lineHeight: "var(--leading-text-xs)",
                letterSpacing: "-0.02em",
              }}
            >
              {item.title}
            </span>
          </NavLink>
        ))}
      </nav>

      <h1
        className="pt-6 text-center font-extrabold lg:pt-10"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "var(--text-display-xs)",
          lineHeight: "var(--leading-display-xs)",
          color: "hsl(var(--foreground))",
        }}
      >
        {title}
      </h1>
      <p
        className="mt-2 text-center"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "var(--text-text-sm)",
          lineHeight: "var(--leading-text-sm)",
          letterSpacing: "-0.02em",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        Halaman ini belum diisi kontennya.
      </p>
    </div>
  );
}

export type { QuickNavPageProps };
