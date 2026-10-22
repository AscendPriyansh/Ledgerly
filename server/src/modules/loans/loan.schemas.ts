import { z } from "zod";

export const createLoanSchema = z.object({
  friendName: z.string().trim().min(1).max(80),
  amount: z.coerce.number().finite().positive().max(9999999999.99),
  dueDate: z.string().date(),
  note: z.string().trim().max(250).optional()
});
