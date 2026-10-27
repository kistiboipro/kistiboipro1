'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  Search, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  ShoppingCart, 
  Wallet, 
  Banknote, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Tag, 
  Coins, 
  Building2,
  Receipt
} from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { TransactionRecord } from '@/lib/transaction-service';
import { DateRangePicker } from '@/components/date-range-picker';

interface MetricDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: 'totalSales' | 'totalCollection' | 'downPayment' | 'totalDue' | 'totalExpenses' | 'netProfit' | 'cashSales' | 'totalDiscount' | 'totalPurchase' | 'totalPaid' | 'totalPayable' | 'cashInHand' | null;
  metricTitle: string;
  metricAmount: string;
  transactions: TransactionRecord[];
  startDate: string;
  endDate: string;
  onApplyDateRange?: (start: string, end: string, label?: string) => void;
  darkMode: boolean;
  language: Language;
}

export function MetricDetailModal({
  isOpen,
  onClose,
  metricType,
  metricTitle,
  metricAmount,
  transactions,
  startDate,
  endDate,
  onApplyDateRange,
  darkMode,
  language,
}: MetricDetailModalProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Filter transactions based on metric type and date range / search query
  const filteredTransactions = useMemo(() => {
    if (!metricType) return [];

    return transactions.filter((tx) => {
      // Date range filter
      if (startDate && endDate) {
        if (tx.date < startDate || tx.date > endDate) return false;
      }

      if (dateFilter && tx.date !== dateFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tx.customerOrDealer?.toLowerCase().includes(q) || false;
        const matchesNote = tx.note?.toLowerCase().includes(q) || false;
        const matchesId = tx.id?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesNote && !matchesId) return false;
      }

      // Type matcher
      switch (metricType) {
        case 'totalSales':
          return tx.type === 'sale';
        case 'cashSales':
          return tx.type === 'sale' && (tx.downPayment === tx.amount || tx.note?.toLowerCase().includes('cash') || !tx.remainingDue);
        case 'totalCollection':
          return tx.type === 'collection';
        case 'downPayment':
          return tx.type === 'downPayment' || (tx.type === 'sale' && (tx.downPayment || 0) > 0);
        case 'totalDue':
          return (tx.remainingDue || 0) > 0;
        case 'totalExpenses':
          return tx.type === 'expense';
        case 'netProfit':
          return tx.type === 'sale' || tx.type === 'collection';
        case 'totalDiscount':
          return (tx.discount || 0) > 0 || tx.note?.toLowerCase().includes('discount');
        case 'totalPurchase':
          return tx.type === 'purchase';
        case 'totalPaid':
          return tx.type === 'dealerPayment' || tx.type === 'payout';
        case 'totalPayable':
          return tx.type === 'purchase' && (tx.remainingDue || 0) > 0;
        case 'cashInHand':
          return true; // All cash inflows/outflows
        default:
          return true;
      }
    });
  }, [transactions, metricType, startDate, endDate, dateFilter, searchQuery]);

  // Compute total for filtered records
  const computedTotal = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => {
      if (metricType === 'totalDue' || metricType === 'totalPayable') {
        return sum + (tx.remainingDue || tx.amount || 0);
      }
      if (metricType === 'downPayment') {
        return sum + (tx.downPayment || tx.amount || 0);
      }
      if (metricType === 'totalDiscount') {
        return sum + (tx.discount || 0);
      }
      return sum + (tx.amount || 0);
    }, 0);
  }, [filteredTransactions, metricType]);

  const formatAmount = (val: number) => {
    const prefix = language === 'bn' ? '৳' : 'Tk ';
    return `${prefix}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`w-full max-w-4xl rounded-3xl border shadow-2xl relative flex flex-col max-h-[90vh] ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Modal Header */}
          <div className={`p-6 border-b rounded-t-3xl flex items-center justify-between ${
            darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold tracking-tight">
                    {metricTitle}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {language === 'bn' ? 'তারিখ ভিত্তিক বিস্তারিত লগ' : 'Date-by-Date Audit Ledger'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'bn' ? `নির্বাচিত সময়সীমা: ${startDate} হতে ${endDate}` : `Selected Range: ${startDate} to ${endDate}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metric Summary Bar */}
          <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 z-30 relative ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-blue-50/50 border-blue-100'
          }`}>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'মোট ফিল্টারকৃত পরিমাণ' : 'Computed Total for Period'}
              </p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {formatAmount(computedTotal || 0)}
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'গ্রাহক বা নোট খুঁজুন...' : 'Search customer or note...'}
                  className={`pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'তারিখ সীমা:' : 'Date Range:'}
                </span>
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onApply={(s, e, label) => {
                    if (onApplyDateRange) {
                      onApplyDateRange(s, e, label);
                    }
                  }}
                  darkMode={darkMode}
                  language={language}
                  align="right"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-semibold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    <th className="py-3.5 px-4">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                    <th className="py-3.5 px-4">{language === 'bn' ? 'রেকর্ড আইডি' : 'Record ID'}</th>
                    <th className="py-3.5 px-4">{language === 'bn' ? 'গ্রাহক / ডিলার নাম' : 'Customer / Dealer'}</th>
                    <th className="py-3.5 px-4">{language === 'bn' ? 'লেনদেনের ধরন' : 'Type'}</th>
                    <th className="py-3.5 px-4">{language === 'bn' ? 'বিবরণ / নোট' : 'Note / Details'}</th>
                    <th className="py-3.5 px-4 text-right">{language === 'bn' ? 'পরিমাণ' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {language === 'bn' ? 'এই সময়ের মধ্যে কোনো লেনদেন পাওয়া যায়নি।' : 'No matching transaction records found for this period.'}
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {tx.date}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                          {tx.id}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {tx.customerOrDealer || 'General Store Ledger'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            tx.type === 'sale' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                            tx.type === 'collection' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                            tx.type === 'expense' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {tx.note || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                          {formatAmount(tx.amount || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Footer */}
          <div className={`p-4 border-t flex items-center justify-between ${
            darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' ? `মোট ${filteredTransactions.length}টি এন্ট্রি দেখানো হচ্ছে` : `Showing ${filteredTransactions.length} transaction entries`}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close Details'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
