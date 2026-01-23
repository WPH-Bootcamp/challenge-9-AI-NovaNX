import axios from "axios";

function normalizeBaseUrl(raw: string | undefined) {
  if (!raw) return "";

  let value = raw.trim();
  while (value.endsWith("/")) value = value.slice(0, -1);
  if (value.endsWith("/api-swagger"))
    value = value.replace(/\/api-swagger$/, "");
  if (value.endsWith("/api-swagger/"))
    value = value.replace(/\/api-swagger\/$/, "");
  if (value.endsWith("/api-swagger"))
    value = value.replace(/\/api-swagger$/, "");
  return value;
}

const baseURL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
