import { supabase } from './supabase';
import { CustomerRecord } from './customer-service';
import { TransactionRecord } from './transaction-service';
import { ExpenseRecord } from './expense-service';
import { StockProduct } from './stock-service';

export const SUPABASE_PROJECT_ID = 'hlbabxaenpuzipsdttbn';
export const SUPABASE_URL = 'https://hlbabxaenpuzipsdttbn.supabase.co';

export interface SupabaseSyncStatus {
  connected: boolean;
  lastSync?: string;
  error?: string;
}

export interface InstallmentScheduleRecord {
  id: string;
  customerId: string | number;
  customerName: string;
  customerPhone: string;
  productName: string;
  installmentNo: number;
  totalInstallments: number;
  dueDate: string;
  amount: number;
  status: 'overdue' | 'due_today' | 'upcoming' | 'paid';
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  paidDate?: string;
  paidAmount?: number;
  collectorName?: string;
  avatarBg?: string;
}

// ============================================================================
// CUSTOMER PROFILES DATABASE OPERATIONS
// ============================================================================

/**
 * Upsert customer profile to Supabase database (`customers` table).
 */
export async function saveCustomerToSupabase(customer: CustomerRecord): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('customers').upsert({
      id: customer.id,
      name: customer.name,
      type: customer.type,
      primary_mobile: customer.primaryMobile,
      second_mobile: customer.secondMobile,
      workplace: customer.workplace,
      work_address: customer.workAddress,
      address: customer.address,
      family_member_name: customer.familyMemberName,
      family_member_mobile: customer.familyMemberMobile,
      landlord_name: customer.landlordName,
      landlord_mobile: customer.landlordMobile,
      guarantors: customer.guarantors,
      has_nid: customer.hasNid,
      status: customer.status,
      avatar_bg: customer.avatarBg,
      created_at: customer.createdAt || new Date().toISOString()
    });

    if (error) {
      console.warn('Supabase customer save warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Supabase network error saving customer:', err?.message || err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Fetch all customer profiles from Supabase (`customers` table).
 */
export async function fetchCustomersFromSupabase(): Promise<CustomerRecord[] | null> {
  try {
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });

    if (error || !data) {
      return null;
    }

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      primaryMobile: item.primary_mobile,
      secondMobile: item.second_mobile,
      workplace: item.workplace,
      workAddress: item.work_address,
      address: item.address,
      familyMemberName: item.family_member_name,
      familyMemberMobile: item.family_member_mobile,
      landlordName: item.landlord_name,
      landlordMobile: item.landlord_mobile,
      guarantors: item.guarantors || [],
      hasNid: item.has_nid,
      status: item.status,
      avatarBg: item.avatar_bg,
      createdAt: item.created_at
    }));
  } catch {
    return null;
  }
}

/**
 * Delete a customer profile from Supabase database.
 */
export async function deleteCustomerFromSupabase(customerId: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', customerId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

// ============================================================================
// INSTALLMENT RECORDS DATABASE OPERATIONS
// ============================================================================

/**
 * Save an installment schedule record to Supabase database (`installment_schedules` table).
 */
export async function saveInstallmentRecordToSupabase(record: InstallmentScheduleRecord): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('installment_schedules').upsert({
      id: record.id,
      customer_id: record.customerId,
      customer_name: record.customerName,
      customer_phone: record.customerPhone,
      product_name: record.productName,
      installment_no: record.installmentNo,
      total_installments: record.totalInstallments,
      due_date: record.dueDate,
      amount: record.amount,
      status: record.status,
      last_payment_date: record.lastPaymentDate,
      last_payment_amount: record.lastPaymentAmount,
      paid_date: record.paidDate,
      paid_amount: record.paidAmount,
      collector_name: record.collectorName,
      avatar_bg: record.avatarBg,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.warn('Supabase installment record save warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Fetch all installment schedule records from Supabase (`installment_schedules` table).
 */
export async function fetchInstallmentRecordsFromSupabase(): Promise<InstallmentScheduleRecord[] | null> {
  try {
    const { data, error } = await supabase.from('installment_schedules').select('*').order('due_date', { ascending: true });

    if (error || !data) {
      return null;
    }

    return data.map((item: any) => ({
      id: item.id,
      customerId: item.customer_id,
      customerName: item.customer_name,
      customerPhone: item.customer_phone,
      productName: item.product_name,
      installmentNo: Number(item.installment_no) || 1,
      totalInstallments: Number(item.total_installments) || 12,
      dueDate: item.due_date,
      amount: Number(item.amount) || 0,
      status: item.status,
      lastPaymentDate: item.last_payment_date,
      lastPaymentAmount: item.last_payment_amount ? Number(item.last_payment_amount) : undefined,
      paidDate: item.paid_date,
      paidAmount: item.paid_amount ? Number(item.paid_amount) : undefined,
      collectorName: item.collector_name,
      avatarBg: item.avatar_bg
    }));
  } catch {
    return null;
  }
}

/**
 * Update payment status for a specific installment record in Supabase.
 */
export async function updateInstallmentPaymentInSupabase(
  installmentId: string,
  paymentData: {
    paidDate: string;
    paidAmount: number;
    collectorName?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('installment_schedules').update({
      status: 'paid',
      paid_date: paymentData.paidDate,
      paid_amount: paymentData.paidAmount,
      last_payment_date: paymentData.paidDate,
      last_payment_amount: paymentData.paidAmount,
      collector_name: paymentData.collectorName || 'Shop Collector',
      updated_at: new Date().toISOString()
    }).eq('id', installmentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

// ============================================================================
// TRANSACTIONS DATABASE OPERATIONS
// ============================================================================

/**
 * Save transaction to Supabase database (`transactions` table).
 */
export async function saveTransactionToSupabase(tx: TransactionRecord): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('transactions').upsert({
      id: tx.id,
      date: tx.date,
      type: tx.type,
      amount: tx.amount,
      discount: tx.discount,
      down_payment: tx.downPayment,
      remaining_due: tx.remainingDue,
      customer_or_dealer: tx.customerOrDealer,
      note: tx.note,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.warn('Supabase transaction save warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Fetch transactions from Supabase (`transactions` table).
 */
export async function fetchTransactionsFromSupabase(): Promise<TransactionRecord[] | null> {
  try {
    const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });

    if (error || !data) {
      return null;
    }

    return data.map((item: any) => ({
      id: item.id,
      date: item.date,
      type: item.type,
      amount: Number(item.amount) || 0,
      discount: item.discount ? Number(item.discount) : undefined,
      downPayment: item.down_payment ? Number(item.down_payment) : undefined,
      remainingDue: item.remaining_due ? Number(item.remaining_due) : undefined,
      customerOrDealer: item.customer_or_dealer,
      note: item.note
    }));
  } catch {
    return null;
  }
}

// ============================================================================
// EXPENSE & STOCK DATABASE OPERATIONS
// ============================================================================

/**
 * Save Expense to Supabase (`expenses` table).
 */
export async function saveExpenseToSupabase(expense: ExpenseRecord): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('expenses').upsert({
      id: expense.id,
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      notes: expense.notes,
      created_at: expense.createdAt || new Date().toISOString()
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Save Stock Product to Supabase (`stock_products` table).
 */
export async function saveStockToSupabase(product: StockProduct): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('stock_products').upsert({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      purchase_price: product.purchasePrice,
      set_selling_price: product.setSellingPrice,
      selling_price: product.sellingPrice,
      dealer_name: product.dealerName,
      quantity: product.quantity,
      for_retail_sale: product.forRetailSale,
      movements: product.movements || [],
      created_at: product.createdAt || new Date().toISOString()
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Save user sign up / account data directly to Supabase (`user_accounts` table).
 */
export async function saveUserAccountToSupabase(userData: {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  shop_name?: string;
  role?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('user_accounts').upsert({
      id: userData.id || `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      shop_name: userData.shop_name || 'KistiBoi Store',
      role: userData.role || 'Admin',
      created_at: new Date().toISOString()
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}
