import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios";

export type MenusQueryParams = {
  search?: string;
  categoryId?: string;
  sortBy?: "price" | "rating" | "name";
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
};

export function useMenusQuery(params: MenusQueryParams) {
  return useQuery({
    queryKey: ["menus", params],
    queryFn: async () => {
      const response = await api.get("/menus", { params });
      return response.data;
    },
  });
}
