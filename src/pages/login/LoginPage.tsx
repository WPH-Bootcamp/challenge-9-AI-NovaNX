import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

import type { AuthMode } from "./LoginPage";

import loginHeroUrl from "../../assets/images/login-hero.svg";
import logoUrl from "../../assets/images/Logo.svg";
import eyeoffMobileUrl from "../../assets/images/eyeoffMobile.svg";
import eyeonMobileUrl from "../../assets/images/eyeonMobile.svg";
import checkedEmptyMobileUrl from "../../assets/images/CheckedEmptyMobile.svg";
import checkedTrueOnClickMobileUrl from "../../assets/images/checkedTrueOnClickMobile.svg";

function FoodyLogoMark({ className }: { className?: string }) {
  return <img src={logoUrl} alt="Foody" className={className} />;
}

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const submitLabel = useMemo(() => {
    return mode === "signin" ? "Login" : "Create account";
  }, [mode]);

  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="relative hidden lg:block">
          <img
            src={loginHeroUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
        </aside>

        <main className="flex items-start justify-center px-6 pb-10 pt-14 sm:px-10 sm:pt-20 lg:items-center lg:px-12 lg:py-12">
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

            <form
              className="mt-6 space-y-4 sm:mt-8"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Email"
                autoComplete="email"
                className="h-12 rounded-[12px]"
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  className="h-12 rounded-[12px] pr-12"
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

              <Button
                type="submit"
                className="h-12 max-h-12 w-full gap-2 rounded-[100px] bg-[#C12116] p-2 text-base font-bold leading-6 tracking-[-0.02em] text-[#FDFDFD] opacity-100 hover:opacity-95"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {submitLabel}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
