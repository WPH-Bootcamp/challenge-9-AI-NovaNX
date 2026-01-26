import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios";

import type { MenuItem } from "../../types/menu";

export type MenusQueryParams = {
  restaurantId?: string;
  search?: string;
  categoryId?: string;
  sortBy?: "price" | "rating" | "name";
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value) && Array.isArray(value.data)) return value.data;
  return [];
}

function mapMenu(raw: unknown): MenuItem | null {
  if (!isRecord(raw)) return null;

  const id = asString(raw.id) ?? asString(raw.menuId);
  const name = asString(raw.name);
  const price = asNumber(raw.price) ?? asNumber(raw.priceValue);

  if (!id || !name || typeof price !== "number") return null;

  const imageUrl =
    asString(raw.imageUrl) ?? asString(raw.image_url) ?? asString(raw.image);
  const rating = asNumber(raw.rating);
  const categoryId = asString(raw.categoryId) ?? asString(raw.category_id);

  return {
    id,
    name,
    price,
    rating,
    imageUrl,
    categoryId,
  };
}

export function useMenusQuery(params: MenusQueryParams) {
  return useQuery({
    queryKey: [
      "menus",
      params.restaurantId ?? "",
      params.search ?? "",
      params.categoryId ?? "",
      params.sortBy ?? "",
      params.sortOrder ?? "",
      params.minPrice ?? null,
      params.maxPrice ?? null,
      params.minRating ?? null,
    ],
    queryFn: async () => {
      // Backend uses restaurant-based endpoints; requires auth token.
      let restaurantId = params.restaurantId;
      if (!restaurantId) {
        const recommended = await api.get("/api/resto/recommended");
        const restaurants = extractArray(recommended.data);
        const first = restaurants[0];
        if (isRecord(first)) {
          restaurantId = asString(first.id);
        }
      }

      if (!restaurantId) {
        return { data: [] as MenuItem[] };
      }

      const detail = await api.get(`/api/resto/${restaurantId}`);
      const detailPayload = isRecord(detail.data) ? detail.data : null;

      const maybeRestaurant =
        detailPayload && isRecord(detailPayload.data)
          ? detailPayload.data
          : detailPayload;

      const rawMenus =
        maybeRestaurant && isRecord(maybeRestaurant)
          ? (maybeRestaurant.menus ?? maybeRestaurant.menu)
          : undefined;

      const menus = extractArray(rawMenus)
        .map(mapMenu)
        .filter((m): m is MenuItem => Boolean(m));

      return { data: menus };
    },
  });
}
