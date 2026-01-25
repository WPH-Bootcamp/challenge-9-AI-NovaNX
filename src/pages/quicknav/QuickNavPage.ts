import { jsxs, jsx } from "react/jsx-runtime";

export type QuickNavPageProps = {
  title: string;
};

export function QuickNavPage({ title }: QuickNavPageProps) {
  return jsxs("div", {
    className: "mx-auto w-full max-w-[430px]",
    children: [
      jsx("h1", {
        className: "text-center font-extrabold",
        style: {
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "var(--text-display-xs)",
          lineHeight: "var(--leading-display-xs)",
          color: "hsl(var(--foreground))",
        },
        children: title,
      }),
      jsx("p", {
        className: "mt-2 text-center",
        style: {
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "var(--text-text-sm)",
          lineHeight: "var(--leading-text-sm)",
          letterSpacing: "-0.02em",
          color: "hsl(var(--muted-foreground))",
        },
        children: "Halaman ini belum diisi kontennya.",
      }),
    ],
  });
}
