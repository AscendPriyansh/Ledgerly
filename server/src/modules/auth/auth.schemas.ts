import { z } from "zod";

const phoneSchema = z.string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number with country code");

export const requestOtpSchema = z.object({ phone: phoneSchema });
export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits")
});
