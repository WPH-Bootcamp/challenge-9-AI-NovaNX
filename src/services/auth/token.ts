export type TokenStorage = "local" | "session";

const TOKEN_KEY = "authToken";
const USERNAME_KEY = "authUserName";

function safeGetStorage(kind: TokenStorage): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  const local = safeGetStorage("local")?.getItem(TOKEN_KEY);
  if (local) return local;
  const session = safeGetStorage("session")?.getItem(TOKEN_KEY);
  return session || null;
}

export function setAuthToken(token: string, storage: TokenStorage = "local") {
  const s = safeGetStorage(storage);
  if (!s) return;
  s.setItem(TOKEN_KEY, token);
}

export function getAuthUserName(): string | null {
  const local = safeGetStorage("local")?.getItem(USERNAME_KEY);
  if (local) return local;
  const session = safeGetStorage("session")?.getItem(USERNAME_KEY);
  return session || null;
}

export function setAuthUserName(
  userName: string,
  storage: TokenStorage = "local",
) {
  const normalized = userName.trim();
  if (!normalized) return;

  const s = safeGetStorage(storage);
  if (!s) return;
  s.setItem(USERNAME_KEY, normalized);
}

export function clearAuthToken() {
  safeGetStorage("local")?.removeItem(TOKEN_KEY);
  safeGetStorage("session")?.removeItem(TOKEN_KEY);
  safeGetStorage("local")?.removeItem(USERNAME_KEY);
  safeGetStorage("session")?.removeItem(USERNAME_KEY);
}
