import { describe, it, expect } from 'vitest';
import { formatINR, formatDate, getDueStatus } from '../formatters';

describe('formatINR', () => {
  it('formats integer amounts to INR currency format', () => {
    const formatted = formatINR(1200);
    expect(formatted).toMatch(/1,200(\.00)?/);
  });

  it('formats decimal strings correctly', () => {
    const formatted = formatINR('4500.50');
    expect(formatted).toMatch(/4,500\.50/);
  });

  it('handles zero, null, and empty string safely', () => {
    expect(formatINR(0)).toMatch(/0(\.00)?/);
    expect(formatINR(null)).toMatch(/0(\.00)?/);
    expect(formatINR(undefined)).toMatch(/0(\.00)?/);
    expect(formatINR('')).toMatch(/0(\.00)?/);
  });

  it('formats large values according to Indian number system', () => {
    const formatted = formatINR(100000); // 1 Lakh
    expect(formatted).toMatch(/1,00,000/);
  });
});

describe('formatDate', () => {
  it('formats YYYY-MM-DD date string', () => {
    const formatted = formatDate('2026-10-25');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Oct');
    expect(formatted).toContain('25');
  });

  it('handles invalid or empty dates gracefully', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
  });
});

describe('getDueStatus', () => {
  it('returns Repaid when isRepaid is true', () => {
    const status = getDueStatus('2026-10-20', true);
    expect(status.statusText).toBe('Repaid');
    expect(status.isOverdue).toBe(false);
  });

  it('identifies overdue dates accurately', () => {
    // 5 days ago
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const pastYear = past.getFullYear();
    const pastMonth = String(past.getMonth() + 1).padStart(2, '0');
    const pastDay = String(past.getDate()).padStart(2, '0');
    const pastString = `${pastYear}-${pastMonth}-${pastDay}`;

    const status = getDueStatus(pastString, false);
    expect(status.isOverdue).toBe(true);
    expect(status.daysDifference).toBe(5);
    expect(status.statusText).toContain('5 days overdue');
  });

  it('identifies future dates as pending due', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const futYear = future.getFullYear();
    const futMonth = String(future.getMonth() + 1).padStart(2, '0');
    const futDay = String(future.getDate()).padStart(2, '0');
    const futureString = `${futYear}-${futMonth}-${futDay}`;

    const status = getDueStatus(futureString, false);
    expect(status.isOverdue).toBe(false);
    expect(status.statusText).toContain('Due in 7 days');
  });
});
