import { useMemo, useState } from "react";

import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import rectangleIconUrl from "../../assets/images/Rectangle.svg";
import bcaLogoUrl from "../../assets/images/BCA.svg";
import bniLogoUrl from "../../assets/images/BNI.svg";
import briLogoUrl from "../../assets/images/BRI.svg";
import mandiriLogoUrl from "../../assets/images/Mandiri.svg";
import { HomeHeader } from "../../components/layout/HomeHeader";
import { setQuantity, clearCart } from "../../features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import { ROUTES } from "../../config/routes";
import { formatCurrency } from "../../lib/utils";

import { FooterPage } from "../footer/footer.tsx";

import type { PaymentSuccessState } from "../PaymentSuccessPage/PaymentSuccessPage";

import type {
  CheckoutCartItem,
  CheckoutRestaurantGroup,
  CheckoutTotals,
  DeliveryAddress,
  PaymentMethod,
  PaymentSummary,
} from "./checkoutPage";

const DELIVERY_ADDRESS_STORAGE_KEY = "foody.deliveryAddress";

function readDeliveryAddress(): DeliveryAddress {
  const defaults: DeliveryAddress = {
    label: "Delivery Address",
    addressLine: "Jl. Sudirman No. 25, Jakarta Pusat, 10220",
    phone: "0812-3456-7890",
  };

  try {
    const raw = window.localStorage.getItem(DELIVERY_ADDRESS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return defaults;

    const record = parsed as Record<string, unknown>;
    const label =
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : defaults.label;
    const addressLine =
      typeof record.addressLine === "string" && record.addressLine.trim()
        ? record.addressLine.trim()
        : defaults.addressLine;
    const phone =
      typeof record.phone === "string" && record.phone.trim()
        ? record.phone.trim()
        : defaults.phone;

    return { label, addressLine, phone };
  } catch {
    return defaults;
  }
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const itemsById = useAppSelector((s) => s.cart.itemsById);
  const items: CheckoutCartItem[] = Object.values(itemsById);

  const groups: CheckoutRestaurantGroup[] = useMemo(() => {
    const map = new Map<string, CheckoutRestaurantGroup>();

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

  const totals: CheckoutTotals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.itemCount += item.quantity;
        acc.itemsTotal += item.price * item.quantity;
        return acc;
      },
      { itemCount: 0, itemsTotal: 0 },
    );
  }, [items]);

  // Read on render so it reflects changes after returning from Delivery Address.
  // (LocalStorage access is trivial here and avoids setState-in-effect lint.)
  const deliveryAddress: DeliveryAddress = readDeliveryAddress();

  // Order must match the mobile design: BNI, BRI, BCA, Mandiri.
  const paymentMethods: PaymentMethod[] = [
    { id: "bni", label: "Bank Negara Indonesia", abbr: "BNI" },
    { id: "bri", label: "Bank Rakyat Indonesia", abbr: "BRI" },
    { id: "bca", label: "Bank Central Asia", abbr: "BCA" },
    { id: "mandiri", label: "Mandiri", abbr: "Mandiri" },
  ];

  const paymentLogoById: Record<PaymentMethod["id"], string> = {
    bni: bniLogoUrl,
    bri: briLogoUrl,
    bca: bcaLogoUrl,
    mandiri: mandiriLogoUrl,
  };

  const [selectedPaymentId, setSelectedPaymentId] = useState<
    PaymentMethod["id"]
  >(paymentMethods[0]?.id ?? "bca");

  const selectedPaymentLabel =
    paymentMethods.find((m) => m.id === selectedPaymentId)?.label ??
    paymentMethods[0]?.label ??
    "";

  const summary: PaymentSummary = useMemo(() => {
    const deliveryFee = 10_000;
    const serviceFee = 1000;
    const price = totals.itemsTotal;
    const total = price + deliveryFee + serviceFee;
    return { price, deliveryFee, serviceFee, total };
  }, [totals.itemsTotal]);

  const canSubmit = items.length > 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <section
        className="relative w-full overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(0,0,0,0.08), transparent)",
        }}
        aria-label="Checkout header"
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
            Checkout
          </h1>
        </div>
      </section>

      <main className="mx-auto w-full max-w-107.5 px-4 pb-10 pt-4">
        {items.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center shadow-[0px_0px_20px_0px_#CBCACA40]">
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

            <button
              type="button"
              onClick={() => navigate(ROUTES.cart)}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[100px] bg-(--Primary-100,#C12116)"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "var(--text-text-sm)",
                lineHeight: "var(--leading-text-sm)",
                letterSpacing: "-0.02em",
                color: "var(--Neutral-25, #FDFDFD)",
              }}
            >
              Back to Cart
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => navigate(ROUTES.deliveryAddress)}
              className="w-full rounded-3xl bg-white p-4 text-left shadow-[0px_0px_20px_0px_#CBCACA40]"
              aria-label="Delivery address"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src={rectangleIconUrl}
                    alt=""
                    className="mt-0.5 h-8 w-8 shrink-0 object-contain"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: "var(--text-text-sm)",
                        lineHeight: "var(--leading-text-sm)",
                        letterSpacing: "-0.02em",
                        color: "var(--Neutral-950, #0A0D12)",
                      }}
                    >
                      {deliveryAddress.label}
                    </div>
                    <div
                      className="mt-1"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        fontSize: "var(--text-text-xs)",
                        lineHeight: "var(--leading-text-xs)",
                        letterSpacing: "-0.02em",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      {deliveryAddress.addressLine}
                    </div>
                    <div
                      className="mt-1"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        fontSize: "var(--text-text-xs)",
                        lineHeight: "var(--leading-text-xs)",
                        letterSpacing: "-0.02em",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      {deliveryAddress.phone}
                    </div>
                  </div>
                </div>

                <div
                  className="shrink-0 rounded-[100px] border border-(--Neutral-300,#D5D7DA) bg-white px-3 py-1"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "var(--text-text-xs)",
                    lineHeight: "var(--leading-text-xs)",
                    letterSpacing: "-0.02em",
                    color: "var(--Neutral-950, #0A0D12)",
                  }}
                >
                  Change
                </div>
              </div>
            </button>

            {groups.map((group) => (
              <section
                key={group.restaurantName}
                className="rounded-3xl bg-white p-4 shadow-[0px_0px_20px_0px_#CBCACA40]"
                aria-label={`Checkout items for ${group.restaurantName}`}
              >
                <div className="flex items-center justify-between gap-3">
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
                    <span aria-hidden>🍔</span>
                    <span className="truncate">{group.restaurantName}</span>
                  </div>

                  <button
                    type="button"
                    className="shrink-0 rounded-[100px] border border-(--Neutral-300,#D5D7DA) bg-white px-3 py-1"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: "var(--text-text-xs)",
                      lineHeight: "var(--leading-text-xs)",
                      letterSpacing: "-0.02em",
                      color: "var(--Neutral-950, #0A0D12)",
                    }}
                    onClick={() => {
                      if (!group.restaurantId) return;
                      navigate(`/detail/${group.restaurantId}`);
                    }}
                    aria-label={`Add item to ${group.restaurantName}`}
                  >
                    Add Item
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
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
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-(--Neutral-300,#D5D7DA) bg-white text-sm font-bold text-(--Neutral-950,#0A0D12)"
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          −
                        </button>

                        <div
                          className="w-5 text-center"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 700,
                            fontSize: "var(--text-text-sm)",
                            lineHeight: "var(--leading-text-sm)",
                            letterSpacing: "-0.02em",
                            color: "var(--Neutral-950, #0A0D12)",
                          }}
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
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-(--Primary-100,#C12116) text-sm font-bold text-white"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <section
              className="rounded-3xl bg-white p-4 shadow-[0px_0px_20px_0px_#CBCACA40]"
              aria-label="Payment method"
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "var(--text-text-lg)",
                  lineHeight: "var(--leading-text-lg)",
                  letterSpacing: "-0.02em",
                  color: "var(--Neutral-950, #0A0D12)",
                }}
              >
                Payment Method
              </div>

              <div className="mt-3 divide-y divide-(--Neutral-300,#D5D7DA)">
                {paymentMethods.map((m) => {
                  const selected = m.id === selectedPaymentId;
                  const logoUrl = paymentLogoById[m.id];
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-(--Neutral-300,#D5D7DA) bg-white">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={m.abbr}
                              className="h-8 w-10 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span
                              style={{
                                fontFamily: "var(--font-body)",
                                fontWeight: 800,
                                fontSize: 12,
                                letterSpacing: "-0.02em",
                                color: "var(--Neutral-950, #0A0D12)",
                              }}
                            >
                              {m.abbr}
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                            fontSize: "var(--text-text-sm)",
                            lineHeight: "var(--leading-text-sm)",
                            letterSpacing: "-0.02em",
                            color: "var(--Neutral-950, #0A0D12)",
                          }}
                        >
                          {m.label}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedPaymentId(m.id)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                          selected
                            ? "border-(--Primary-100,#C12116)"
                            : "border-[#9CA3AF]"
                        }`}
                        aria-label={`Select ${m.label}`}
                      >
                        {selected ? (
                          <span className="h-3.5 w-3.5 rounded-full bg-(--Primary-100,#C12116)" />
                        ) : null}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section
              className="rounded-3xl bg-white p-4 shadow-[0px_0px_20px_0px_#CBCACA40]"
              aria-label="Payment summary"
            >
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
                Payment Summary
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    Price ({totals.itemCount} item)
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: "var(--text-text-sm)",
                      lineHeight: "var(--leading-text-sm)",
                      letterSpacing: "-0.02em",
                      color: "var(--Neutral-950, #0A0D12)",
                    }}
                  >
                    {formatCurrency(summary.price)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    Delivery Fee
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: "var(--text-text-sm)",
                      lineHeight: "var(--leading-text-sm)",
                      letterSpacing: "-0.02em",
                      color: "var(--Neutral-950, #0A0D12)",
                    }}
                  >
                    {formatCurrency(summary.deliveryFee)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    Service Fee
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: "var(--text-text-sm)",
                      lineHeight: "var(--leading-text-sm)",
                      letterSpacing: "-0.02em",
                      color: "var(--Neutral-950, #0A0D12)",
                    }}
                  >
                    {formatCurrency(summary.serviceFee)}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-dashed border-(--Neutral-300,#D5D7DA) pt-3">
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
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
                    {formatCurrency(summary.total)}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={async () => {
                    const normalizedPhone = deliveryAddress.phone.replace(
                      /[^0-9]/g,
                      "",
                    );

                    const paymentState: PaymentSuccessState = {
                      dateIso: dayjs().toISOString(),
                      paymentMethodLabel: selectedPaymentLabel,
                      itemCount: totals.itemCount,
                      price: summary.price,
                      deliveryFee: summary.deliveryFee,
                      serviceFee: summary.serviceFee,
                      total: summary.total,
                    };

                    // For now, skip backend checkout and go straight to success.
                    // Keep phone normalization so state is consistent.
                    void normalizedPhone;

                    dispatch(clearCart());
                    navigate(ROUTES.paymentSuccess, {
                      replace: true,
                      state: paymentState,
                    });
                  }}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[100px] bg-(--Primary-100,#C12116)"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "var(--text-text-sm)",
                    lineHeight: "var(--leading-text-sm)",
                    letterSpacing: "-0.02em",
                    color: "var(--Neutral-25, #FDFDFD)",
                  }}
                  aria-label="Buy"
                >
                  Buy
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      <FooterPage />
    </div>
  );
}
