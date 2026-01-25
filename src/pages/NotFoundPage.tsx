import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import { ROUTES } from "../config/routes";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-extrabold">Page not found</h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        Halaman yang kamu cari tidak tersedia.
      </p>
      <Button asChild>
        <Link to={ROUTES.home}>Go to menu</Link>
      </Button>
    </div>
  );
}
