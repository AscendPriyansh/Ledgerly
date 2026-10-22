import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { loansRouter } from "./modules/loans/loans.routes";
import { summaryRouter } from "./modules/summary/summary.routes";
import { userRouter } from "./modules/user/user.routes";
import { errorHandler, notFound } from "./middleware/error-handler";

export const app = express();

app.use(cors({
  origin: env.CLIENT_ORIGIN === "*" ? true : env.CLIENT_ORIGIN.split(",").map((item) => item.trim())
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "miniledger-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/loans", loansRouter);
app.use("/api/summary", summaryRouter);

app.use(notFound);
app.use(errorHandler);
