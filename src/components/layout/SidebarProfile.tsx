import { useCallback } from "react";

import { useNavigate } from "react-router-dom";

import profilePhotoUrl from "../../assets/images/profile1.svg";
import markerPinUrl from "../../assets/images/markerPinMobile.svg";
import fileUrl from "../../assets/images/fileMobile.svg";
import logoutUrl from "../../assets/images/arrowCircleBrokenLeftMobile.svg";

import { ROUTES } from "../../config/routes";
import { clearAuthToken, getAuthUserName } from "../../services/auth/token";

type SidebarProfileProps = {
  onClose: () => void;
};

export function SidebarProfile({ onClose }: SidebarProfileProps) {
  const navigate = useNavigate();
  const userName = getAuthUserName() || "John Doe";

  const goOrders = useCallback(() => {
    onClose();
    navigate(ROUTES.orders);
  }, [navigate, onClose]);

  const logout = useCallback(() => {
    clearAuthToken();
    onClose();
    navigate(ROUTES.login, { replace: true });
  }, [navigate, onClose]);

  return (
    <div
      className="flex flex-col bg-white shadow-[0px_0px_20px_0px_#CBCACA40]"
      style={{
        width: 197,
        height: 200,
        borderRadius: 16,
        opacity: 1,
        padding: 16,
        gap: 12,
      }}
      role="menu"
      aria-label="Profile menu"
    >
      <div className="flex items-center gap-3">
        <img
          src={profilePhotoUrl}
          alt=""
          className="h-9 w-9 rounded-full"
          aria-hidden="true"
        />
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "var(--text-text-md)",
            lineHeight: "var(--leading-text-md)",
            letterSpacing: "-0.02em",
            color: "var(--Neutral-950, #0A0D12)",
          }}
        >
          {userName}
        </div>
      </div>

      <button
        type="button"
        className="flex items-center gap-3 text-left"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: "var(--text-text-sm)",
          lineHeight: "var(--leading-text-sm)",
          letterSpacing: "0em",
          color: "var(--Neutral-950, #0A0D12)",
        }}
        role="menuitem"
        onClick={onClose}
      >
        <img src={markerPinUrl} alt="" className="h-5 w-5" aria-hidden="true" />
        <span>Delivery Address</span>
      </button>

      <button
        type="button"
        className="flex items-center gap-3 text-left"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: "var(--text-text-sm)",
          lineHeight: "var(--leading-text-sm)",
          letterSpacing: "0em",
          color: "var(--Neutral-950, #0A0D12)",
        }}
        role="menuitem"
        onClick={goOrders}
      >
        <img src={fileUrl} alt="" className="h-5 w-5" aria-hidden="true" />
        <span>My Orders</span>
      </button>

      <button
        type="button"
        className="flex items-center gap-3 text-left"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: "var(--text-text-sm)",
          lineHeight: "var(--leading-text-sm)",
          letterSpacing: "0em",
          color: "var(--Neutral-950, #0A0D12)",
        }}
        role="menuitem"
        onClick={logout}
      >
        <img src={logoutUrl} alt="" className="h-5 w-5" aria-hidden="true" />
        <span>Logout</span>
      </button>
    </div>
  );
}
