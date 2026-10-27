export interface TransactionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'sale' | 'collection' | 'downPayment' | 'expense' | 'retail' | 'purchase' | 'dealerPayment' | 'payout';
  amount: number;
  discount?: number;
  downPayment?: number;
  remainingDue?: number;
  customerOrDealer?: string;
  note?: string;
}
