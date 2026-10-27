import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateExpenseData,
  filterExpenses,
  calculateTotalExpenses,
  type ExpenseRecord,
} from './expense-service.ts';

test('validateExpenseData catches empty title and invalid amounts', () => {
  const invalid = validateExpenseData({ title: '', amount: '0' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.amount);

  const valid = validateExpenseData({ title: 'Office rent July', amount: '15000' });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('filterExpenses filters by search query and date range', () => {
  const list: ExpenseRecord[] = [
    { id: 1, title: 'Office rent July', category: 'Rent', amount: 15000, date: '2026-10-01' },
    { id: 2, title: 'Shop Electricity', category: 'Electricity', amount: 3500, date: '2026-10-15' },
    { id: 3, title: 'Transport van', category: 'Transport', amount: 1200, date: '2026-10-22' },
  ];

  const searchRent = filterExpenses(list, 'rent');
  assert.equal(searchRent.length, 1);
  assert.equal(searchRent[0].id, 1);

  const dateFiltered = filterExpenses(list, '', '2026-10-10', '2026-10-31');
  assert.equal(dateFiltered.length, 2);
});

test('calculateTotalExpenses sums amounts accurately', () => {
  const list: ExpenseRecord[] = [
    { id: 1, title: 'Rent', category: 'Rent', amount: 15000, date: '2026-10-01' },
    { id: 2, title: 'Bills', category: 'Utility', amount: 3500, date: '2026-10-15' },
  ];
  assert.equal(calculateTotalExpenses(list), 18500);
});
