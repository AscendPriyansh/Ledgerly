import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import { authenticate } from "../../middleware/authenticate";
import { createLoanSchema } from "./loan.schemas";

export const loansRouter = Router();
loansRouter.use(authenticate);

function mapLoan(loan: any, today: Date) {
  const repaid = (loan.repayments ?? []).reduce(
    (sum: Prisma.Decimal, repayment: any) => sum.plus(repayment.amount),
    new Prisma.Decimal(0)
  );
  const outstanding = Prisma.Decimal.max(loan.amount.minus(repaid), new Prisma.Decimal(0));

  return {
    id: loan.id,
    friendName: loan.friendName,
    amount: loan.amount.toFixed(2),
    repaidAmount: repaid.toFixed(2),
    outstandingAmount: outstanding.toFixed(2),
    dueDate: loan.dueDate.toISOString().slice(0, 10),
    status: loan.status,
    isOverdue: outstanding.greaterThan(0) && loan.dueDate < today,
    note: loan.note ?? undefined,
    repayments: (loan.repayments ?? []).map((r: any) => ({
      id: r.id,
      amount: r.amount.toFixed(2),
      repaidAt: r.repaidAt.toISOString()
    })),
    createdAt: loan.createdAt.toISOString()
  };
}

loansRouter.get("/", async (req, res, next) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.auth!.sub },
      include: {
        repayments: {
          orderBy: { repaidAt: "desc" }
        }
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }]
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    res.json({
      loans: loans.map((loan) => mapLoan(loan, today))
    });
  } catch (error) {
    next(error);
  }
});

loansRouter.get("/:id", async (req, res, next) => {
  try {
    const loan = await prisma.loan.findFirst({
      where: { id: req.params.id, userId: req.auth!.sub },
      include: {
        repayments: {
          orderBy: { repaidAt: "desc" }
        }
      }
    });

    if (!loan) throw new HttpError(404, "Loan not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    res.json({
      loan: mapLoan(loan, today)
    });
  } catch (error) {
    next(error);
  }
});

loansRouter.post("/", async (req, res, next) => {
  try {
    const input = createLoanSchema.parse(req.body);
    const dueDate = new Date(`${input.dueDate}T00:00:00.000Z`);

    const loan = await prisma.loan.create({
      data: {
        userId: req.auth!.sub,
        friendName: input.friendName,
        amount: new Prisma.Decimal(input.amount.toFixed(2)),
        dueDate,
        note: input.note || null
      },
      include: { repayments: true }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    res.status(201).json({
      loan: mapLoan(loan, today)
    });
  } catch (error) {
    next(error);
  }
});

loansRouter.patch("/:id/repay", async (req, res, next) => {
  try {
    const loanId = req.params.id;
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId: req.auth!.sub },
      include: { repayments: true }
    });

    if (!loan) throw new HttpError(404, "Loan not found");
    if (loan.status === "REPAID") throw new HttpError(409, "Loan is already repaid");

    const alreadyRepaid = loan.repayments.reduce(
      (sum, repayment) => sum.plus(repayment.amount),
      new Prisma.Decimal(0)
    );
    const remaining = loan.amount.minus(alreadyRepaid);
    if (remaining.lessThanOrEqualTo(0)) {
      throw new HttpError(409, "Loan has no outstanding balance");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.loan.updateMany({
        where: { id: loan.id, userId: req.auth!.sub, status: "OUTSTANDING" },
        data: { status: "REPAID" }
      });
      if (updated.count !== 1) throw new HttpError(409, "Loan has already been repaid");

      const repayment = await tx.repayment.create({
        data: { loanId: loan.id, amount: remaining }
      });
      return { repayment };
    });

    res.json({
      message: "Loan marked as repaid",
      loanId: loan.id,
      repaidAmount: result.repayment.amount.toFixed(2),
      status: "REPAID"
    });
  } catch (error) {
    next(error);
  }
});
