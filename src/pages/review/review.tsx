import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import starIconUrl from "../../assets/images/material-symbols_star-rounded_Mobile.svg";
import { HomeHeader } from "../../components/layout/HomeHeader";
import { getAuthToken } from "../../services/auth/token";

import type { UserReview, UserReviewsResult } from "./review";

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

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value)) {
    const candidate =
      value["data"] ??
      value["items"] ??
      value["reviews"] ??
      value["myReviews"] ??
      value["my_reviews"];
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

function mapReview(raw: unknown): UserReview | null {
  if (!isRecord(raw)) return null;

  const id =
    asString(raw["id"]) ??
    asString(raw["_id"]) ??
    asString(raw["reviewId"]) ??
    asString(raw["review_id"]);

  const rating =
    asNumber(raw["rating"]) ??
    asNumber(raw["star"]) ??
    asNumber(raw["stars"]) ??
    0;

  const comment =
    asString(raw["comment"]) ??
    asString(raw["review"]) ??
    asString(raw["message"]) ??
    "";

  const createdAt =
    asString(raw["createdAt"]) ??
    asString(raw["created_at"]) ??
    asString(raw["date"]);

  const userNode =
    (isRecord(raw["user"]) ? (raw["user"] as Record<string, unknown>) : null) ||
    (isRecord(raw["author"])
      ? (raw["author"] as Record<string, unknown>)
      : null) ||
    (isRecord(raw["profile"])
      ? (raw["profile"] as Record<string, unknown>)
      : null);

  const userName =
    (userNode &&
      (asString(userNode["name"]) ||
        asString(userNode["fullName"]) ||
        asString(userNode["full_name"]) ||
        asString(userNode["username"]))) ||
    asString(raw["userName"]) ||
    asString(raw["username"]) ||
    "User";

  const userAvatarUrl = normalizeImageUrl(
    (userNode &&
      (asString(userNode["avatarUrl"]) ||
        asString(userNode["avatar_url"]) ||
        asString(userNode["avatar"]) ||
        asString(userNode["photo"]) ||
        asString(userNode["imageUrl"]) ||
        asString(userNode["image_url"]))) ||
      asString(raw["avatarUrl"]) ||
      asString(raw["avatar_url"]),
  );

  if (!id) return null;

  return {
    id,
    userName,
    userAvatarUrl,
    rating: Number.isFinite(rating) ? rating : 0,
    comment,
    createdAt,
  };
}

function mapReviews(payload: unknown): UserReviewsResult {
  const node: Record<string, unknown> = isRecord(payload) ? payload : {};
  const dataNode: unknown = isRecord(node.data) ? node.data : node;

  const reviewsNode =
    getNested(dataNode, ["reviews"]) ??
    getNested(dataNode, ["items"]) ??
    getNested(dataNode, ["data"]) ??
    getNested(node, ["data", "reviews"]) ??
    getNested(node, ["reviews"]) ??
    dataNode;

  const reviews = extractArray(reviewsNode)
    .map(mapReview)
    .filter((r): r is UserReview => Boolean(r));

  const total =
    asNumber(getNested(node, ["data", "total"])) ??
    asNumber(getNested(node, ["total"])) ??
    asNumber(getNested(node, ["pagination", "total"])) ??
    asNumber(getNested(node, ["meta", "total"])) ??
    asNumber(getNested(node, ["data", "pagination", "total"])) ??
    undefined;

  const averageRating =
    asNumber(getNested(node, ["data", "averageRating"])) ??
    asNumber(getNested(node, ["data", "avgRating"])) ??
    asNumber(getNested(node, ["averageRating"])) ??
    asNumber(getNested(node, ["avgRating"])) ??
    undefined;

  return {
    reviews,
    total: total ?? reviews.length,
    averageRating:
      typeof averageRating === "number"
        ? averageRating
        : reviews.length
          ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
          : undefined,
  };
}

function formatReviewDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const date = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);

  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

  return `${date}, ${time}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${last}`.toUpperCase();
}

export function ReviewPage() {
  const params = useParams();
  const restaurantId = params.restaurantId ?? "";
  const pageKey = restaurantId || "__missing__";
  const [visibleCountByKey, setVisibleCountByKey] = useState<
    Record<string, number>
  >({});
  const visibleCount = visibleCountByKey[pageKey] ?? 6;

  const reviewUrl = useMemo(() => {
    if (!restaurantId) return "";
    const base = API_BASE_URL
      ? `${API_BASE_URL}/api/review/restaurant/${restaurantId}`
      : `/api/review/restaurant/${restaurantId}`;
    // Fetch more than we render; we paginate client-side.
    return `${base}?page=1&limit=100`;
  }, [restaurantId]);

  const reviewsQuery = useQuery({
    queryKey: ["reviews", "restaurant", restaurantId],
    enabled: Boolean(restaurantId),
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) throw new Error("Access token required");

      if (!reviewUrl) throw new Error("Restaurant id required");

      const res = await fetch(reviewUrl, {
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
          (isRecord(json) ? asString(json["message"]) : undefined) ||
          `Request failed (${res.status})`;
        throw new Error(message);
      }

      return mapReviews(json);
    },
  });

  const visibleReviews = useMemo(() => {
    return (reviewsQuery.data?.reviews ?? []).slice(0, visibleCount);
  }, [reviewsQuery.data?.reviews, visibleCount]);

  const totalCount = reviewsQuery.data?.total ?? 0;
  const avg = reviewsQuery.data?.averageRating;

  const canShowMore = (reviewsQuery.data?.reviews?.length ?? 0) > visibleCount;

  return (
    <div className="mx-auto w-full max-w-107.5 px-4 py-6">
      <HomeHeader />

      <div className="mt-4">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "var(--text-display-xs)",
            lineHeight: "var(--leading-display-xs)",
            color: "var(--Neutral-950, #0A0D12)",
          }}
        >
          Review
        </h1>

        <div className="mt-2 flex items-center gap-2">
          <img src={starIconUrl} alt="" className="h-5 w-5" aria-hidden />
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "var(--text-text-sm)",
              lineHeight: "var(--leading-text-sm)",
              letterSpacing: "-0.02em",
              color: "var(--Neutral-950, #0A0D12)",
            }}
          >
            {typeof avg === "number" ? avg.toFixed(1) : "-"} ({totalCount} Ulasan)
          </div>
        </div>
      </div>

      {reviewsQuery.isLoading ? (
        <div className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">Loading…</div>
      ) : reviewsQuery.isError ? (
        <div className="mt-6 rounded-2xl bg-[hsl(var(--muted))] px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
          {(reviewsQuery.error as Error)?.message ?? "Gagal memuat review"}
        </div>
      ) : !restaurantId ? (
        <div className="mt-6 rounded-2xl bg-[hsl(var(--muted))] px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Restaurant id is required.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {visibleReviews.map((r) => {
            const ratingRounded = Math.max(0, Math.min(5, Math.round(r.rating)));
            const dateText = formatReviewDate(r.createdAt);
            return (
              <div
                key={r.id}
                className="rounded-2xl bg-white p-4 shadow-[0px_0px_20px_0px_#CBCACA40]"
              >
                <div className="flex gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    {r.userAvatarUrl ? (
                      <img
                        src={r.userAvatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        aria-hidden
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-sm font-bold text-(--Neutral-950,#0A0D12)"
                        aria-hidden
                      >
                        {initials(r.userName)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 800,
                        fontSize: "var(--text-text-sm)",
                        lineHeight: "var(--leading-text-sm)",
                        color: "var(--Neutral-950, #0A0D12)",
                      }}
                    >
                      {r.userName}
                    </div>

                    {dateText ? (
                      <div
                        className="mt-1 text-xs"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                          fontSize: "var(--text-text-xs)",
                          lineHeight: "var(--leading-text-xs)",
                          letterSpacing: "-0.02em",
                          color: "hsl(var(--muted-foreground))",
                        }}
                      >
                        {dateText}
                      </div>
                    ) : null}

                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <img
                          key={`star-${r.id}-${idx}`}
                          src={starIconUrl}
                          alt=""
                          aria-hidden
                          className={`h-5 w-5 ${idx < ratingRounded ? "opacity-100" : "opacity-30"}`}
                        />
                      ))}
                    </div>

                    <div
                      className="mt-3 text-sm"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "var(--text-text-sm)",
                        lineHeight: "var(--leading-text-sm)",
                        letterSpacing: "-0.02em",
                        color: "var(--Neutral-950, #0A0D12)",
                      }}
                    >
                      {r.comment}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {canShowMore ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() =>
                  setVisibleCountByKey((prev) => {
                    const current = prev[pageKey] ?? 6;
                    const total = reviewsQuery.data?.reviews.length ?? current;
                    const next = Math.min(current + 6, total);
                    return { ...prev, [pageKey]: next };
                  })
                }
                className="h-10 w-40 rounded-[100px] border border-(--Neutral-300,#D5D7DA) bg-transparent px-2 opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
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
