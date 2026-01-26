import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";

import logoUrl from "../../assets/images/Logo.svg";
import successIconUrl from "../../assets/images/iconPaymentSuccess.svg";
import { ROUTES } from "../../config/routes";
import { formatCurrency } from "../../lib/utils";

import type { PaymentSuccessState } from "./PaymentSuccessPage";

type LocationState = {
  state?: PaymentSuccessState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readState(locationState: unknown): PaymentSuccessState | null {
  if (!isRecord(locationState)) return null;

  const dateIso =
    typeof locationState.dateIso === "string" ? locationState.dateIso : "";
  const paymentMethodLabel =
    typeof locationState.paymentMethodLabel === "string"
      ? locationState.paymentMethodLabel
      : "";
  const itemCount =
    typeof locationState.itemCount === "number" ? locationState.itemCount : 0;
  const price =
    typeof locationState.price === "number" ? locationState.price : 0;
  const deliveryFee =
    typeof locationState.deliveryFee === "number"
      ? locationState.deliveryFee
      : 0;
  const serviceFee =
    typeof locationState.serviceFee === "number" ? locationState.serviceFee : 0;
  const total =
    typeof locationState.total === "number" ? locationState.total : 0;

  if (!dateIso || !paymentMethodLabel) return null;

  return {
    dateIso,
    paymentMethodLabel,
    itemCount,
    price,
    deliveryFee,
    serviceFee,
    total,
  };
}

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = readState((location as LocationState).state);

  if (!state) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <div className="mx-auto w-full max-w-107.5 px-4 py-8">
          <img src={logoUrl} alt="Foody" className="mx-auto h-7" />

          <div className="mt-8 rounded-3xl bg-white p-6 text-center shadow-[0px_0px_20px_0px_#CBCACA40]">
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "var(--text-text-lg)",
                lineHeight: "var(--leading-text-lg)",
                color: "var(--Neutral-950, #0A0D12)",
              }}
            >
              Payment Success
            </div>
            <div className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Data pembayaran tidak ditemukan.
            </div>

            <button
              type="button"
              onClick={() => navigate(ROUTES.orders)}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[100px] bg-(--Primary-100,#C12116)"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "var(--text-text-sm)",
                lineHeight: "var(--leading-text-sm)",
                letterSpacing: "-0.02em",
                color: "var(--Neutral-25, #FDFDFD)",
              }}
            >
              See My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dateText = dayjs(state.dateIso).format("D MMMM YYYY, HH:mm");

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto w-full max-w-107.5 px-4 py-8">
        <img src={logoUrl} alt="Foody" className="mx-auto h-7" />

        <div className="mt-10 flex flex-col items-center text-center">
          <img src={successIconUrl} alt="" className="h-20 w-20" aria-hidden />

          <div
            className="mt-5"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "var(--text-display-xs)",
              lineHeight: "var(--leading-display-xs)",
              color: "var(--Neutral-950, #0A0D12)",
            }}
          >
            Payment Success
          </div>

          <div
            className="mt-2 max-w-xs"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "var(--text-text-sm)",
              lineHeight: "var(--leading-text-sm)",
              letterSpacing: "-0.02em",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Your payment has been successfully processed.
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-4 shadow-[0px_0px_20px_0px_#CBCACA40]">
          <div className="border-b border-dashed border-(--Neutral-300,#D5D7DA) pb-4" />

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Date
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
                {dateText}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Payment Method
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
                {state.paymentMethodLabel}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Price ({state.itemCount} items)
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
                {formatCurrency(state.price)}
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
                {formatCurrency(state.deliveryFee)}
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
                {formatCurrency(state.serviceFee)}
              </div>
            </div>

            <div className="border-b border-dashed border-(--Neutral-300,#D5D7DA) pt-1" />

            <div className="flex items-center justify-between pt-4">
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
                  fontSize: "var(--text-text-lg)",
                  lineHeight: "var(--leading-text-lg)",
                  letterSpacing: "-0.02em",
                  color: "var(--Neutral-950, #0A0D12)",
                }}
              >
                {formatCurrency(state.total)}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.orders, { replace: true })}
          className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-[100px] bg-(--Primary-100,#C12116)"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "var(--text-text-sm)",
            lineHeight: "var(--leading-text-sm)",
            letterSpacing: "-0.02em",
            color: "var(--Neutral-25, #FDFDFD)",
          }}
        >
          See My Orders
        </button>
      </div>
    </div>
  );
}
