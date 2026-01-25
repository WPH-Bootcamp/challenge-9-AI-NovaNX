import { useQuery } from "@tanstack/react-query";

import { api } from "../services/api/axios";

export type Restaurant = {
  id: string;
  name: string;
  heroImageUrl?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value) && Array.isArray(value.data)) return value.data;
  return [];
}

function normalizeBaseUrl(raw: string | undefined): string {
  if (!raw) return "";

  let value = raw.trim();
  while (value.endsWith("/")) value = value.slice(0, -1);
  value = value.replace(/\/api-swagger$/i, "");
  return value;
}

function normalizeImageUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = normalizeBaseUrl(
    import.meta.env.VITE_API_BASE_URL as string | undefined,
  );
  if (!base) return trimmed;

  try {
    return new URL(trimmed, base).toString();
  } catch {
    return trimmed;
  }
}

function firstImageUrl(images: unknown): string | undefined {
  const arr = extractArray(images);
  const first = arr[0];
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

export function mapRestaurant(raw: unknown): Restaurant | null {
  if (!isRecord(raw)) return null;

  const id = asString(raw.id);
  const name = asString(raw.name) ?? asString(raw.restaurantName);

  if (!id || !name) return null;

  // Swagger schema uses `images` (array) and `logo`.
  const heroImageUrl = normalizeImageUrl(
    firstImageUrl(raw.images) ||
      asString(raw.logo) ||
      asString(raw.imageUrl) ||
      asString(raw.image_url),
  );

  return { id, name, heroImageUrl };
}

export function useRecommendedRestaurantsQuery() {
  return useQuery({
    queryKey: ["restaurants", "recommended"],
    queryFn: async () => {
      const res = await api.get("/api/resto/recommended");
      const list = extractArray(res.data);
      return list.map(mapRestaurant).filter((r): r is Restaurant => Boolean(r));
    },
  });
}
