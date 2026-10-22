import { z } from 'zod';

export const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8, 'Phone number is too short')
    .regex(
      /^\+?[1-9]\d{7,14}$/,
      'Enter a valid phone number with country code (e.g. +919876543210)'
    ),
});

export type PhoneFormData = z.infer<typeof phoneSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export type OtpFormData = z.infer<typeof otpSchema>;

export const createLoanSchema = z.object({
  friendName: z
    .string()
    .trim()
    .min(1, 'Friend name is required')
    .max(80, 'Friend name cannot exceed 80 characters'),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && isFinite(num);
    }, 'Amount must be a positive number')
    .refine((val) => {
      const num = parseFloat(val);
      return num <= 9999999999.99;
    }, 'Amount is too large')
    .refine((val) => {
      return /^\d+(\.\d{1,2})?$/.test(val);
    }, 'Amount can have at most 2 decimal places'),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid due date is required (YYYY-MM-DD)'),
  note: z.string().max(200, 'Note is too long').optional(),
});

export type CreateLoanFormData = z.infer<typeof createLoanSchema>;
