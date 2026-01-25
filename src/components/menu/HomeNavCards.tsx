import { Link } from "react-router-dom";

import allFoodUrl from "../../assets/images/AllFood.svg";
import locationUrl from "../../assets/images/Location1.svg";
import discountUrl from "../../assets/images/Discount.svg";
import bestSellerUrl from "../../assets/images/BestSeller.svg";
import deliveryUrl from "../../assets/images/Delivery.svg";
import lunchUrl from "../../assets/images/Lunch.svg";

import { ROUTES } from "../../config/routes";

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

export function HomeNavCards() {
  return (
    <nav
      aria-label="Home navigation"
      className="grid grid-cols-3 justify-items-center gap-x-3 gap-y-6"
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.title}
          to={item.to}
          className="flex flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
        >
          <div className="flex h-[100px] w-[106px] items-center justify-center rounded-[16px] bg-white p-2 opacity-100 shadow-[0px_0px_20px_0px_#CBCACA40]">
            <img
              src={item.iconUrl}
              alt=""
              className="h-12 w-12"
              aria-hidden="true"
            />
          </div>

          <div
            className="text-center"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "var(--text-text-sm)",
              lineHeight: "var(--leading-text-sm)",
              letterSpacing: "-0.02em",
              color: "var(--Neutral-950, #0A0D12)",
            }}
          >
            {item.title}
          </div>
        </Link>
      ))}
    </nav>
  );
}
