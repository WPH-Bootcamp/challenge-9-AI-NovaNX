import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios";

export function useOrdersQuery() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.get("/orders");
      return response.data;
    },
  });
}
