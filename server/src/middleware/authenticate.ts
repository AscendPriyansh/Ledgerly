import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../lib/http-error";

export interface AuthPayload extends jwt.JwtPayload {
  sub: string;
  phone: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authentication token required"));
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === "string" || !payload.sub || !payload.phone) {
      return next(new HttpError(401, "Invalid authentication token"));
    }
    req.auth = payload as AuthPayload;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired authentication token"));
  }
}
