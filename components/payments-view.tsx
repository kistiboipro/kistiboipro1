'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Wallet, 
  Receipt as ReceiptIcon, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  X, 
  Check, 
  Smartphone, 
  CalendarDays,
  Building2,
  DollarSign,
  Filter,
  Eye,
  Trash2,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '@/lib/i18n';
import { DateRangePicker } from '@/components/date-range-picker';
import { InstallmentCalendarTracker } from '@/components/installment-calendar';

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cheque';
  collectorName: string;
  note?: string;
  avatarBg?: string;
}

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    receiptNo: 'REC-2026-001',
    customerName: 'Sabbir Bhuiyan',
    customerPhone: '01712345678',
    amount: 2500,
    paymentDate: '2026-10-22',
    paymentMethod: 'Cash',
    collectorName: 'Asadul Islam',
    note: '3rd installment for Singer LED TV 32"',
    avatarBg: 'bg-rose-500',
  },
  {
    id: 'pay-2',
    receiptNo: 'REC-2026-002',
    customerName: 'Rony',
    customerPhone: '01812345678',
    amount: 8500,
    paymentDate: '2026-10-22',
    paymentMethod: 'bKash',
    collectorName: 'Md. Rahim Mia',
    note: 'Monthly installment collection',
    avatarBg: 'bg-blue-600',
  },
  {
    id: 'pay-3',
    receiptNo: 'REC-2026-003',
    customerName: 'Karim Ullah',
    customerPhone: '01898765432',
    amount: 10000,
    paymentDate: '2026-10-18',
    paymentMethod: 'Nagad',
    collectorName: 'Asadul Islam',
    note: 'Advance down payment for Refrigerator',
    avatarBg: 'bg-amber-600',
  },
  {
    id: 'pay-4',
    receiptNo: 'REC-2026-004',
    customerName: 'Jamal Hossain',
    customerPhone: '01911223344',
    amount: 15000,
    paymentDate: '2026-10-18',
    paymentMethod: 'Bank Transfer',
    collectorName: 'Md. Rahim Mia',
    note: '2nd installment clear',
    avatarBg: 'bg-emerald-600',
  },
  {
    id: 'pay-5',
    receiptNo: 'REC-2026-005',
    customerName: 'Tanvir Ahmed',
    customerPhone: '01511223344',
    amount: 4000,
    paymentDate: '2026-10-04',
    paymentMethod: 'Cash',
    collectorName: 'Asadul Islam',
    note: 'Final installment payment',
    avatarBg: 'bg-purple-600',
  },
];

interface PaymentsViewProps {
  darkMode: boolean;
  language: Language;
}

export function PaymentsView({ darkMode, language }: PaymentsViewProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'calendar'>('history');
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Payment Form State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payDate, setPayDate] = useState('2026-10-25');
  const [payMethod, setPayMethod] = useState<PaymentRecord['paymentMethod']>('Cash');
  const [collectorName, setCollectorName] = useState('Md. Rahim Mia');
  const [payNote, setPayNote] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.customerName.toLowerCase().includes(search.toLowerCase()) ||
        p.customerPhone.includes(search) ||
        p.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
        p.collectorName.toLowerCase().includes(search.toLowerCase());

      const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
      const matchDate = p.paymentDate >= startDate && p.paymentDate <= endDate;

      return matchSearch && matchMethod && matchDate;
    });
  }, [payments, search, methodFilter, startDate, endDate]);

  // Financial Stats
  const totalCollectedInPeriod = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const todayCollected = useMemo(() => {
    return payments
      .filter((p) => p.paymentDate === '2026-10-25')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  // Submit New Payment
  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !payAmount || Number(payAmount) <= 0) return;

    const nextReceiptNum = payments.length + 1;
    const receiptCode = `REC-2026-${String(nextReceiptNum).padStart(3, '0')}`;

    const newRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      receiptNo: receiptCode,
      customerName: custName.trim(),
      customerPhone: custPhone.trim() || '01700000000',
      amount: Number(payAmount),
      paymentDate: payDate,
      paymentMethod: payMethod,
      collectorName: collectorName,
      note: payNote.trim() || 'Installment collection',
      avatarBg: 'bg-emerald-600',
    };

    setPayments((prev) => [newRecord, ...prev]);
    setShowAddModal(false);

    // Reset Form
    setCustName('');
    setCustPhone('');
    setPayAmount('');
    setPayNote('');

    showToast(
      language === 'bn'
        ? `${newRecord.customerName}-এর ৳${newRecord.amount.toLocaleString()} পেমেন্ট সফলভাবে এন্ট্রি হয়েছে!`
        : `Payment of ৳${newRecord.amount.toLocaleString()} recorded for ${newRecord.customerName}!`
    );
  };

  // Delete Payment Record
  const handleDeletePayment = (id: string, name: string) => {
    if (confirm(language === 'bn' ? `আপনি কি ${name}-এর পেমেন্ট রেকর্ডটি মুছে ফেলতে চান?` : `Are you sure you want to delete payment for ${name}?`)) {
      setPayments((prev) => prev.filter((p) => p.id !== id));
      showToast(language === 'bn' ? 'পেমেন্ট রেকর্ড মুছে ফেলা হয়েছে' : 'Payment record deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Card with Mode Switcher Tabs */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {language === 'bn' ? 'পেমেন্ট ও কিস্তি কালেকশন (Payment)' : 'Payment Collection & Dues'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'গ্রাহকদের কালেকশন জমা নিন, পেমেন্ট মানি রসিদ তৈরি করুন এবং ক্যালেন্ডার ট্র্যাকার দেখুন'
              : 'Record customer payments, issue money receipts, and track due dates'}
          </p>
        </div>

        {/* Action Buttons & Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {language === 'bn' ? 'নতুন পেমেন্ট গ্রহণ' : 'Record New Payment'}
          </button>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <ReceiptIcon className="w-4 h-4" />
              <span>{language === 'bn' ? 'পেমেন্ট তালিকা' : 'Collection History'}</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>{language === 'bn' ? 'ক্যালেন্ডার ট্র্যাকার' : 'Due Calendar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAYMENT COLLECTION HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'আজকের আদায় (Today)' : 'Collected Today'}
                </span>
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ৳ {todayCollected.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {language === 'bn' ? 'আজকের তারিখে কালেকশন' : 'Real-time daily collection'}
              </p>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'সময়সীমার মোট কালেকশন' : 'Total Collection in Period'}
                </span>
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <ReceiptIcon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                ৳ {totalCollectedInPeriod.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {filteredPayments.length} {language === 'bn' ? 'টি পেমেন্ট ট্রানজেকশন' : 'payment records'}
              </p>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'ডিজিটাল পেমেন্ট (bKash/Nagad)' : 'Digital Payments'}
                </span>
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                ৳ {payments.filter(p => p.paymentMethod === 'bKash' || p.paymentMethod === 'Nagad').reduce((s, p) => s + p.amount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {language === 'bn' ? 'মোবাইল ব্যাংকিং কালেকশন' : 'Mobile Banking Collections'}
              </p>
            </div>
          </div>

          {/* Search, Filter & Date Range Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className={`flex-1 px-3.5 py-2.5 rounded-xl border flex items-center gap-2.5 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={language === 'bn' ? 'গ্রাহকের নাম, ফোন, রসিদ নম্বর বা কালেক্টর...' : 'Search customer name, phone, receipt # or collector...'}
                className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center gap-2">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <option value="all">{language === 'bn' ? 'সকল মাধ্যম (All Methods)' : 'All Payment Methods'}</option>
                <option value="Cash">Cash (নগদ)</option>
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ)</option>
                <option value="Bank Transfer">Bank Transfer (ব্যাংক)</option>
              </select>

              {/* Date Range Picker */}
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onApply={(s, e) => {
                  setStartDate(s);
                  setEndDate(e);
                }}
                darkMode={darkMode}
                language={language}
                align="right"
              />
            </div>
          </div>

          {/* Payments Table */}
          {filteredPayments.length === 0 ? (
            <div className={`p-16 rounded-3xl border text-center flex flex-col items-center justify-center space-y-3 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <ReceiptIcon className="w-8 h-8 opacity-60" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {language === 'bn' ? 'কোনো পেমেন্ট পাওয়া যায়নি' : 'No payments found'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'ফিল্টারের অধীনে কোনো পেমেন্ট রেকর্ড নেই। নতুন পেমেন্ট গ্রহণ করুন।' : 'There are no payments matching this filter.'}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer mt-2"
              >
                + {language === 'bn' ? 'নতুন পেমেন্ট এন্ট্রি' : 'Record New Payment'}
              </button>
            </div>
          ) : (
            <div className={`rounded-2xl border overflow-hidden ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b font-bold ${
                      darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <th className="p-4">{language === 'bn' ? 'রসিদ #' : 'Receipt No.'}</th>
                      <th className="p-4">{language === 'bn' ? 'গ্রাহক ও মোবাইল' : 'Customer & Contact'}</th>
                      <th className="p-4">{language === 'bn' ? 'তারিখ' : 'Payment Date'}</th>
                      <th className="p-4">{language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Method'}</th>
                      <th className="p-4">{language === 'bn' ? 'আদায়কারী' : 'Collector'}</th>
                      <th className="p-4 text-right">{language === 'bn' ? 'পরিমাণ' : 'Amount'}</th>
                      <th className="p-4 text-right">{language === 'bn' ? 'রসিদ' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPayments.map((item) => (
                      <tr key={`pay-row-${item.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Receipt No */}
                        <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {item.receiptNo}
                        </td>

                        {/* Customer */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${item.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                              {item.customerName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{item.customerName}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{item.customerPhone}</p>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                          {item.paymentDate}
                        </td>

                        {/* Method Badge */}
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            item.paymentMethod === 'bKash'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : item.paymentMethod === 'Nagad'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : item.paymentMethod === 'Bank Transfer'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {item.paymentMethod}
                          </span>
                        </td>

                        {/* Collector */}
                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                          {item.collectorName}
                        </td>

                        {/* Amount */}
                        <td className="p-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          ৳ {item.amount.toLocaleString()}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(item)}
                            title="View Money Receipt"
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 cursor-pointer inline-flex items-center gap-1 font-bold text-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'রসিদ' : 'Receipt'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePayment(item.id, item.customerName)}
                            title="Delete Record"
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 cursor-pointer inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DUE CALENDAR TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <InstallmentCalendarTracker darkMode={darkMode} language={language} />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: RECORD NEW PAYMENT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-5 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base">
                    {language === 'bn' ? 'নতুন পেমেন্ট ও কালেকশন এন্ট্রি' : 'Record New Payment Collection'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPaymentSubmit} className="space-y-4 text-xs">
                {/* Customer Name */}
                <div>
                  <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Sabbir Bhuiyan"
                    required
                    className={`w-full px-4 py-3 rounded-xl border font-bold text-sm focus:outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                {/* Mobile Phone & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Phone'}
                    </label>
                    <input
                      type="tel"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className={`w-full px-4 py-2.5 rounded-xl border font-mono focus:outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'পেমেন্ট তারিখ' : 'Payment Date'}
                    </label>
                    <input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {/* Amount & Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'আদায়ের পরিমাণ (৳)' : 'Collected Amount (৳)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 2500"
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border font-black text-emerald-600 dark:text-emerald-400 focus:outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                    </label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value as any)}
                      className={`w-full px-4 py-2.5 rounded-xl border font-semibold focus:outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="Cash">Cash (নগদ)</option>
                      <option value="bKash">bKash (বিকাশ)</option>
                      <option value="Nagad">Nagad (নগদ)</option>
                      <option value="Bank Transfer">Bank Transfer (ব্যাংক)</option>
                      <option value="Cheque">Cheque (চেক)</option>
                    </select>
                  </div>
                </div>

                {/* Collector & Note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'কালেক্টরের নাম' : 'Collector Name'}
                    </label>
                    <input
                      type="text"
                      value={collectorName}
                      onChange={(e) => setCollectorName(e.target.value)}
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border font-semibold focus:outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'নোট / বিবরণ' : 'Notes / Details'}
                    </label>
                    <input
                      type="text"
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      placeholder="e.g. 3rd installment TV"
                      className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'পেমেন্ট সংরক্ষণ করুন' : 'Confirm & Save'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: PRINTABLE MONEY RECEIPT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-6 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <ReceiptIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-base">
                    {language === 'bn' ? 'অর্থ আদায় রসিদ (Money Receipt)' : 'Money Receipt'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Receipt Paper */}
              <div className={`p-6 rounded-2xl border space-y-4 font-sans ${
                darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-inner'
              }`}>
                {/* Store Header */}
                <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-800 space-y-0.5">
                  <h2 className="font-black text-lg text-blue-600 dark:text-blue-400">
                    বিসমিল্লাহ ইলেকট্রনিক্স অ্যান্ড ফার্নিচার
                  </h2>
                  <p className="text-[11px] text-slate-500">নিউ মার্কেট রোড, ঢাকা • মোবাইল: ০১৮১২-৩৪৫৬৭৮</p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase tracking-widest mt-1">
                    পেমেন্ট ক্যাশ মেমো / মানি রসিদ
                  </span>
                </div>

                {/* Receipt Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">{language === 'bn' ? 'রসিদ নম্বর:' : 'Receipt No:'}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedReceipt.receiptNo}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">{language === 'bn' ? 'তারিখ:' : 'Date:'}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedReceipt.paymentDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">{language === 'bn' ? 'গ্রাহকের নাম:' : 'Customer Name:'}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedReceipt.customerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{selectedReceipt.customerPhone}</span>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                      {language === 'bn' ? 'প্রাপ্ত টাকার পরিমাণ:' : 'Amount Received:'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {language === 'bn' ? `মাধ্যম: ${selectedReceipt.paymentMethod}` : `Method: ${selectedReceipt.paymentMethod}`}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ৳ {selectedReceipt.amount.toLocaleString()}
                  </span>
                </div>

                {/* Note & Collector */}
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 pt-1">
                  <p><span className="font-bold">{language === 'bn' ? 'বিবরণ:' : 'Note:'}</span> {selectedReceipt.note}</p>
                  <p><span className="font-bold">{language === 'bn' ? 'আদায়কারী স্টাফ:' : 'Collected By:'}</span> {selectedReceipt.collectorName}</p>
                </div>

                {/* Signatures */}
                <div className="pt-6 flex justify-between text-[10px] font-bold text-slate-400 border-t border-dashed border-slate-300 dark:border-slate-800">
                  <div className="text-center">
                    <div className="w-20 border-b border-slate-300 dark:border-slate-700 mb-1" />
                    <span>{language === 'bn' ? 'গ্রাহকের স্বাক্ষর' : "Customer's Sign"}</span>
                  </div>
                  <div className="text-center">
                    <div className="w-20 border-b border-slate-300 dark:border-slate-700 mb-1" />
                    <span>{language === 'bn' ? 'ক্যাশিয়ারের স্বাক্ষর' : "Cashier's Sign"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'রসিদ প্রিন্ট করুন' : 'Print Receipt'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
