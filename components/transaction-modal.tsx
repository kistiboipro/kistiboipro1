'use client';

import React, { useState } from 'react';
import { X, Check, PlusCircle } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: {
    type: 'sales' | 'collection' | 'downPayment' | 'expense';
    amount: number;
    customerName: string;
    note: string;
  }) => void;
  darkMode: boolean;
}

export function TransactionModal({ isOpen, onClose, onAddTransaction, darkMode }: TransactionModalProps) {
  const [type, setType] = useState<'sales' | 'collection' | 'downPayment' | 'expense'>('sales');
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('দয়া করে সঠিক পরিমাণ লিখুন।');
      return;
    }
    onAddTransaction({
      type,
      amount: numAmount,
      customerName: customerName || 'সাধারণ ক্রেতা',
      note: note || 'নরমাল এন্ট্রি'
    });
    setAmount('');
    setCustomerName('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl border p-6 animate-in fade-in zoom-in-95 duration-150 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">নতুন লেনদেন যোগ করুন (Add Transaction)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              লেনদেনের ধরণ (Type)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('sales')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'sales'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                বিক্রয় (Sales)
              </button>
              <button
                type="button"
                onClick={() => setType('collection')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'collection'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                লেকশন (Collection)
              </button>
              <button
                type="button"
                onClick={() => setType('downPayment')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'downPayment'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                ডাউন পেমেন্ট (Down Payment)
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'expense'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                খরচ (Expense)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              টাকার পরিমাণ (Amount in ৳)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="যেমন: ৫০০০"
              required
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              গ্রাহক বা ডিলারের নাম (Customer/Dealer Name)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="যেমন: মোঃ শরিফুল ইসলাম"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              বিবরণ / নোট (Note)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="যেমন: ফ্রিজ কিস্তির ৩য় কিস্তি"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-inherit">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" /> এন্ট্রি সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
