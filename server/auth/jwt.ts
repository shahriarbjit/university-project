import jwt from "jsonwebtoken";
import { UserRecord } from "@shared/api";

const jwtSecret = process.env.JWT_SECRET ?? "dev-secret-change-me";
const jwtExpiresIn = "7d";

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export function signAuthToken(user: UserRecord): string {
  const payload: AuthTokenPayload = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, jwtSecret) as AuthTokenPayload;
}
