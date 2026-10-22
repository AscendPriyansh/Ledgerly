import { createHash, randomInt, timingSafeEqual } from "node:crypto";

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOtp(phone: string, otp: string): string {
  return createHash("sha256").update(`${phone}:${otp}`).digest("hex");
}

export function verifyOtpHash(phone: string, otp: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashOtp(phone, otp), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
