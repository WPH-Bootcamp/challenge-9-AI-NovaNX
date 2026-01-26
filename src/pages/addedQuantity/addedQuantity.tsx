import { useMemo } from "react";

import { useNavigate } from "react-router-dom";

import bagIconUrl from "../../assets/images/BagBlackMobile.svg";
import { HomeHeader } from "../../components/layout/HomeHeader";
import { useAppSelector } from "../../features/hooks";
import { ROUTES } from "../../config/routes";
import { formatCurrency } from "../../lib/utils";

import type { AddedQuantityItem, AddedQuantityTotals } from "./addedQuantity";

export function AddedQuantityPage() {
  const navigate = useNavigate();
  const itemsById = useAppSelector((s) => s.cart.itemsById);

  const items: AddedQuantityItem[] = useMemo(
    () => Object.values(itemsById),
    [itemsById],
  );

  const totals: AddedQuantityTotals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.itemCount += item.quantity;
        acc.totalPrice += item.price * item.quantity;
        return acc;
      },
      { itemCount: 0, totalPrice: 0 },
    );
  }, [items]);

  const totalText = formatCurrency(totals.totalPrice);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <section
        className="relative w-full overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(0,0,0,0.08), transparent)",
        }}
        aria-label="Added quantity header"
      >
        <div className="relative mx-auto w-full max-w-107.5 px-4 pt-4">
          <HomeHeader />
        </div>
      </section>

      <main className="mx-auto w-full max-w-107.5 px-4 pb-28 pt-4">
        <div
          className="rounded-3xl bg-white p-4 shadow-[0px_0px_20px_0px_#CBCACA40]"
          aria-label="Added quantity content"
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "var(--text-text-lg)",
              lineHeight: "var(--leading-text-lg)",
              color: "var(--Neutral-950, #0A0D12)",
            }}
          >
            Added Quantity
          </div>

          <div
            className="mt-2 text-sm"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "var(--text-text-sm)",
              lineHeight: "var(--leading-text-sm)",
              letterSpacing: "-0.02em",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Summary sesuai item di cart.
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div
                className="text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "var(--text-text-sm)",
                  lineHeight: "var(--leading-text-sm)",
                  letterSpacing: "-0.02em",
                  color: "var(--Neutral-950, #0A0D12)",
                }}
              >
                Items
              </div>
              <div
                className="text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 800,
                  fontSize: "var(--text-text-sm)",
                  lineHeight: "var(--leading-text-sm)",
                  letterSpacing: "-0.02em",
                  color: "var(--Neutral-950, #0A0D12)",
                }}
              >
                {totals.itemCount}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div
                className="text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "var(--text-text-sm)",
                  lineHeight: "var(--leading-text-sm)",
                  letterSpacing: "-0.02em",
                  color: "var(--Neutral-950, #0A0D12)",
                }}
              >
                Total
              </div>
              <div
                className="text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 800,
                  fontSize: "var(--text-text-sm)",
                  lineHeight: "var(--leading-text-sm)",
                  letterSpacing: "-0.02em",
                  color: "var(--Neutral-950, #0A0D12)",
                }}
              >
                {totalText}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-(--Neutral-300,#D5D7DA) bg-white"
        aria-label="Cart summary bar"
      >
        <div className="mx-auto flex w-full max-w-107.5 items-center justify-between gap-4 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.cart)}
            className="flex min-w-0 items-center gap-2"
            aria-label="Open cart"
          >
            <img src={bagIconUrl} alt="" className="h-5 w-5" aria-hidden />
            <div className="min-w-0">
              <div
                className="text-xs"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "var(--text-text-xs)",
                  lineHeight: "var(--leading-text-xs)",
                  letterSpacing: "-0.02em",
                  color: "var(--Neutral-950, #0A0D12)",
                }}
              >
                {totals.itemCount} Items
              </div>
              <div
                className="truncate"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 800,
                  fontSize: "var(--text-text-sm)",
                  lineHeight: "var(--leading-text-sm)",
                  letterSpacing: "-0.02em",
                  color: "var(--Neutral-950, #0A0D12)",
                }}
              >
                {totalText}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.cart)}
            className="inline-flex h-11 w-40 items-center justify-center rounded-[100px] bg-(--Primary-100,#C12116) px-4"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "var(--text-text-sm)",
              lineHeight: "var(--leading-text-sm)",
              letterSpacing: "-0.02em",
              color: "var(--Neutral-25, #FDFDFD)",
              opacity: 1,
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
