import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";

import { useAppDispatch, useAppSelector } from "../../features/hooks";
import { clearCart } from "../../features/cart/cartSlice";
import { ROUTES } from "../../config/routes";
import { formatCurrency } from "../../lib/utils";
import { useCreateOrderMutation } from "../../services/queries/orders";

export function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const itemsById = useAppSelector((s) => s.cart.itemsById);
  const items = Object.values(itemsById);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const createOrder = useCreateOrderMutation();

  const canSubmit =
    items.length > 0 && name.trim() && phone.trim() && address.trim();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Checkout</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Tanpa payment gateway. Form minimal: nama, no HP, alamat.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Cart kosong. Tambahkan item dulu.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer details</CardTitle>
            <CardDescription>
              Pastikan data benar agar order mudah diproses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="space-y-1 text-sm font-medium">
              <span>Name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="space-y-1 text-sm font-medium">
              <span>Phone</span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              <span>Address</span>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>

            {createOrder.isError ? (
              <div className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to submit order.
              </div>
            ) : null}

            <Button
              className="w-full"
              disabled={!canSubmit || createOrder.isPending}
              onClick={async () => {
                const payload = {
                  name: name.trim(),
                  phone: phone.trim(),
                  address: address.trim(),
                  items: items.map((i) => ({
                    menuId: i.id,
                    quantity: i.quantity,
                  })),
                  total,
                  createdAt: dayjs().toISOString(),
                };

                await createOrder.mutateAsync(payload, {
                  onSuccess: () => {
                    dispatch(clearCart());
                    navigate(ROUTES.orders, { replace: true });
                  },
                });
              }}
            >
              {createOrder.isPending
                ? "Submitting..."
                : `Place order (${formatCurrency(total)})`}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
            <CardDescription>{items.length} item(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="max-w-[220px] truncate">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">Total</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>

            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => navigate(ROUTES.cart)}
            >
              Back to cart
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
