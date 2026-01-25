import { Navigate, Outlet, useLocation } from "react-router-dom";

import { ROUTES } from "../../config/routes";
import { getAuthToken } from "../../services/auth/token";

export function RequireAuth() {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
