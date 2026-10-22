import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { generateOtp, hashOtp, verifyOtpHash } from "../../lib/otp";
import { HttpError } from "../../lib/http-error";
import { requestOtpSchema, verifyOtpSchema } from "./auth.schemas";

export const authRouter = Router();

// Basic in-memory throttling — resets on server restart (mock only)
const requestTimes = new Map<string, number[]>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

function enforceOtpRequestLimit(phone: string) {
  const now = Date.now();
  const recent = (requestTimes.get(phone) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    throw new HttpError(429, "Too many OTP requests. Try again later.");
  }
  recent.push(now);
  requestTimes.set(phone, recent);
}

// POST /api/auth/request-otp
authRouter.post("/request-otp", async (req, res, next) => {
  try {
    const { phone } = requestOtpSchema.parse(req.body);
    enforceOtpRequestLimit(phone);

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60_000);

    await prisma.otpChallenge.create({
      data: { phone, otpHash: hashOtp(phone, otp), expiresAt }
    });

    // Intentionally printed — this is a mock OTP for development only
    console.info(`[MOCK OTP] ${phone}: ${otp} (expires in ${env.OTP_TTL_MINUTES} minutes)`);

    res.status(200).json({
      message: "OTP sent. Check the server log.",
      expiresInSeconds: env.OTP_TTL_MINUTES * 60
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/verify-otp
authRouter.post("/verify-otp", async (req, res, next) => {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);

    const challenge = await prisma.otpChallenge.findFirst({
      where: { phone, consumedAt: null },
      orderBy: { createdAt: "desc" }
    });

    if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
      throw new HttpError(401, "OTP is invalid or expired. Request a new one.");
    }
    if (challenge.attempts >= 5) {
      throw new HttpError(429, "Too many incorrect attempts. Request a new OTP.");
    }

    if (!verifyOtpHash(phone, otp, challenge.otpHash)) {
      await prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } }
      });
      throw new HttpError(401, "Incorrect OTP.");
    }

    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() }
    });

    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone }
    });

    const token = jwt.sign(
      { phone: user.phone },
      env.JWT_SECRET,
      { subject: user.id, expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
        email: user.email ?? undefined,
        bio: user.bio ?? undefined,
        createdAt: user.createdAt.toISOString(),
      }
    });
  } catch (error) {
    next(error);
  }
});
