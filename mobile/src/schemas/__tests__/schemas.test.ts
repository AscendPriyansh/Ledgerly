import { describe, it, expect } from 'vitest';
import { phoneSchema, otpSchema, createLoanSchema } from '../index';

describe('Validation Schemas', () => {
  describe('phoneSchema', () => {
    it('validates a standard Indian phone with country code', () => {
      const result = phoneSchema.safeParse({ phone: '+919876543210' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid or too short phone numbers', () => {
      expect(phoneSchema.safeParse({ phone: '123' }).success).toBe(false);
      expect(phoneSchema.safeParse({ phone: 'invalid-string' }).success).toBe(false);
      expect(phoneSchema.safeParse({ phone: '+0123456789' }).success).toBe(false);
    });
  });

  describe('otpSchema', () => {
    it('accepts valid 6-digit numeric OTP', () => {
      const result = otpSchema.safeParse({ otp: '123456' });
      expect(result.success).toBe(true);
    });

    it('rejects OTP with letters or incorrect length', () => {
      expect(otpSchema.safeParse({ otp: '12345' }).success).toBe(false);
      expect(otpSchema.safeParse({ otp: '1234567' }).success).toBe(false);
      expect(otpSchema.safeParse({ otp: '12a456' }).success).toBe(false);
    });
  });

  describe('createLoanSchema', () => {
    it('validates valid loan creation payload', () => {
      const result = createLoanSchema.safeParse({
        friendName: 'Aman Sharma',
        amount: '1500.00',
        dueDate: '2026-10-30',
        note: 'Dinner split',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty friend name', () => {
      const result = createLoanSchema.safeParse({
        friendName: '',
        amount: '1500',
        dueDate: '2026-10-30',
      });
      expect(result.success).toBe(false);
    });

    it('rejects non-positive and invalid amounts', () => {
      expect(
        createLoanSchema.safeParse({
          friendName: 'Aman',
          amount: '0',
          dueDate: '2026-10-30',
        }).success
      ).toBe(false);

      expect(
        createLoanSchema.safeParse({
          friendName: 'Aman',
          amount: '-500',
          dueDate: '2026-10-30',
        }).success
      ).toBe(false);

      expect(
        createLoanSchema.safeParse({
          friendName: 'Aman',
          amount: '12.345', // more than 2 decimal places
          dueDate: '2026-10-30',
        }).success
      ).toBe(false);
    });

    it('rejects invalid date format', () => {
      expect(
        createLoanSchema.safeParse({
          friendName: 'Aman',
          amount: '500',
          dueDate: '25-10-2026', // Not YYYY-MM-DD
        }).success
      ).toBe(false);
    });
  });
});
