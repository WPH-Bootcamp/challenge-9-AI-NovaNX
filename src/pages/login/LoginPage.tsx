import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

import type { AuthMode } from "./LoginPage";

import loginHeroUrl from "../../assets/images/image8.svg";
import logoUrl from "../../assets/images/Logo.svg";
import eyeoffMobileUrl from "../../assets/images/eyeoffMobile.svg";
import eyeonMobileUrl from "../../assets/images/eyeonMobile.svg";
import checkedEmptyMobileUrl from "../../assets/images/CheckedEmptyMobile.svg";
import checkedTrueOnClickMobileUrl from "../../assets/images/checkedTrueOnClickMobile.svg";

import { login, register } from "../../services/auth/auth";
import {
  getAuthToken,
  setAuthToken,
  setAuthUserName,
} from "../../services/auth/token";
import { ROUTES } from "../../config/routes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  return typeof v === "string" ? v : null;
}

function findUserName(raw: unknown): string | null {
  if (!isRecord(raw)) return null;

  return (
    readString(raw, "username") ||
    readString(raw, "userName") ||
    readString(raw, "name") ||
    (isRecord(raw.data)
      ? readString(raw.data, "username") ||
        readString(raw.data, "userName") ||
        readString(raw.data, "name") ||
        (isRecord(raw.data.user)
          ? readString(raw.data.user, "username") ||
            readString(raw.data.user, "userName") ||
            readString(raw.data.user, "name")
          : null)
      : null) ||
    (isRecord(raw.user)
      ? readString(raw.user, "username") ||
        readString(raw.user, "userName") ||
        readString(raw.user, "name")
      : null)
  );
}

function FoodyLogoMark({ className }: { className?: string }) {
  return <img src={logoUrl} alt="Foody" className={className} />;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submitLabel = useMemo(() => {
    return mode === "signin" ? "Login" : "Register";
  }, [mode]);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      navigate(ROUTES.home, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    // Mobile default: show registration (per requirement)
    try {
      const mq = window.matchMedia("(max-width: 639px)");
      if (mq.matches) setMode("signup");
    } catch {
      // ignore
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    if (mode === "signup") {
      if (!name.trim() || !phone.trim()) {
        setErrorMessage("Name dan phone wajib diisi saat Sign up.");
        return;
      }

      if (!confirmPassword) {
        setErrorMessage("Confirm password wajib diisi saat Sign up.");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Password dan confirm password harus sama.");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      if (mode === "signup") {
        await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        });
        setSuccessMessage("Registrasi berhasil. Silakan login.");
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const result = await login({ email: email.trim(), password });
      const storage = rememberMe ? "local" : "session";
      setAuthToken(result.token, storage);

      const userNameFromApi = findUserName(result.raw);
      const fallbackName = email.trim().split("@")[0] || "John Doe";
      setAuthUserName(userNameFromApi || fallbackName, storage);
      setSuccessMessage(
        rememberMe
          ? "Login berhasil. Token tersimpan (tidak perlu authorize lagi)."
          : "Login berhasil. Token tersimpan sementara (hingga tab/browser ditutup).",
      );
      navigate(ROUTES.home, { replace: true });
    } catch (err: unknown) {
      const errObj =
        typeof err === "object" && err !== null
          ? (err as Record<string, unknown>)
          : null;

      const response =
        errObj &&
        typeof errObj.response === "object" &&
        errObj.response !== null
          ? (errObj.response as Record<string, unknown>)
          : null;

      const data =
        response && typeof response.data === "object" && response.data !== null
          ? (response.data as Record<string, unknown>)
          : null;

      const messageFromApi =
        (data?.message as string | undefined) ||
        (data?.error as string | undefined);

      const messageFromError =
        (errObj?.message as string | undefined) || undefined;

      setErrorMessage(
        messageFromApi ||
          messageFromError ||
          "Terjadi kesalahan saat mengirim request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden lg:block">
          <img
            src={loginHeroUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </aside>

        <main className="flex items-start justify-center bg-white px-6 pb-10 pt-14 sm:px-10 sm:pt-20 lg:items-center lg:px-12 lg:py-12">
          <div className="w-full max-w-md">
            <div className="mb-[var(--space-xl)] flex items-center gap-3 sm:mb-12">
              <FoodyLogoMark className="h-9 w-9" />
              <span
                className="text-[length:var(--text-display-xs)] font-extrabold leading-[var(--leading-display-xs)] tracking-[0] text-[#0A0D12]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Foody
              </span>
            </div>

            <h1
              className="text-[length:var(--text-display-xs)] font-extrabold leading-[var(--leading-display-xs)] tracking-[0] text-[#0A0D12] sm:text-[32px] sm:leading-[36px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome Back
            </h1>
            <p
              className="mt-[var(--space-xs)] text-sm font-medium tracking-[0] text-[#0A0D12]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Good to see you again! Let&apos;s eat
            </p>

            <div className="mt-6 rounded-[16px] bg-[#F5F5F5] p-2 shadow-[0px_0px_20px_0px_#CBCACA40] sm:mt-8">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={
                    mode === "signin"
                      ? "inline-flex h-9 w-[160.5px] items-center justify-center gap-2 rounded-[8px] bg-white px-3 py-2 text-sm font-bold tracking-[-0.02em] text-[#0A0D12] shadow-[0px_0px_20px_0px_#CBCACA40]"
                      : "inline-flex h-9 w-[160.5px] items-center justify-center gap-2 rounded-[8px] px-3 py-2 text-sm font-medium tracking-[0] text-[#535862]"
                  }
                  aria-pressed={mode === "signin"}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={
                    mode === "signup"
                      ? "inline-flex h-9 w-[160.5px] items-center justify-center gap-2 rounded-[8px] bg-white px-3 py-2 text-sm font-bold tracking-[-0.02em] text-[#0A0D12] shadow-[0px_0px_20px_0px_#CBCACA40]"
                      : "inline-flex h-9 w-[160.5px] items-center justify-center gap-2 rounded-[8px] px-3 py-2 text-sm font-medium tracking-[0] text-[#535862]"
                  }
                  aria-pressed={mode === "signup"}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Sign up
                </button>
              </div>
            </div>

            <form className="mt-6 space-y-4 sm:mt-8" onSubmit={handleSubmit}>
              {mode === "signup" ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  autoComplete="name"
                  className="h-12 rounded-[12px]"
                />
              ) : null}

              <Input
                type="email"
                placeholder="Email"
                autoComplete="email"
                className="h-12 rounded-[12px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {mode === "signup" ? (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Number Phone"
                  autoComplete="tel"
                  className="h-12 rounded-[12px]"
                />
              ) : null}

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  className="h-12 rounded-[12px] pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[var(--radius-sm)] p-2 text-[hsl(var(--muted-foreground))] hover:bg-black/5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <>
                      <img
                        src={eyeonMobileUrl}
                        alt=""
                        className="h-4 w-4 sm:hidden"
                        aria-hidden="true"
                      />
                      <EyeOff className="hidden h-5 w-5 sm:block" />
                    </>
                  ) : (
                    <>
                      <img
                        src={eyeoffMobileUrl}
                        alt=""
                        className="h-4 w-4 sm:hidden"
                        aria-hidden="true"
                      />
                      <Eye className="hidden h-5 w-5 sm:block" />
                    </>
                  )}
                </button>
              </div>

              {mode === "signup" ? (
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    className="h-12 rounded-[12px] pr-12"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[var(--radius-sm)] p-2 text-[hsl(var(--muted-foreground))] hover:bg-black/5"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <>
                        <img
                          src={eyeonMobileUrl}
                          alt=""
                          className="h-4 w-4 sm:hidden"
                          aria-hidden="true"
                        />
                        <EyeOff className="hidden h-5 w-5 sm:block" />
                      </>
                    ) : (
                      <>
                        <img
                          src={eyeoffMobileUrl}
                          alt=""
                          className="h-4 w-4 sm:hidden"
                          aria-hidden="true"
                        />
                        <Eye className="hidden h-5 w-5 sm:block" />
                      </>
                    )}
                  </button>
                </div>
              ) : null}

              {mode === "signin" ? (
                <label
                  className="group flex items-center gap-2 text-sm font-medium tracking-[0] text-[#0A0D12]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-xs)] border border-[#D5D7DA] transition-transform duration-200 ease-linear group-hover:scale-125 focus-within:scale-125">
                    <img
                      src={
                        rememberMe
                          ? checkedTrueOnClickMobileUrl
                          : checkedEmptyMobileUrl
                      }
                      alt=""
                      className="h-full w-full"
                      aria-hidden="true"
                    />
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </span>
                  Remember Me
                </label>
              ) : null}

              {errorMessage ? (
                <div
                  className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div
                  className="rounded-[12px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                  role="status"
                >
                  {successMessage}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 max-h-12 w-full gap-2 rounded-[100px] bg-[#C12116] p-2 text-base font-bold leading-6 tracking-[-0.02em] text-[#FDFDFD] opacity-100 hover:opacity-95"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {isSubmitting ? "Please wait..." : submitLabel}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
