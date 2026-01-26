import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { HomeHeader } from "../../components/layout/HomeHeader";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import { setQuantity } from "../../features/cart/cartSlice";
import { formatCurrency } from "../../lib/utils";
import { ROUTES } from "../../config/routes";
import { api } from "../../services/api/axios";

import { FooterPage } from "../footer/footer.tsx";

import type {
  CartPageItem,
  CartPageTotals,
  CartRestaurantGroup,
} from "./cartPage";

export function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const itemsById = useAppSelector((s) => s.cart.itemsById);
  const items: CartPageItem[] = Object.values(itemsById);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totals: CartPageTotals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.itemCount += item.quantity;
        acc.totalPrice += item.price * item.quantity;
        return acc;
      },
      { itemCount: 0, totalPrice: 0 },
    );
  }, [items]);

  const groups: CartRestaurantGroup[] = useMemo(() => {
    const map = new Map<string, CartRestaurantGroup>();

    for (const item of items) {
      const restaurantName =
        item.restaurantName?.trim() || "Unknown Restaurant";
      const key = restaurantName.toLowerCase();

      const existing = map.get(key);
      if (existing) {
        existing.items.push(item);
        existing.subtotal += item.price * item.quantity;
        existing.itemCount += item.quantity;
        if (!existing.restaurantId && item.restaurantId)
          existing.restaurantId = item.restaurantId;
      } else {
        map.set(key, {
          restaurantName,
          restaurantId: item.restaurantId,
          items: [item],
          subtotal: item.price * item.quantity,
          itemCount: item.quantity,
        });
      }
    }

    return Array.from(map.values());
  }, [items]);

  async function submitCartToApi() {
    const missingRestaurant = items.filter((i) => !i.restaurantId);
    if (missingRestaurant.length) {
      throw new Error(
        "Ada item yang tidak punya restaurantId. Tambahkan item lewat halaman Detail restaurant.",
      );
    }

    const payloads = items.map((item) => {
      const restaurantIdNum = Number(item.restaurantId);
      const menuIdNum = Number(item.id);

      if (!Number.isFinite(restaurantIdNum)) {
        throw new Error(
          `restaurantId tidak valid untuk ${item.name} (${String(
            item.restaurantId,
          )})`,
        );
      }
      if (!Number.isFinite(menuIdNum)) {
        throw new Error(`menuId tidak valid untuk ${item.name} (${item.id})`);
      }

      return {
        restaurantId: restaurantIdNum,
        menuId: menuIdNum,
        quantity: item.quantity,
      };
    });

    // Keep server cart in sync with local cart.
    await api.delete("/api/cart");

    for (const body of payloads) {
      await api.post("/api/cart", body);
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <section
        className="relative w-full overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(0,0,0,0.08), transparent)",
        }}
        aria-label="Cart header"
      >
        <div className="relative mx-auto w-full max-w-107.5 px-4 pt-4">
          <HomeHeader />

          <h1
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "var(--text-display-xs)",
              lineHeight: "var(--leading-display-xs)",
              color: "var(--Neutral-950, #0A0D12)",
            }}
          >
            My Cart
          </h1>
        </div>
      </section>

      <main className="mx-auto w-full max-w-107.5 px-4 pb-10 pt-4">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-[0px_0px_20px_0px_#CBCACA40]">
            <div
              className="text-sm"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "var(--text-text-sm)",
                lineHeight: "var(--leading-text-sm)",
                letterSpacing: "-0.02em",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              Cart masih kosong.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <section
                key={group.restaurantName}
                aria-label={`Cart items for ${group.restaurantName}`}
                className="rounded-3xl bg-white p-4 shadow-[0px_0px_20px_0px_#CBCACA40]"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between"
                  onClick={() => {
                    if (!group.restaurantId) return;
                    navigate(`/detail/${group.restaurantId}`);
                  }}
                  aria-label={`Open ${group.restaurantName}`}
                >
                  <div
                    className="flex items-center gap-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 800,
                      fontSize: "var(--text-text-sm)",
                      lineHeight: "var(--leading-text-sm)",
                      letterSpacing: "-0.02em",
                      color: "var(--Neutral-950, #0A0D12)",
                    }}
                  >
                    <span aria-hidden>🍽️</span>
                    <span className="truncate">{group.restaurantName}</span>
                  </div>
                  <span aria-hidden className="text-(--Neutral-950,#0A0D12)">
                    ›
                  </span>
                </button>

                <div className="mt-4 space-y-4">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            aria-hidden
                            loading="lazy"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                            fontSize: "var(--text-text-sm)",
                            lineHeight: "var(--leading-text-sm)",
                            letterSpacing: "-0.02em",
                            color: "var(--Neutral-950, #0A0D12)",
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          className="mt-1"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 800,
                            fontSize: "var(--text-text-sm)",
                            lineHeight: "var(--leading-text-sm)",
                            letterSpacing: "-0.02em",
                            color: "var(--Neutral-950, #0A0D12)",
                          }}
                        >
                          {formatCurrency(item.price)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              setQuantity({
                                id: item.id,
                                quantity: item.quantity - 1,
                              }),
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--Neutral-300,#D5D7DA) bg-white text-base font-bold text-(--Neutral-950,#0A0D12) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          −
                        </button>

                        <div
                          className="w-5 text-center text-sm"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 700,
                            fontSize: "var(--text-text-sm)",
                            lineHeight: "var(--leading-text-sm)",
                            letterSpacing: "-0.02em",
                            color: "var(--Neutral-950, #0A0D12)",
                          }}
                          aria-label={`Quantity for ${item.name}`}
                        >
                          {item.quantity}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              setQuantity({
                                id: item.id,
                                quantity: item.quantity + 1,
                              }),
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-(--Primary-100,#C12116) text-base font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-dashed border-(--Neutral-300,#D5D7DA) pt-4">
                    <div className="flex items-center justify-between">
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 400,
                          fontSize: "var(--text-text-sm)",
                          lineHeight: "var(--leading-text-sm)",
                          letterSpacing: "-0.02em",
                          color: "var(--Neutral-950, #0A0D12)",
                        }}
                      >
                        Subtotal
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 800,
                          fontSize: "var(--text-text-sm)",
                          lineHeight: "var(--leading-text-sm)",
                          letterSpacing: "-0.02em",
                          color: "var(--Neutral-950, #0A0D12)",
                        }}
                      >
                        {formatCurrency(group.subtotal)}
                      </div>
                    </div>

                    {groups.length === 1 ? (
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setIsSubmitting(true);
                              await submitCartToApi();
                              navigate(ROUTES.checkout);
                            } catch (e) {
                              const msg =
                                e instanceof Error
                                  ? e.message
                                  : "Gagal menyimpan cart";
                              window.alert(msg);
                            } finally {
                              setIsSubmitting(false);
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-[100px] bg-(--Primary-100,#C12116) p-2 opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                          style={{
                            width: 329,
                            height: 44,
                            fontFamily: "var(--font-body)",
                            fontWeight: 700,
                            fontSize: "var(--text-text-sm)",
                            lineHeight: "var(--leading-text-sm)",
                            letterSpacing: "-0.02em",
                            color: "var(--Neutral-25, #FDFDFD)",
                          }}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Loading…" : "Checkout"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ))}

            {groups.length > 1 ? (
              <section
                aria-label="Cart totals"
                className="rounded-3xl bg-white p-4 shadow-[0px_0px_20px_0px_#CBCACA40]"
              >
                <div className="flex items-center justify-between">
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      fontSize: "var(--text-text-sm)",
                      lineHeight: "var(--leading-text-sm)",
                      letterSpacing: "-0.02em",
                      color: "var(--Neutral-950, #0A0D12)",
                    }}
                  >
                    Total
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 800,
                      fontSize: "var(--text-text-sm)",
                      lineHeight: "var(--leading-text-sm)",
                      letterSpacing: "-0.02em",
                      color: "var(--Neutral-950, #0A0D12)",
                    }}
                  >
                    {formatCurrency(totals.totalPrice)}
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setIsSubmitting(true);
                        await submitCartToApi();
                        navigate(ROUTES.checkout);
                      } catch (e) {
                        const msg =
                          e instanceof Error
                            ? e.message
                            : "Gagal menyimpan cart";
                        window.alert(msg);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-[100px] bg-(--Primary-100,#C12116) p-2 opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                    style={{
                      width: 329,
                      height: 44,
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: "var(--text-text-sm)",
                      lineHeight: "var(--leading-text-sm)",
                      letterSpacing: "-0.02em",
                      color: "var(--Neutral-25, #FDFDFD)",
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Loading…" : "Checkout"}
                  </button>
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>

      <FooterPage />
    </div>
  );
}
