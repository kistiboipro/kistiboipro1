export interface StockMovement {
  id: string;
  productId: string | number;
  type: 'add' | 'exchange' | 'damage' | 'return';
  quantity: number;
  date: string;
  note?: string;
  dealerOrReason?: string;
}

export interface StockProduct {
  id: string | number;
  name: string;
  category: string;
  description?: string;
  purchasePrice: number;
  setSellingPrice: boolean;
  sellingPrice?: number;
  dealerName?: string;
  quantity: number;
  forRetailSale: boolean;
  createdAt?: string;
  movements?: StockMovement[];
}

export function applyStockAdd(product: StockProduct, amountToAdd: number, note?: string): StockProduct {
  const qtyToAdd = Math.max(0, amountToAdd);
  const movement: StockMovement = {
    id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: product.id,
    type: 'add',
    quantity: qtyToAdd,
    date: new Date().toISOString().split('T')[0],
    note: note || 'Stock added manually',
  };
  return {
    ...product,
    quantity: product.quantity + qtyToAdd,
    movements: [movement, ...(product.movements || [])],
  };
}

export function applyStockExchange(
  product: StockProduct,
  quantityChange: number,
  type: 'exchange' | 'damage' | 'return',
  reason?: string
): { success: boolean; updatedProduct?: StockProduct; error?: string } {
  if (quantityChange <= 0) {
    return { success: false, error: 'Quantity must be greater than zero' };
  }
  if (product.quantity < quantityChange) {
    return { success: false, error: 'Insufficient stock quantity for this operation' };
  }

  const movement: StockMovement = {
    id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: product.id,
    type,
    quantity: -quantityChange,
    date: new Date().toISOString().split('T')[0],
    dealerOrReason: reason || type,
  };

  return {
    success: true,
    updatedProduct: {
      ...product,
      quantity: product.quantity - quantityChange,
      movements: [movement, ...(product.movements || [])],
    },
  };
}

export const LOW_STOCK_THRESHOLD = 5;

export function isLowStock(quantity: number, threshold = LOW_STOCK_THRESHOLD): boolean {
  return Number.isFinite(quantity) && quantity < threshold;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateProductData(data: {
  name: string;
  purchasePrice: number | string;
  quantity: number | string;
  setSellingPrice?: boolean;
  sellingPrice?: number | string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Product name is required';
  }

  const pPrice = typeof data.purchasePrice === 'string' ? parseFloat(data.purchasePrice) : data.purchasePrice;
  if (isNaN(pPrice) || pPrice < 0) {
    errors.purchasePrice = 'Valid purchase price is required';
  }

  const qty = typeof data.quantity === 'string' ? parseInt(data.quantity, 10) : data.quantity;
  if (isNaN(qty) || qty < 0) {
    errors.quantity = 'Valid stock quantity is required';
  }

  if (data.setSellingPrice) {
    const sPrice = typeof data.sellingPrice === 'string' ? parseFloat(data.sellingPrice) : data.sellingPrice;
    if (sPrice === undefined || isNaN(sPrice) || sPrice < 0) {
      errors.sellingPrice = 'Valid selling price is required when enabled';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function filterStockProducts(
  products: StockProduct[],
  searchQuery = '',
  categoryFilter = 'all'
): StockProduct[] {
  const query = searchQuery.trim().toLowerCase();
  return products.filter((item) => {
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      (item.dealerName && item.dealerName.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query));

    const matchesCategory =
      !categoryFilter ||
      categoryFilter.toLowerCase() === 'all' ||
      categoryFilter.toLowerCase() === 'সকল ক্যাটেগরি' ||
      item.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesQuery && matchesCategory;
  });
}

export function calculateStockSummary(products: StockProduct[]) {
  const totalCount = products.length;
  const totalUnits = products.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const totalValuation = products.reduce(
    (acc, curr) => acc + (curr.purchasePrice || 0) * (curr.quantity || 0),
    0
  );
  const lowStockCount = products.filter((p) => isLowStock(p.quantity)).length;

  return {
    totalCount,
    totalUnits,
    totalValuation,
    lowStockCount,
  };
}
