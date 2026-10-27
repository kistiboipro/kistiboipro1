import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isLowStock,
  validateProductData,
  filterStockProducts,
  calculateStockSummary,
  applyStockAdd,
  applyStockExchange,
} from './stock-service.ts';

test('isLowStock correctly flags quantities below 5', () => {
  assert.equal(isLowStock(0), true);
  assert.equal(isLowStock(4), true);
  assert.equal(isLowStock(5), false);
  assert.equal(isLowStock(10), false);
});

test('validateProductData validates required fields', () => {
  const invalid = validateProductData({
    name: '',
    purchasePrice: '',
    quantity: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.purchasePrice);
  assert.ok(invalid.errors.quantity);

  const valid = validateProductData({
    name: 'Samsung Galaxy A55',
    purchasePrice: '38500',
    quantity: '12',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('validateProductData handles setSellingPrice toggle', () => {
  const withSellingMissing = validateProductData({
    name: 'Samsung Galaxy A55',
    purchasePrice: '38500',
    quantity: '12',
    setSellingPrice: true,
    sellingPrice: '',
  });
  assert.equal(withSellingMissing.valid, false);
  assert.ok(withSellingMissing.errors.sellingPrice);

  const withSellingValid = validateProductData({
    name: 'Samsung Galaxy A55',
    purchasePrice: '38500',
    quantity: '12',
    setSellingPrice: true,
    sellingPrice: '42000',
  });
  assert.equal(withSellingValid.valid, true);
});

test('filterStockProducts filters by query and category', () => {
  const items = [
    { id: 1, name: 'Samsung Galaxy A55', category: 'Mobile', purchasePrice: 38000, quantity: 10, setSellingPrice: false, forRetailSale: false },
    { id: 2, name: 'Walton Refrigerator', category: 'Refrigerator', purchasePrice: 42000, quantity: 2, setSellingPrice: false, forRetailSale: false },
    { id: 3, name: 'Led 32 inch', category: 'Electronics', purchasePrice: 20500, quantity: 15, setSellingPrice: false, forRetailSale: false }
  ];

  const searchMobile = filterStockProducts(items, 'galaxy', 'all');
  assert.equal(searchMobile.length, 1);
  assert.equal(searchMobile[0].name, 'Samsung Galaxy A55');

  const categoryFilter = filterStockProducts(items, '', 'Refrigerator');
  assert.equal(categoryFilter.length, 1);
  assert.equal(categoryFilter[0].id, 2);
});

test('calculateStockSummary aggregates units and low stock', () => {
  const items = [
    { id: 1, name: 'Item 1', category: 'General', purchasePrice: 100, quantity: 10, setSellingPrice: false, forRetailSale: false },
    { id: 2, name: 'Item 2', category: 'General', purchasePrice: 200, quantity: 2, setSellingPrice: false, forRetailSale: false },
  ];
  const summary = calculateStockSummary(items);
  assert.equal(summary.totalCount, 2);
  assert.equal(summary.totalUnits, 12);
  assert.equal(summary.totalValuation, 100 * 10 + 200 * 2);
  assert.equal(summary.lowStockCount, 1);
});

test('applyStockAdd increments quantity and appends movement record', () => {
  const item: any = { id: 1, name: 'Led 32"', quantity: 100, purchasePrice: 20000 };
  const updated = applyStockAdd(item, 50, 'New delivery');
  assert.equal(updated.quantity, 150);
  assert.equal(updated.movements?.length, 1);
  assert.equal(updated.movements?.[0].quantity, 50);
});

test('applyStockExchange validates insufficient stock and handles successful deduction', () => {
  const item: any = { id: 1, name: 'Led 32"', quantity: 20, purchasePrice: 20000 };
  const fail = applyStockExchange(item, 25, 'damage');
  assert.equal(fail.success, false);

  const success = applyStockExchange(item, 5, 'return', 'Returned to Rowsanara');
  assert.equal(success.success, true);
  assert.equal(success.updatedProduct?.quantity, 15);
  assert.equal(success.updatedProduct?.movements?.[0].quantity, -5);
});
