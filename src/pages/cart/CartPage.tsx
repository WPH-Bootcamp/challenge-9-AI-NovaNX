import { Link, useNavigate } from "react-router-dom";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

import { useAppDispatch, useAppSelector } from "../../features/hooks";
import { removeFromCart, setQuantity } from "../../features/cart/cartSlice";
import { formatCurrency } from "../../lib/utils";
import { ROUTES } from "../../config/routes";

export function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const itemsById = useAppSelector((s) => s.cart.itemsById);
  const items = Object.values(itemsById);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Cart</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Optimistic UI: update qty/hapus item langsung di Redux.
          </p>
        </div>
        <Button asChild variant="ghost">
          <Link to={ROUTES.home}>Back to menu</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-10 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Cart masih kosong.
          </p>
          <Button className="mt-4" asChild>
            <Link to={ROUTES.home}>Browse menu</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-[var(--radius)] bg-[hsl(var(--muted))]">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <span className="sr-only">Quantity</span>
                      <Input
                        className="h-10 w-24"
                        inputMode="numeric"
                        value={String(item.quantity)}
                        onChange={(e) =>
                          dispatch(
                            setQuantity({
                              id: item.id,
                              quantity: Number(e.target.value || 0),
                            }),
                          )
                        }
                        aria-label={`Quantity for ${item.name}`}
                      />
                    </label>
                    <Button
                      variant="destructive"
                      onClick={() => dispatch(removeFromCart({ id: item.id }))}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">
                  Total
                </span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate(ROUTES.checkout)}
              >
                Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
