import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios";

import type { Order } from "../../types/order";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export type CreateOrderInput = {
  name: string;
  phone: string;
  address: string;
  items: Array<{ menuId: string; quantity: number }>;
  total?: number;
  createdAt?: string;
};

export function useOrdersQuery() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.get("/api/order/my-order");
      return response.data;
    },
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const response = await api.post("/api/order/checkout", input);
      return response.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });

      const previous = queryClient.getQueryData(["orders"]);

      const optimisticOrder: Order = {
        id: `temp-${Date.now()}`,
        createdAt: input.createdAt,
        items: input.items,
        total: input.total,
      };

      queryClient.setQueryData(["orders"], (current: unknown) => {
        const currentRecord = isRecord(current) ? current : null;
        const wrapped = currentRecord ? currentRecord["data"] : undefined;

        const list = Array.isArray(wrapped)
          ? (wrapped as Order[])
          : Array.isArray(current)
            ? (current as Order[])
            : ([] as Order[]);

        const next = [optimisticOrder, ...list];
        // preserve "{ data: [...] }" shape if it exists
        if (currentRecord && Array.isArray(wrapped)) {
          return { ...currentRecord, data: next };
        }
        return next;
      });

      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(["orders"], ctx.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
