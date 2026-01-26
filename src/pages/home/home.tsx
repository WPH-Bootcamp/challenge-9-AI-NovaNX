import searchIconUrl from "../../assets/images/SearchMobile.svg";
import heroMobileUrl from "../../assets/images/heroImageUrlMobile.svg";

import { HomeHeader } from "../../components/layout/HomeHeader";
import { HomeNavCards } from "../../components/menu/HomeNavCards";
import { RecommendedRestaurantPage } from "../recommendedrestaurant/RecommendedRestaurant.tsx";
import { FooterPage } from "../footer/footer.tsx";

export function HomePage() {
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

        <div className="relative mx-auto flex min-h-screen w-full max-w-107.5 flex-col px-4 pt-4">
          <HomeHeader logoVariant="home" />

          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <h1
              className="max-w-85 font-extrabold tracking-[0] text-center"
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
              className="mt-1 inline-flex h-12 w-87.25 max-w-full items-center gap-1.5 rounded-full bg-white px-4 py-2 opacity-100 shadow-[0px_8px_20px_0px_#00000033]"
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
