import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCustomer,
  filterCustomerList,
  type CustomerRecord,
} from './customer-service.ts';

test('validateCustomer enforces name and mobile for installment', () => {
  const invalid = validateCustomer('Installment', { name: '', primaryMobile: '' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.primaryMobile);

  const valid = validateCustomer('Installment', { name: 'Rony', primaryMobile: '01712345678' });
  assert.equal(valid.valid, true);
});

test('validateCustomer allows cash customer without mandatory primary mobile', () => {
  const validCash = validateCustomer('Cash', { name: 'Sabbir Bhuiyan', primaryMobile: '' });
  assert.equal(validCash.valid, true);
});

test('filterCustomerList filters by query and type', () => {
  const list: CustomerRecord[] = [
    { id: 1, name: 'Sabbir Bhuiyan', type: 'Cash-remaining', status: 'Completed' },
    { id: 2, name: 'Rony', type: 'Installment', status: 'No cell', primaryMobile: '01812345678' },
  ];

  const filtered = filterCustomerList(list, '018');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].name, 'Rony');

  const filteredType = filterCustomerList(list, '', 'Cash-remaining');
  assert.equal(filteredType.length, 1);
  assert.equal(filteredType[0].name, 'Sabbir Bhuiyan');
});
