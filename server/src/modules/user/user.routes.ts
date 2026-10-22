import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";

export const userRouter = Router();

userRouter.use(authenticate);

const updateProfileSchema = z.object({
  name: z.string().trim().max(80, "Name must not exceed 80 characters").optional().nullable(),
  avatarUrl: z.string().trim().max(500, "Avatar URL is too long").optional().nullable(),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(8, "Phone number is too short")
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number with country code")
    .optional(),
  bio: z.string().trim().max(250, "Bio must not exceed 250 characters").optional().nullable(),
});

userRouter.get("/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { loans: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name ?? null,
        avatarUrl: user.avatarUrl ?? null,
        email: user.email ?? null,
        bio: user.bio ?? null,
        totalLoans: user._count.loans,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

userRouter.patch("/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Validation error",
        details: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
      return;
    }

    const { name, avatarUrl, email, phone, bio } = parsed.data;

    // If phone number is updated, ensure it's not taken by another user
    if (phone) {
      const existing = await prisma.user.findFirst({
        where: {
          phone,
          NOT: { id: userId },
        },
      });

      if (existing) {
        res.status(409).json({ error: "Phone number is already associated with another account" });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name || null }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
        ...(email !== undefined && { email: email ? email.toLowerCase() : null }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio: bio || null }),
      },
      include: {
        _count: {
          select: { loans: true },
        },
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updated.id,
        phone: updated.phone,
        name: updated.name ?? null,
        avatarUrl: updated.avatarUrl ?? null,
        email: updated.email ?? null,
        bio: updated.bio ?? null,
        totalLoans: updated._count.loans,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});
