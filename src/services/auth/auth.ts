import { api } from "../api/axios";

export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  return typeof v === "string" ? v : null;
}

function extractToken(payload: unknown): string | null {
  if (!isRecord(payload)) return null;

  return (
    readString(payload, "token") ||
    readString(payload, "accessToken") ||
    (isRecord(payload.data)
      ? readString(payload.data, "token") ||
        readString(payload.data, "accessToken")
      : null)
  );
}

export async function register(input: RegisterInput) {
  const res = await api.post("/api/auth/register", input);
  return res.data;
}

export async function login(
  input: LoginInput,
): Promise<{ raw: unknown; token: string }> {
  const res = await api.post("/api/auth/login", input);
  const token = extractToken(res.data);
  if (!token) {
    throw new Error("Login succeeded but token was not found in response");
  }

  return { raw: res.data, token };
}
