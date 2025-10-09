import jwt from "jsonwebtoken";

const ACCESS_TTL = "12h";
const REFRESH_TTL = "30d";

export type JwtPayload = {
  sub: string; // userId
  ten: string; // tenantId
  rol: string; // role
  typ: "access" | "refresh" | "password_reset";
  type?: "password_reset"; // For backward compatibility
};

export function signAccessToken(
  payload: Omit<JwtPayload, "typ"> & { type?: "password_reset" }
): string {
  const secret = process.env.JWT_ACCESS_SECRET || "dev-access";
  const tokenType = payload.type || "access";
  return jwt.sign({ ...payload, typ: tokenType }, secret, {
    expiresIn: tokenType === "password_reset" ? "1h" : ACCESS_TTL,
  });
}

export function signRefreshToken(payload: Omit<JwtPayload, "typ">): string {
  const secret = process.env.JWT_REFRESH_SECRET || "dev-refresh";
  return jwt.sign({ ...payload, typ: "refresh" }, secret, {
    expiresIn: REFRESH_TTL,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const secret = process.env.JWT_ACCESS_SECRET || "dev-access";
  return jwt.verify(token, secret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = process.env.JWT_REFRESH_SECRET || "dev-refresh";
  return jwt.verify(token, secret) as JwtPayload;
}
