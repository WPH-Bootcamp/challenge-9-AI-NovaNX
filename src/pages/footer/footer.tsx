import logoUrl from "../../assets/images/Logo.svg";

import {
  EXPLORE_LINKS,
  HELP_LINKS,
  SOCIAL_LINKS,
  type FooterLink,
  type SocialLink,
} from "./footer";

function LinkList({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="space-y-3">
      <div
        className="text-sm font-extrabold"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 800,
          fontStyle: "normal",
          fontSize: "var(--text-text-sm)",
          lineHeight: "var(--leading-text-sm)",
          letterSpacing: "0em",
          textAlign: "left",
          color: "var(--Neutral-25, #FDFDFD)",
        }}
      >
        {title}
      </div>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-sm"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "var(--text-text-sm)",
                lineHeight: "var(--leading-text-sm)",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcons({ items }: { items: SocialLink[] }) {
  return (
    <div className="flex items-center gap-3">
      {items.map((s) => (
        <a
          key={s.label}
          href={s.href}
          aria-label={s.label}
          className="inline-flex items-center justify-center"
          style={{ width: 40, height: 40 }}
        >
          <img
            src={s.iconUrl}
            alt=""
            width={40}
            height={40}
            className="block"
            style={{ width: 40, height: 40 }}
            aria-hidden
          />
        </a>
      ))}
    </div>
  );
}

export function FooterPage() {
  return (
    <footer
      className="w-full max-h-[620px] overflow-auto"
      style={{ background: "var(--Neutral-950, #0A0D12)" }}
    >
      <div className="mx-auto w-full max-w-[430px] px-4 py-10">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="" className="h-8 w-8" aria-hidden />
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontStyle: "normal",
              fontSize: "var(--text-display-md)",
              lineHeight: "var(--leading-display-md)",
              letterSpacing: "0em",
              color: "var(--Base-White, #FFFFFF)",
            }}
          >
            Foody
          </div>
        </div>

        <p
          className="mt-4 max-w-[360px] text-sm"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "var(--text-text-sm)",
            lineHeight: "var(--leading-text-sm)",
            letterSpacing: "-0.02em",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          Enjoy homemade flavors &amp; chef&apos;s signature dishes, freshly
          prepared every day. Order online or visit our nearest branch.
        </p>

        <div className="mt-6">
          <div
            className="text-sm"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontStyle: "normal",
              fontSize: "var(--text-text-sm)",
              lineHeight: "var(--leading-text-sm)",
              letterSpacing: "-0.02em",
              textAlign: "left",
              color: "var(--Base-White, #FFFFFF)",
            }}
          >
            Follow on Social Media
          </div>
          <div className="mt-4">
            <SocialIcons items={SOCIAL_LINKS} />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-10">
          <LinkList title="Explore" links={EXPLORE_LINKS} />
          <LinkList title="Help" links={HELP_LINKS} />
        </div>
      </div>
    </footer>
  );
}
