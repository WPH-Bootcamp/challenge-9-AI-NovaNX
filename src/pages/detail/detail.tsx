import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import backIconUrl from "../../assets/images/arrowCircleBrokenLeftMobile.svg";
import shareIconUrl from "../../assets/images/ButtonShareMobile.svg";
import starUrl from "../../assets/images/StarMobile.svg";
import { HomeHeader } from "../../components/layout/HomeHeader";
import { formatCurrency } from "../../lib/utils";
import { getAuthToken } from "../../services/auth/token";

import type {
  RestaurantDetail,
  RestaurantMenuItem,
  RestaurantSummary,
} from "./detail";

type LocationState = {
  restaurant?: RestaurantSummary;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (isRecord(error)) {
    const message = asString(error.message);
    if (message) return message;
  }
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

type UserCoords = { lat: number; long: number };

function useUserLocation() {
  const [coords, setCoords] = useState<UserCoords | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, long: pos.coords.longitude });
      },
      () => {
        // ignore
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );
  }, []);

  return coords;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatKm(distanceKm: number | undefined): string {
  if (typeof distanceKm !== "number" || !Number.isFinite(distanceKm)) return "";
  return `${distanceKm.toFixed(1)} km`;
}

function normalizeBaseUrl(raw: string | undefined): string {
  if (!raw) return "";

  let value = raw.trim();
  while (value.endsWith("/")) value = value.slice(0, -1);
  value = value.replace(/\/api-swagger$/i, "");
  return value;
}

const API_BASE_URL = normalizeBaseUrl(
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    "https://restaurant-be-400174736012.asia-southeast2.run.app",
);

function normalizeImageUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!API_BASE_URL) return trimmed;

  try {
    return new URL(trimmed, API_BASE_URL).toString();
  } catch {
    return trimmed;
  }
}

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value)) {
    const candidate = value.data ?? value.items ?? value.menus;
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function getNested(root: unknown, path: string[]): unknown {
  let current: unknown = root;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

function mapMenuItem(raw: unknown): RestaurantMenuItem | null {
  if (!isRecord(raw)) return null;

  const id =
    asString(raw.id) ??
    asString(raw._id) ??
    asString(raw.menuId) ??
    asString(raw.menu_id);
  const name =
    asString(raw.name) ?? asString(raw.title) ?? "";

  if (!id || !name) return null;

  const price =
    asNumber(raw.price) ?? asNumber(raw.harga) ?? asNumber(raw.amount);

  const imageUrl = normalizeImageUrl(
    asString(raw.imageUrl) ||
      asString(raw.image_url) ||
      asString(raw.image) ||
      asString(raw.photo) ||
      asString(raw.thumbnail),
  );

  const description =
    asString(raw.description) ?? asString(raw.desc);

  return { id, name, price, imageUrl, description };
}

function mapDetail(payload: unknown, id: string): RestaurantDetail {
  const node: Record<string, unknown> = isRecord(payload) ? payload : {};
  const dataNode: Record<string, unknown> =
    (isRecord(node.data) ? (node.data as Record<string, unknown>) : node) ??
    node;

  const name =
    asString(dataNode.name) ??
    asString(dataNode.title) ??
    asString(dataNode.restaurantName) ??
    asString(dataNode.restaurant_name) ??
    "Restaurant";

  const star =
    asNumber(dataNode.star) ?? asNumber(dataNode.rating);

  const place =
    asString(dataNode.place) ?? asString(dataNode.address);

  const lat =
    asNumber(dataNode.lat) ??
    asNumber(dataNode.latitude) ??
    asNumber(dataNode.restaurantLat) ??
    asNumber(dataNode.restaurant_lat) ??
    asNumber(getNested(dataNode, ["location", "lat"])) ??
    asNumber(getNested(dataNode, ["location", "latitude"])) ??
    asNumber(getNested(dataNode, ["coords", "lat"])) ??
    asNumber(getNested(dataNode, ["coords", "latitude"]));

  const long =
    asNumber(dataNode.long) ??
    asNumber(dataNode.lng) ??
    asNumber(dataNode.longitude) ??
    asNumber(dataNode.restaurantLong) ??
    asNumber(dataNode.restaurant_long) ??
    asNumber(getNested(dataNode, ["location", "long"])) ??
    asNumber(getNested(dataNode, ["location", "lng"])) ??
    asNumber(getNested(dataNode, ["location", "longitude"])) ??
    asNumber(getNested(dataNode, ["coords", "long"])) ??
    asNumber(getNested(dataNode, ["coords", "lng"])) ??
    asNumber(getNested(dataNode, ["coords", "longitude"]));

  const imageUrl = normalizeImageUrl(
    asString(dataNode.imageUrl) ||
      asString(dataNode.image_url) ||
      asString(dataNode.image) ||
      asString(dataNode.photo) ||
      asString(dataNode.logo),
  );

  const menusNode =
    dataNode.menus ??
    dataNode.menu ??
    getNested(dataNode, ["data", "menus"]) ??
    getNested(node, ["data", "menus"]) ??
    getNested(node, ["menus"]) ??
    getNested(node, ["data", "data", "menus"]);

  const menus = extractArray(menusNode)
    .map(mapMenuItem)
    .filter((m): m is RestaurantMenuItem => Boolean(m));

  return { id, name, star, place, lat, long, imageUrl, menus };
}

export function DetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const restaurantId = params.id ?? "";
  const userCoords = useUserLocation();

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const restaurantFromState = state.restaurant;

  const detailUrl = useMemo(() => {
    if (!restaurantId) return "";
    return API_BASE_URL
      ? `${API_BASE_URL}/api/resto/${restaurantId}`
      : `/api/resto/${restaurantId}`;
  }, [restaurantId]);

  const detailQuery = useQuery({
    queryKey: ["restaurant", "detail", restaurantId],
    enabled: Boolean(restaurantId),
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) throw new Error("Access token required");

      const res = await fetch(detailUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const text = await res.text();
      let json: unknown = null;
      try {
        json = text ? (JSON.parse(text) as unknown) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        const message =
          (isRecord(json) ? asString(json.message) : undefined) ||
          `Request failed (${res.status})`;
        throw new Error(message);
      }

      return mapDetail(json, restaurantId);
    },
  });

  const summary: RestaurantSummary | undefined =
    restaurantFromState ??
    (detailQuery.data
      ? {
          id: detailQuery.data.id,
          name: detailQuery.data.name,
          star: detailQuery.data.star,
          place: detailQuery.data.place,
          lat: detailQuery.data.lat,
          long: detailQuery.data.long,
          imageUrl: detailQuery.data.imageUrl,
        }
      : undefined);

  const heroImages = useMemo(() => {
    const urls = [summary?.imageUrl, ...(detailQuery.data?.menus ?? []).map((m) => m.imageUrl)];
    const unique = Array.from(new Set(urls.filter((u): u is string => Boolean(u))));
    return unique.slice(0, 5);
  }, [summary?.imageUrl, detailQuery.data?.menus]);

  const dotModel = useMemo(() => {
    const count = heroImages.length;
    if (count <= 1) {
      return { dotCount: 1, indexForDot: [0], activeDot: 0 };
    }

    if (count === 2) {
      return { dotCount: 2, indexForDot: [0, 1], activeDot: activeHeroIndex };
    }

    if (count === 3) {
      return { dotCount: 3, indexForDot: [0, 1, 2], activeDot: activeHeroIndex };
    }

    const middle = Math.floor((count - 1) / 2);
    const indexForDot = [0, middle, count - 1];
    const activeDot =
      activeHeroIndex <= 0 ? 0 : activeHeroIndex >= count - 1 ? 2 : 1;
    return { dotCount: 3, indexForDot, activeDot };
  }, [heroImages.length, activeHeroIndex]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const width = el.clientWidth || 1;
        const index = Math.round(el.scrollLeft / width);
        setActiveHeroIndex(Math.max(0, Math.min(index, Math.max(0, heroImages.length - 1))));
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("scroll", onScroll);
    };
  }, [heroImages.length]);

  const distanceText =
    userCoords && typeof summary?.lat === "number" && typeof summary?.long === "number"
      ? formatKm(
          haversineKm(userCoords.lat, userCoords.long, summary.lat, summary.long),
        )
      : "";

  const place = summary?.place ?? "";
  const placeLine = place && distanceText ? `${place} · ${distanceText}` : place || distanceText;

  async function onShare() {
    const url = window.location.href;
    const title = summary?.name ? `Restaurant: ${summary.name}` : "Restaurant";

    const shareApi = (
      navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
    ).share;

    if (shareApi) {
      try {
        await shareApi({ title, url });
        return;
      } catch {
        // user canceled or unsupported; fallback to clipboard
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        window.alert("Link copied");
        return;
      } catch {
        // ignore
      }
    }

    window.prompt("Copy this link:", url);
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <section
        className="relative w-full overflow-hidden"
        style={{
          background: "radial-gradient(1200px 600px at 50% -10%, rgba(0,0,0,0.08), transparent)",
        }}
        aria-label="Detail header"
      >
        <div className="relative mx-auto w-full max-w-107.5 px-4 pt-4">
          <HomeHeader />

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--Neutral-300,#D5D7DA) bg-white"
              aria-label="Back"
            >
              <img src={backIconUrl} alt="" className="h-6 w-6" aria-hidden />
            </button>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "var(--text-display-xs)",
                lineHeight: "var(--leading-display-xs)",
                color: "var(--Neutral-950, #0A0D12)",
              }}
            >
              Detail
            </h1>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-107.5 px-4 pb-10 pt-4">
        {summary ? (
          <section aria-label="Restaurant hero" className="space-y-4">
            <div className="overflow-hidden rounded-3xl bg-[hsl(var(--muted))] shadow-[0px_0px_20px_0px_#CBCACA40]">
              {heroImages.length ? (
                <div
                  ref={carouselRef}
                  className="no-scrollbar flex h-64 w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
                >
                  {heroImages.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="min-w-full snap-center">
                      <img
                        src={url}
                        alt={summary.name}
                        className="h-64 w-full object-cover"
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-64 w-full items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
                  No image
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2" aria-label="Image pagination">
              {Array.from({ length: dotModel.dotCount }).map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  type="button"
                  className={
                    idx === dotModel.activeDot
                      ? "h-2 w-2 rounded-full bg-[hsl(var(--foreground))]"
                      : "h-2 w-2 rounded-full bg-[hsl(var(--muted))]"
                  }
                  aria-label={`Go to image ${idx + 1}`}
                  onClick={() => {
                    const el = carouselRef.current;
                    if (!el) return;
                    const targetIndex = dotModel.indexForDot[idx] ?? 0;
                    el.scrollTo({
                      left: targetIndex * el.clientWidth,
                      behavior: "smooth",
                    });
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                  {summary.imageUrl ? (
                    <img
                      src={summary.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      aria-hidden
                      loading="lazy"
                    />
                  ) : null}
                </div>

                <div className="min-w-0">
                  <div
                    className="truncate"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 800,
                      fontSize: "var(--text-text-lg)",
                      lineHeight: "var(--leading-text-lg)",
                      color: "var(--Neutral-950, #0A0D12)",
                    }}
                  >
                    {summary.name}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <img src={starUrl} alt="" className="h-5 w-5" aria-hidden />
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        fontSize: "var(--text-text-md)",
                        lineHeight: "var(--leading-text-md)",
                        color: "var(--Neutral-950, #0A0D12)",
                      }}
                    >
                      {typeof summary.star === "number" ? summary.star.toFixed(1) : "-"}
                    </div>
                  </div>

                  <div
                    className="mt-1 truncate"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      fontSize: "var(--text-text-sm)",
                      lineHeight: "var(--leading-text-sm)",
                      letterSpacing: "-0.02em",
                      color: "var(--Neutral-950, #0A0D12)",
                    }}
                  >
                    {placeLine || "-"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onShare}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-(--Neutral-300,#D5D7DA) bg-white"
                aria-label="Share"
              >
                <img src={shareIconUrl} alt="" className="h-6 w-6" aria-hidden />
              </button>
            </div>
          </section>
        ) : null}

        <section className="mt-6" aria-label="Restaurant menus">
          <div className="flex items-center justify-between">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "var(--text-text-lg)",
                lineHeight: "var(--leading-text-lg)",
                color: "var(--Neutral-950, #0A0D12)",
              }}
            >
              Menu
            </h2>

            {detailQuery.isFetching ? (
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Loading…</div>
            ) : null}
          </div>

          {detailQuery.isError ? (
            <div className="mt-3 rounded-2xl bg-[hsl(var(--muted))] px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
              {getErrorMessage(detailQuery.error, "Gagal memuat detail")}
            </div>
          ) : null}

          {detailQuery.data?.menus?.length ? (
            <div className="mt-3 space-y-3">
              {detailQuery.data.menus.map((m) => (
                <div
                  key={m.id}
                  className="flex gap-3 rounded-2xl bg-white p-3 shadow-[0px_0px_20px_0px_#CBCACA40]"
                >
                  {m.imageUrl ? (
                    <img
                      src={m.imageUrl}
                      alt={m.name}
                      className="h-18 w-18 shrink-0 rounded-[14px] object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-[14px] bg-[hsl(var(--muted))] text-[11px] text-[hsl(var(--muted-foreground))]">
                      No image
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold text-(--Neutral-950,#0A0D12)">
                      {m.name}
                    </div>
                    {m.description ? (
                      <div className="mt-1 line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">
                        {m.description}
                      </div>
                    ) : null}
                    <div className="mt-2 text-sm font-semibold text-(--Neutral-950,#0A0D12)">
                      {typeof m.price === "number" ? formatCurrency(m.price) : "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : detailQuery.isSuccess ? (
            <div className="mt-3 rounded-2xl bg-[hsl(var(--muted))] px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Tidak ada menu untuk ditampilkan.
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
