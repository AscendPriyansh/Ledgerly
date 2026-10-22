/**
 * Format numeric/string amounts to Indian Rupee (INR) currency representation.
 * Example: 1200 -> ₹1,200.00
 */
export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return '₹0.00';
  }

  const numericValue = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(numericValue)) {
    return '₹0.00';
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    // Fallback if Intl.NumberFormat has locale issues on older engines
    return `₹${numericValue.toFixed(2)}`;
  }
}

/**
 * Format an ISO date string (YYYY-MM-DD or full ISO) to a human-readable format.
 * Example: '2026-10-25' -> '25 Oct 2026'
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';

  try {
    // Append T00:00:00 to avoid timezone shift on plain YYYY-MM-DD
    const date = dateString.includes('T')
      ? new Date(dateString)
      : new Date(`${dateString}T00:00:00`);

    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Calculate overdue or due-soon metrics.
 */
export function getDueStatus(dueDateString: string, isRepaid: boolean = false) {
  if (isRepaid) {
    return {
      statusText: 'Repaid',
      isOverdue: false,
      isDueToday: false,
      daysDifference: 0,
    };
  }

  try {
    const due = new Date(
      dueDateString.includes('T') ? dueDateString : `${dueDateString}T00:00:00`
    );
    due.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = due.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        statusText: overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`,
        isOverdue: true,
        isDueToday: false,
        daysDifference: overdueDays,
      };
    } else if (diffDays === 0) {
      return {
        statusText: 'Due today',
        isOverdue: false,
        isDueToday: true,
        daysDifference: 0,
      };
    } else {
      return {
        statusText: diffDays === 1 ? 'Due tomorrow' : `Due in ${diffDays} days`,
        isOverdue: false,
        isDueToday: false,
        daysDifference: diffDays,
      };
    }
  } catch {
    return {
      statusText: 'Due date set',
      isOverdue: false,
      isDueToday: false,
      daysDifference: 0,
    };
  }
}
