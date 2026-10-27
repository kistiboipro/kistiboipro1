export interface ExpenseRecord {
  id: string | number;
  title: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt?: string;
}

export interface ExpenseValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateExpenseData(data: {
  title: string;
  amount: number | string;
  date?: string;
}): ExpenseValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Expense title is required';
  }

  const parsedAmount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.amount = 'Valid expense amount greater than 0 is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function filterExpenses(
  expenses: ExpenseRecord[],
  query = '',
  startDate?: string,
  endDate?: string
): ExpenseRecord[] {
  const cleanQuery = query.trim().toLowerCase();

  return expenses.filter((e) => {
    const matchesQuery =
      !cleanQuery ||
      e.title.toLowerCase().includes(cleanQuery) ||
      (e.category && e.category.toLowerCase().includes(cleanQuery)) ||
      (e.notes && e.notes.toLowerCase().includes(cleanQuery));

    const matchesStartDate = !startDate || e.date >= startDate;
    const matchesEndDate = !endDate || e.date <= endDate;

    return matchesQuery && matchesStartDate && matchesEndDate;
  });
}

export function calculateTotalExpenses(expenses: ExpenseRecord[]): number {
  return expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
}
