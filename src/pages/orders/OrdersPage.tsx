import dayjs from "dayjs";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";

import { useOrdersQuery } from "../../services/queries/orders";
import type { Order } from "../../types/order";
import { formatCurrency } from "../../lib/utils";

export function OrdersPage() {
  const ordersQuery = useOrdersQuery();

  const orders = (ordersQuery.data?.data ?? ordersQuery.data ?? []) as Order[];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Order history
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Data diambil via React Query (server state).
          </p>
        </div>
        <Button variant="outline" onClick={() => ordersQuery.refetch()}>
          Refresh
        </Button>
      </div>

      {ordersQuery.isLoading ? (
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          Loading orders...
        </div>
      ) : ordersQuery.isError ? (
        <div className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load orders.
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Belum ada pesanan.
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Order #{order.id}</CardTitle>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {order.createdAt
                    ? dayjs(order.createdAt).format("DD MMM YYYY, HH:mm")
                    : "-"}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  {order.items?.length ?? 0} item(s)
                </div>

                {typeof order.total === "number" ? (
                  <div className="text-sm font-semibold">
                    Total: {formatCurrency(order.total)}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
