import { useMemo } from "react";

import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";

import { useAppDispatch, useAppSelector } from "../../features/hooks";
import {
  resetFilters,
  setCategoryId,
  setMaxPrice,
  setMinPrice,
  setMinRating,
  setSearch,
  setSort,
  type SortBy,
  type SortOrder,
} from "../../features/filters/filtersSlice";

import { addToCart } from "../../features/cart/cartSlice";
import { useMenusQuery } from "../../services/queries/menus";
import type { MenuItem } from "../../types/menu";
import { MenuCard } from "../../components/menu/MenuCard";

function asNumberOrUndefined(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

function sortItems(
  items: MenuItem[],
  sortBy: SortBy | null,
  sortOrder: SortOrder,
) {
  if (!sortBy) return items;

  const sorted = [...items].sort((a, b) => {
    const dir = sortOrder === "asc" ? 1 : -1;

    if (sortBy === "name") {
      return dir * a.name.localeCompare(b.name);
    }

    if (sortBy === "price") {
      return dir * (a.price - b.price);
    }

    // rating
    const ar = typeof a.rating === "number" ? a.rating : -1;
    const br = typeof b.rating === "number" ? b.rating : -1;
    return dir * (ar - br);
  });

  return sorted;
}

export function MenuPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);

  // Fetch server state via React Query; filtering/sorting tetap authoritative di Redux (client state)
  const queryParams = useMemo(() => ({}), []);
  const menusQuery = useMenusQuery(queryParams);

  const allMenus = useMemo(() => {
    return (menusQuery.data?.data ?? menusQuery.data ?? []) as MenuItem[];
  }, [menusQuery.data]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of allMenus) {
      if (item.categoryId) map.set(item.categoryId, item.categoryId);
    }
    return Array.from(map.keys()).sort();
  }, [allMenus]);

  const filteredMenus = useMemo(() => {
    const searchLower = filters.search.trim().toLowerCase();

    let list = allMenus;

    if (filters.categoryId) {
      list = list.filter((m) => m.categoryId === filters.categoryId);
    }

    if (typeof filters.minPrice === "number") {
      list = list.filter((m) => m.price >= filters.minPrice!);
    }

    if (typeof filters.maxPrice === "number") {
      list = list.filter((m) => m.price <= filters.maxPrice!);
    }

    if (typeof filters.minRating === "number") {
      list = list.filter((m) => (m.rating ?? 0) >= filters.minRating!);
    }

    if (searchLower) {
      list = list.filter((m) => m.name.toLowerCase().includes(searchLower));
    }

    return sortItems(list, filters.sortBy, filters.sortOrder);
  }, [allMenus, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Menu</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Explore makanan & minuman, lalu tambahkan ke cart.
          </p>
        </div>

        <Button variant="outline" onClick={() => dispatch(resetFilters())}>
          Reset filters
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter & Sort</CardTitle>
          <CardDescription>
            Filter disimpan di Redux (client/UI state).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1 text-sm font-medium">
              <span>Search</span>
              <Input
                value={filters.search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
                placeholder="Cari menu..."
              />
            </label>

            <label className="space-y-1 text-sm font-medium">
              <span>Category</span>
              <select
                className="h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                value={filters.categoryId ?? ""}
                onChange={(e) =>
                  dispatch(
                    setCategoryId(e.target.value ? e.target.value : null),
                  )
                }
              >
                <option value="">All</option>
                {categories.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium">
              <span>Min price</span>
              <Input
                inputMode="numeric"
                placeholder="0"
                value={filters.minPrice ?? ""}
                onChange={(e) =>
                  dispatch(setMinPrice(asNumberOrUndefined(e.target.value)))
                }
              />
            </label>

            <label className="space-y-1 text-sm font-medium">
              <span>Max price</span>
              <Input
                inputMode="numeric"
                placeholder="0"
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                  dispatch(setMaxPrice(asNumberOrUndefined(e.target.value)))
                }
              />
            </label>

            <label className="space-y-1 text-sm font-medium">
              <span>Min rating</span>
              <Input
                inputMode="decimal"
                placeholder="0"
                value={filters.minRating ?? ""}
                onChange={(e) =>
                  dispatch(setMinRating(asNumberOrUndefined(e.target.value)))
                }
              />
            </label>

            <label className="space-y-1 text-sm font-medium">
              <span>Sort by</span>
              <select
                className="h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                value={filters.sortBy ?? ""}
                onChange={(e) => {
                  const sortBy = (
                    e.target.value ? (e.target.value as SortBy) : null
                  ) satisfies SortBy | null;
                  dispatch(setSort({ sortBy }));
                }}
              >
                <option value="">Default</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium">
              <span>Order</span>
              <select
                className="h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                value={filters.sortOrder}
                onChange={(e) =>
                  dispatch(
                    setSort({
                      sortBy: filters.sortBy,
                      sortOrder: e.target.value as SortOrder,
                    }),
                  )
                }
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </label>
          </div>
        </CardContent>
      </Card>

      {menusQuery.isLoading ? (
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          Loading menus...
        </div>
      ) : menusQuery.isError ? (
        <div className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load menus.
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          No menus matched your filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMenus.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onAddToCart={(menu) =>
                dispatch(
                  addToCart({
                    id: menu.id,
                    name: menu.name,
                    price: menu.price,
                    imageUrl: menu.imageUrl,
                  }),
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
