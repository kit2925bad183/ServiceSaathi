import { SignJWT, jwtVerify } from "jose";

function getSecretKey(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET ||
    "servicesaathi-default-development-secret-key-at-least-32-chars-long";
  return new TextEncoder().encode(secret);
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60; // 1 hour expiration

  return new SignJWT({ email: email.toLowerCase(), purpose: "password_reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(getSecretKey());
}

export async function verifyPasswordResetToken(
  token: string
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.purpose !== "password_reset" || typeof payload.email !== "string") {
      return null;
    }
    return { email: payload.email };
  } catch {
    return null;
  }
}
