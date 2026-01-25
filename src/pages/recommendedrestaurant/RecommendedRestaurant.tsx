import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import starUrl from "../../assets/images/StarMobile.svg";
import { getAuthToken } from "../../services/auth/token";
import type { RecommendedRestaurant } from "./RecommendedRestaurant";

type UserCoords = { lat: number; long: number };

type RecommendedDebugInfo = {
  url: string;
  hasToken: boolean;
  status?: number;
  statusText?: string;
  contentType?: string;
  responseTopKeys?: string[];
  dataTopKeys?: string[];
  restaurantsExtractedCount?: number;
  bodySnippet?: string;
};

class RecommendedDebugError extends Error {
  debug?: RecommendedDebugInfo;

  constructor(message: string, debug?: RecommendedDebugInfo) {
    super(message);
    this.name = "RecommendedDebugError";
    this.debug = debug;
  }
}

function getDebugFromUnknownError(
  err: unknown,
): RecommendedDebugInfo | undefined {
  if (err && typeof err === "object" && "debug" in err) {
    const debug = (err as any).debug as unknown;
    if (isRecord(debug)) return debug as RecommendedDebugInfo;
  }
  return undefined;
}

function isDebugEnabled(): boolean {
  if (!import.meta.env.DEV) return false;
  try {
    return new URLSearchParams(window.location.search).has("debugRecommended");
  } catch {
    return false;
  }
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
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value)) {
    const candidate =
      (value as any).data ??
      (value as any).items ??
      (value as any).recommendations ??
      (value as any).restaurants;
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function getNested(root: unknown, path: Array<string>): unknown {
  let current: unknown = root;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

function findRestaurantArray(root: unknown): unknown[] | null {
  const visited = new Set<unknown>();
  const queue: Array<{ node: unknown; depth: number }> = [
    { node: root, depth: 0 },
  ];

  const looksLikeRestaurantRecord = (value: unknown) =>
    isRecord(value) &&
    ("id" in value ||
      "_id" in value ||
      "name" in value ||
      "title" in value ||
      "restaurantId" in value ||
      "restaurant_id" in value ||
      "restoId" in value ||
      "resto_id" in value ||
      "restaurantName" in value ||
      "restaurant_name" in value ||
      "restoName" in value ||
      "resto_name" in value);

  const looksLikeRecommendationWrapper = (value: unknown) => {
    if (!isRecord(value)) return false;
    const candidates = [
      (value as any).restaurant,
      (value as any).resto,
      (value as any).restaurantDetail,
      (value as any).restaurant_detail,
      (value as any).data,
    ];
    return candidates.some(looksLikeRestaurantRecord);
  };

  while (queue.length) {
    const { node, depth } = queue.shift()!;
    if (depth > 6) continue;
    if (!isRecord(node) && !Array.isArray(node)) continue;
    if (visited.has(node)) continue;
    visited.add(node);

    if (Array.isArray(node)) {
      const maybeRestaurant = node.find(
        (item) =>
          looksLikeRestaurantRecord(item) ||
          looksLikeRecommendationWrapper(item),
      );
      if (maybeRestaurant) return node;
      for (const item of node) queue.push({ node: item, depth: depth + 1 });
      continue;
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        const maybeRestaurant = value.find(
          (item) =>
            looksLikeRestaurantRecord(item) ||
            looksLikeRecommendationWrapper(item),
        );
        if (maybeRestaurant) return value;
      }
      queue.push({ node: value, depth: depth + 1 });
    }
  }

  return null;
}

function normalizeBaseUrl(raw: string | undefined): string {
  if (!raw) return "";

  let value = raw.trim();
  while (value.endsWith("/")) value = value.slice(0, -1);
  value = value.replace(/\/api-swagger$/i, "");
  return value;
}

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL as string | undefined,
);
const RECOMMENDED_URL = API_BASE_URL
  ? `${API_BASE_URL}/api/resto/recommended`
  : "/api/resto/recommended";

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

function firstImageUrl(images: unknown): string | undefined {
  const list = extractArray(images);
  const first = list[0];
  if (typeof first === "string") return first;
  if (isRecord(first)) {
    return (
      asString(first.url) ||
      asString(first.imageUrl) ||
      asString(first.image_url) ||
      asString(first.path)
    );
  }
  return undefined;
}

function mapRestaurant(raw: unknown): RecommendedRestaurant | null {
  if (!isRecord(raw)) return null;

  const unwrapped =
    (isRecord((raw as any).restaurant) && (raw as any).restaurant) ||
    (isRecord((raw as any).resto) && (raw as any).resto) ||
    (isRecord((raw as any).restaurantDetail) &&
      (raw as any).restaurantDetail) ||
    (isRecord((raw as any).restaurant_detail) &&
      (raw as any).restaurant_detail) ||
    (isRecord((raw as any).data) && (raw as any).data) ||
    raw;

  const source = isRecord(unwrapped) ? unwrapped : raw;

  const id =
    asString(source.id) ??
    asString((source as any)._id) ??
    asString((source as any).restaurantId) ??
    asString((source as any).restaurant_id) ??
    asString((source as any).restoId) ??
    asString((source as any).resto_id);
  const name =
    asString(source.name) ??
    asString((source as any).title) ??
    asString((source as any).restaurantName) ??
    asString((source as any).restaurant_name) ??
    asString((source as any).restoName) ??
    asString((source as any).resto_name);
  if (!id || !name) return null;

  const star =
    asNumber((source as any).star) ?? asNumber((source as any).rating);
  const place =
    asString((source as any).place) ?? asString((source as any).address);

  const lat =
    asNumber((source as any).lat) ??
    asNumber((source as any).latitude) ??
    asNumber((source as any).restaurantLat) ??
    asNumber((source as any).restaurant_lat) ??
    asNumber(getNested(source, ["location", "lat"])) ??
    asNumber(getNested(source, ["location", "latitude"])) ??
    asNumber(getNested(source, ["coords", "lat"])) ??
    asNumber(getNested(source, ["coords", "latitude"]));

  const long =
    asNumber((source as any).long) ??
    asNumber((source as any).lng) ??
    asNumber((source as any).longitude) ??
    asNumber((source as any).restaurantLong) ??
    asNumber((source as any).restaurant_long) ??
    asNumber(getNested(source, ["location", "long"])) ??
    asNumber(getNested(source, ["location", "lng"])) ??
    asNumber(getNested(source, ["location", "longitude"])) ??
    asNumber(getNested(source, ["coords", "long"])) ??
    asNumber(getNested(source, ["coords", "lng"])) ??
    asNumber(getNested(source, ["coords", "longitude"]));

  const imageUrl = normalizeImageUrl(
    firstImageUrl((source as any).images) ||
      asString((source as any).logo) ||
      asString((source as any).imageUrl) ||
      asString((source as any).image_url) ||
      asString((source as any).image) ||
      asString((source as any).photo),
  );

  return { id, name, star, place, lat, long, imageUrl };
}

function useUserLocation() {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "denied" | "unavailable" | "error"
  >("idle");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          long: pos.coords.longitude,
        });
        setStatus("ready");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
        } else {
          setStatus("error");
        }
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );
  }, []);

  return { coords, status };
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

export function useRecommendedRestaurantsQuery() {
  return useQuery({
    queryKey: ["restaurants", "recommended"],
    queryFn: async () => {
      const token = getAuthToken();

      const debug: RecommendedDebugInfo = {
        url: RECOMMENDED_URL,
        hasToken: Boolean(token),
      };

      if (!token)
        throw new RecommendedDebugError("Access token required", debug);

      const res = await fetch(RECOMMENDED_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      debug.status = res.status;
      debug.statusText = res.statusText;
      debug.contentType = res.headers.get("content-type") ?? undefined;

      let bodyText = "";
      try {
        bodyText = await res.text();
      } catch {
        bodyText = "";
      }
      debug.bodySnippet = bodyText.slice(0, 800);

      let json: unknown = null;
      try {
        json = bodyText ? (JSON.parse(bodyText) as unknown) : null;
      } catch {
        json = null;
      }

      if (isDebugEnabled()) {
        const keys = isRecord(json)
          ? Object.keys(json).slice(0, 50)
          : undefined;
        console.debug("[recommended] response summary", {
          url: debug.url,
          status: debug.status,
          contentType: debug.contentType,
          responseTopKeys: keys,
        });
      }

      if (!res.ok) {
        const message =
          (isRecord(json) ? asString(json.message) : undefined) ||
          `Request failed (${res.status})`;
        throw new RecommendedDebugError(message, {
          ...debug,
          responseTopKeys: isRecord(json) ? Object.keys(json) : undefined,
        });
      }

      const payload = isRecord(json) ? json : null;
      debug.responseTopKeys = payload ? Object.keys(payload) : undefined;
      const successFlag = payload ? payload.success : undefined;
      if (successFlag === false) {
        throw new RecommendedDebugError(
          (payload ? asString(payload.message) : undefined) ||
            "Request rejected",
          debug,
        );
      }

      const dataNode =
        payload && isRecord(payload.data) ? payload.data : payload;
      debug.dataTopKeys = isRecord(dataNode)
        ? Object.keys(dataNode)
        : undefined;

      const restaurantsNode =
        (dataNode && isRecord(dataNode)
          ? (dataNode.recommendations ?? dataNode.restaurants ?? dataNode.data)
          : undefined) ??
        getNested(payload, ["data", "recommendations"]) ??
        getNested(payload, ["data", "restaurants"]) ??
        getNested(payload, ["data", "data"]) ??
        getNested(payload, ["data", "data", "recommendations"]) ??
        getNested(payload, ["data", "data", "restaurants"]) ??
        getNested(payload, ["data", "data", "data"]);

      const fallback = findRestaurantArray(payload);

      const restaurants = (fallback ?? extractArray(restaurantsNode))
        .map(mapRestaurant)
        .filter((r): r is RecommendedRestaurant => Boolean(r));
      debug.restaurantsExtractedCount = restaurants.length;

      return { restaurants, debug };
    },
  });
}

export function RecommendedRestaurantPage() {
  const restaurantsQuery = useRecommendedRestaurantsQuery();
  const { coords: userCoords } = useUserLocation();
  const [visibleCount, setVisibleCount] = useState(5);
  const debugEnabled = isDebugEnabled();
  const debugFromError = getDebugFromUnknownError(restaurantsQuery.error);
  const debugInfo = restaurantsQuery.data?.debug ?? debugFromError;

  const restaurants = (restaurantsQuery.data?.restaurants ??
    []) as RecommendedRestaurant[];

  const visible = useMemo(
    () => restaurants.slice(0, visibleCount),
    [restaurants, visibleCount],
  );

  const canShowMore = visibleCount < restaurants.length;

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 py-6">
      <div className="flex items-center justify-between">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "var(--text-display-xs)",
            lineHeight: "var(--leading-display-xs)",
            letterSpacing: "0%",
            color: "var(--Neutral-950, #0A0D12)",
          }}
        >
          Recommended
        </h1>

        <button
          type="button"
          onClick={() => setVisibleCount(restaurants.length || 5)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 800,
            fontSize: "var(--text-text-md)",
            lineHeight: "var(--leading-text-md)",
            letterSpacing: "0%",
            textAlign: "right",
            color: "var(--Primary-100, #C12116)",
            background: "transparent",
          }}
        >
          See All
        </button>
      </div>

      {restaurantsQuery.isLoading ? (
        <div
          className="mt-6 text-center text-sm"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "var(--text-text-sm)",
            lineHeight: "var(--leading-text-sm)",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Loading…
        </div>
      ) : restaurantsQuery.isError ? (
        <div
          className="mt-6 rounded-[16px] bg-[hsl(var(--muted))] px-4 py-3 text-sm"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "var(--text-text-sm)",
            lineHeight: "var(--leading-text-sm)",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          {`Gagal memuat data restaurant: ${String((restaurantsQuery.error as any)?.message ?? "Unknown error")}`}
          {debugEnabled && debugInfo ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs">Debug</summary>
              <pre className="mt-2 overflow-auto rounded-[12px] bg-black/5 p-3 text-[11px] leading-snug">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          ) : null}
        </div>
      ) : restaurants.length === 0 ? (
        <div
          className="mt-6 rounded-[16px] bg-[hsl(var(--muted))] px-4 py-8 text-center text-sm"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "var(--text-text-sm)",
            lineHeight: "var(--leading-text-sm)",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Tidak ada data restaurant untuk ditampilkan.
          {debugEnabled && debugInfo ? (
            <details className="mt-3 text-left">
              <summary className="cursor-pointer text-xs">Debug</summary>
              <pre className="mt-2 overflow-auto rounded-[12px] bg-black/5 p-3 text-[11px] leading-snug">
                {JSON.stringify(
                  {
                    ...debugInfo,
                    geoStatus: userCoords ? "ready" : "unknown",
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {visible.map((r) => {
            const distanceKm =
              userCoords &&
              typeof r.lat === "number" &&
              typeof r.long === "number"
                ? haversineKm(userCoords.lat, userCoords.long, r.lat, r.long)
                : undefined;

            const distanceText = formatKm(distanceKm);
            const placeLine = r.place
              ? distanceText
                ? `${r.place} . ${distanceText}`
                : r.place
              : distanceText;

            return (
              <div
                key={r.id}
                className="mx-auto flex h-[114px] w-[361px] gap-2 rounded-[16px] bg-white p-3 opacity-100 shadow-[0px_0px_20px_0px_#CBCACA40]"
              >
                {r.imageUrl ? (
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="h-[90px] w-[90px] shrink-0 rounded-[16px] object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-[16px] bg-[hsl(var(--muted))] text-xs text-[hsl(var(--muted-foreground))]">
                    No image
                  </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <div
                    className="truncate"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 800,
                      fontSize: "var(--text-text-md)",
                      lineHeight: "var(--leading-text-md)",
                      letterSpacing: "0%",
                      color: "var(--Neutral-950, #0A0D12)",
                    }}
                  >
                    {r.name}
                  </div>

                  <div className="mt-1 flex items-center gap-1">
                    <img src={starUrl} alt="" className="h-4 w-4" aria-hidden />
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        fontSize: "var(--text-text-sm)",
                        lineHeight: "var(--leading-text-sm)",
                        letterSpacing: "0%",
                        textAlign: "center",
                        color: "var(--Neutral-950, #0A0D12)",
                      }}
                    >
                      {typeof r.star === "number" ? r.star.toFixed(1) : "-"}
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
            );
          })}

          {canShowMore ? (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((current) =>
                    Math.min(current + 5, restaurants.length),
                  )
                }
                className="h-10 w-[160px] rounded-[100px] border border-[var(--Neutral-300,#D5D7DA)] bg-transparent px-2 opacity-100"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "var(--text-text-sm)",
                  lineHeight: "var(--leading-text-sm)",
                  letterSpacing: "-0.02em",
                  color: "var(--Neutral-950, #0A0D12)",
                }}
              >
                Show More
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
