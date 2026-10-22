import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";

export const summaryRouter = Router();
summaryRouter.use(authenticate);

const analyticsQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6)
});

summaryRouter.get("/", async (req, res, next) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.auth!.sub },
      include: { repayments: true }
    });

    const zero = new Prisma.Decimal(0);
    let totalLent = zero;
    let totalRepaid = zero;
    let overdueAmount = zero;
    let outstandingAmount = zero;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const loan of loans) {
      const repaid = loan.repayments.reduce(
        (sum, repayment) => sum.plus(repayment.amount),
        zero
      );
      const outstanding = Prisma.Decimal.max(loan.amount.minus(repaid), zero);

      totalLent = totalLent.plus(loan.amount);
      totalRepaid = totalRepaid.plus(repaid);
      outstandingAmount = outstandingAmount.plus(outstanding);
      if (loan.dueDate < today && outstanding.greaterThan(0)) {
        overdueAmount = overdueAmount.plus(outstanding);
      }
    }

    res.json({
      totalLent: totalLent.toFixed(2),
      totalRepaid: totalRepaid.toFixed(2),
      overdueAmount: overdueAmount.toFixed(2),
      outstandingAmount: outstandingAmount.toFixed(2),
      loanCount: loans.length
    });
  } catch (error) {
    next(error);
  }
});

summaryRouter.get("/analytics", async (req, res, next) => {
  try {
    const { months } = analyticsQuerySchema.parse(req.query);
    const userId = req.auth!.sub;

    const loans = await prisma.loan.findMany({
      where: { userId },
      include: {
        repayments: {
          orderBy: { repaidAt: "desc" }
        }
      },
      orderBy: [{ createdAt: "desc" }]
    });

    const zero = new Prisma.Decimal(0);
    let totalLent = zero;
    let totalRepaid = zero;
    let overdueAmount = zero;
    let normalOutstandingAmount = zero;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    let overdueCount = 0;
    let dueSoonCount = 0;
    let dueSoonAmount = zero;

    let largestOutstanding: {
      id: string;
      friendName: string;
      amount: string;
      outstandingAmount: string;
      dueDate: string;
    } | null = null;
    let largestOutstandingDec = zero;

    const overdueLoans: Array<{
      id: string;
      friendName: string;
      amount: string;
      outstandingAmount: string;
      dueDate: string;
      daysOverdue: number;
    }> = [];

    const upcomingLoans: Array<{
      id: string;
      friendName: string;
      amount: string;
      outstandingAmount: string;
      dueDate: string;
      daysUntilDue: number;
    }> = [];

    const recentActivities: Array<{
      id: string;
      type: "LOAN_CREATED" | "LOAN_REPAID";
      friendName: string;
      amount: string;
      date: string;
      loanId: string;
    }> = [];

    for (const loan of loans) {
      const repaid = loan.repayments.reduce(
        (sum, repayment) => sum.plus(repayment.amount),
        zero
      );
      const outstanding = Prisma.Decimal.max(loan.amount.minus(repaid), zero);

      totalLent = totalLent.plus(loan.amount);
      totalRepaid = totalRepaid.plus(repaid);

      const isPastDue = loan.dueDate < today;
      const isDueSoon = loan.dueDate >= today && loan.dueDate <= sevenDaysFromNow;

      if (outstanding.greaterThan(0)) {
        if (isPastDue) {
          overdueAmount = overdueAmount.plus(outstanding);
          overdueCount++;
          const diffMs = today.getTime() - loan.dueDate.getTime();
          const daysOverdue = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

          overdueLoans.push({
            id: loan.id,
            friendName: loan.friendName,
            amount: loan.amount.toFixed(2),
            outstandingAmount: outstanding.toFixed(2),
            dueDate: loan.dueDate.toISOString().slice(0, 10),
            daysOverdue
          });
        } else {
          normalOutstandingAmount = normalOutstandingAmount.plus(outstanding);
        }

        if (isDueSoon) {
          dueSoonCount++;
          dueSoonAmount = dueSoonAmount.plus(outstanding);
          const diffMs = loan.dueDate.getTime() - today.getTime();
          const daysUntilDue = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

          upcomingLoans.push({
            id: loan.id,
            friendName: loan.friendName,
            amount: loan.amount.toFixed(2),
            outstandingAmount: outstanding.toFixed(2),
            dueDate: loan.dueDate.toISOString().slice(0, 10),
            daysUntilDue
          });
        }

        if (outstanding.greaterThan(largestOutstandingDec)) {
          largestOutstandingDec = outstanding;
          largestOutstanding = {
            id: loan.id,
            friendName: loan.friendName,
            amount: loan.amount.toFixed(2),
            outstandingAmount: outstanding.toFixed(2),
            dueDate: loan.dueDate.toISOString().slice(0, 10)
          };
        }
      }

      // Collect real events
      recentActivities.push({
        id: `created-${loan.id}`,
        type: "LOAN_CREATED",
        friendName: loan.friendName,
        amount: loan.amount.toFixed(2),
        date: loan.createdAt.toISOString(),
        loanId: loan.id
      });

      for (const rep of loan.repayments) {
        recentActivities.push({
          id: `repaid-${rep.id}`,
          type: "LOAN_REPAID",
          friendName: loan.friendName,
          amount: rep.amount.toFixed(2),
          date: rep.repaidAt.toISOString(),
          loanId: loan.id
        });
      }
    }

    // Sort overdue by largest amount or lateness
    overdueLoans.sort((a, b) => parseFloat(b.outstandingAmount) - parseFloat(a.outstandingAmount));
    upcomingLoans.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Generate monthly series for selected range
    const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
    const monthlySeriesMap = new Map<
      string,
      { month: string; label: string; lent: Prisma.Decimal; repaid: Prisma.Decimal }
    >();

    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = monthFormatter.format(d);
      monthlySeriesMap.set(key, { month: key, label, lent: zero, repaid: zero });
    }

    for (const loan of loans) {
      const d = new Date(loan.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthlySeriesMap.get(key);
      if (entry) {
        entry.lent = entry.lent.plus(loan.amount);
      }

      for (const rep of loan.repayments) {
        const rd = new Date(rep.repaidAt);
        const rkey = `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, "0")}`;
        const rentry = monthlySeriesMap.get(rkey);
        if (rentry) {
          rentry.repaid = rentry.repaid.plus(rep.amount);
        }
      }
    }

    const monthlySeries = Array.from(monthlySeriesMap.values()).map((item) => ({
      month: item.month,
      label: item.label,
      lent: item.lent.toFixed(2),
      repaid: item.repaid.toFixed(2)
    }));

    const totalOutstanding = normalOutstandingAmount.plus(overdueAmount);

    res.json({
      rangeMonths: months,
      portfolio: {
        totalLent: totalLent.toFixed(2),
        totalRepaid: totalRepaid.toFixed(2),
        outstandingTotal: totalOutstanding.toFixed(2),
        outstandingNormal: normalOutstandingAmount.toFixed(2),
        outstandingOverdue: overdueAmount.toFixed(2),
        loanCount: loans.length
      },
      monthlySeries,
      insights: {
        overdueCount,
        overdueAmount: overdueAmount.toFixed(2),
        dueSoonCount,
        dueSoonAmount: dueSoonAmount.toFixed(2),
        largestOutstanding,
        overdueLoans: overdueLoans.slice(0, 5),
        upcomingLoans: upcomingLoans.slice(0, 5)
      },
      recentActivity: recentActivities.slice(0, 6)
    });
  } catch (error) {
    next(error);
  }
});
