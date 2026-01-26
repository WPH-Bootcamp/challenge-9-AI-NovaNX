import { Button } from "../../ui/button";
import { Card, CardContent, CardFooter } from "../../ui/card";
import type { MenuItem } from "../../types/menu";
import { formatCurrency } from "../../lib/utils";

type MenuCardProps = {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
};

export function MenuCard({ item, onAddToCart }: MenuCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] w-full bg-[hsl(var(--muted))]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-sm text-[hsl(var(--muted-foreground))]"
            aria-label="No image available"
          >
            No image
          </div>
        )}
      </div>

      <CardContent className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-semibold leading-5">
            {item.name}
          </h3>
          {typeof item.rating === "number" ? (
            <div className="shrink-0 rounded-[var(--radius-sm)] bg-[hsl(var(--muted))] px-2 py-1 text-xs font-semibold text-[hsl(var(--foreground))]">
              {item.rating.toFixed(1)}
            </div>
          ) : null}
        </div>
        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
          {formatCurrency(item.price)}
        </p>
      </CardContent>

      <CardFooter className="justify-end">
        <Button onClick={() => onAddToCart(item)} size="sm">
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
