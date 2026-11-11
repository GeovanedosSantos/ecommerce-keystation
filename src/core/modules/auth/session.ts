import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "keystation_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  role: "CUSTOMER" | "ADMIN";
};

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET ausente ou curta demais (mínimo de 32 caracteres).",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    const role = payload.role;
    if (!payload.sub || (role !== "CUSTOMER" && role !== "ADMIN")) {
      return null;
    }

    return { userId: payload.sub, role };
  } catch {
    return null;
  }
}