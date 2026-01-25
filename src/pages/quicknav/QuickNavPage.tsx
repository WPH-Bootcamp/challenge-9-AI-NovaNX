import type { QuickNavPageProps } from "./QuickNavPage";

export function QuickNavPage({ title }: QuickNavPageProps) {
  return (
    <div className="mx-auto w-full max-w-[430px]">
      <h1
        className="text-center font-extrabold"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "var(--text-display-xs)",
          lineHeight: "var(--leading-display-xs)",
          color: "hsl(var(--foreground))",
        }}
      >
        {title}
      </h1>
      <p
        className="mt-2 text-center"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "var(--text-text-sm)",
          lineHeight: "var(--leading-text-sm)",
          letterSpacing: "-0.02em",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        Halaman ini belum diisi kontennya.
      </p>
    </div>
  );
}

export type { QuickNavPageProps };
