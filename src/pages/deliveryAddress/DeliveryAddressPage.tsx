import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import backIconUrl from "../../assets/images/arrowCircleBrokenLeftMobile.svg";
import { HomeHeader } from "../../components/layout/HomeHeader";
import { ROUTES } from "../../config/routes";

const STORAGE_KEY = "foody.deliveryAddress";

type StoredDeliveryAddress = {
  label?: string;
  addressLine?: string;
  phone?: string;
};

function readStoredAddress(): StoredDeliveryAddress | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as StoredDeliveryAddress;
  } catch {
    return null;
  }
}

function writeStoredAddress(value: StoredDeliveryAddress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function DeliveryAddressPage() {
  const navigate = useNavigate();

  const defaults = useMemo(
    () => ({
      label: "Delivery Address",
      addressLine: "Jl. Sudirman No. 25, Jakarta Pusat, 10220",
      phone: "0812-3456-7890",
    }),
    [],
  );

  const stored = useMemo(() => readStoredAddress(), []);
  const [label, setLabel] = useState(stored?.label ?? defaults.label);
  const [addressLine, setAddressLine] = useState(
    stored?.addressLine ?? defaults.addressLine,
  );
  const [phone, setPhone] = useState(stored?.phone ?? defaults.phone);

  const canSave = Boolean(addressLine.trim()) && Boolean(phone.trim());

  useEffect(() => {
    // Ensure defaults are persisted at least once so Checkout can read it.
    if (!stored) {
      writeStoredAddress(defaults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <section
        className="relative w-full overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(0,0,0,0.08), transparent)",
        }}
        aria-label="Delivery address header"
      >
        <div className="relative mx-auto w-full max-w-107.5 px-4 pt-4">
          <HomeHeader />

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--Neutral-300,#D5D7DA) bg-white"
              aria-label="Back"
            >
              <img src={backIconUrl} alt="" className="h-6 w-6" aria-hidden />
            </button>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "var(--text-display-xs)",
                lineHeight: "var(--leading-display-xs)",
                color: "var(--Neutral-950, #0A0D12)",
              }}
            >
              Delivery Address
            </h1>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-107.5 px-4 pb-10 pt-4">
        <div className="rounded-3xl bg-white p-4 shadow-[0px_0px_20px_0px_#CBCACA40]">
          <div className="space-y-4">
            <div>
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
                Label
              </div>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-(--Neutral-300,#D5D7DA) bg-white px-4 text-sm outline-none"
                placeholder="Delivery Address"
              />
            </div>

            <div>
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
                Address
              </div>
              <textarea
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-(--Neutral-300,#D5D7DA) bg-white px-4 py-3 text-sm outline-none"
                placeholder="Jl. ..."
              />
            </div>

            <div>
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
                Phone
              </div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-(--Neutral-300,#D5D7DA) bg-white px-4 text-sm outline-none"
                placeholder="08xxxxxxxxxx"
                inputMode="tel"
              />
            </div>

            <button
              type="button"
              disabled={!canSave}
              onClick={() => {
                writeStoredAddress({
                  label: label.trim() || defaults.label,
                  addressLine: addressLine.trim(),
                  phone: phone.trim(),
                });
                navigate(-1);
              }}
              className="inline-flex h-11 w-full items-center justify-center rounded-[100px] bg-(--Primary-100,#C12116) disabled:opacity-50"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "var(--text-text-sm)",
                lineHeight: "var(--leading-text-sm)",
                letterSpacing: "-0.02em",
                color: "var(--Neutral-25, #FDFDFD)",
              }}
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => {
                writeStoredAddress(defaults);
                setLabel(defaults.label);
                setAddressLine(defaults.addressLine);
                setPhone(defaults.phone);
              }}
              className="inline-flex h-11 w-full items-center justify-center rounded-[100px] border border-(--Neutral-300,#D5D7DA) bg-white"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "var(--text-text-sm)",
                lineHeight: "var(--leading-text-sm)",
                letterSpacing: "-0.02em",
                color: "var(--Neutral-950, #0A0D12)",
              }}
            >
              Reset to Default
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTES.checkout)}
              className="inline-flex h-11 w-full items-center justify-center rounded-[100px] border border-(--Neutral-300,#D5D7DA) bg-transparent"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "var(--text-text-sm)",
                lineHeight: "var(--leading-text-sm)",
                letterSpacing: "-0.02em",
                color: "var(--Neutral-950, #0A0D12)",
              }}
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
