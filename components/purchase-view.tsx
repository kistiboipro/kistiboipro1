'use client';

import React, { useState } from 'react';
import { Plus, Search, ClipboardList, Check, X } from 'lucide-react';
import { Language } from '@/lib/i18n';
import { DateRangePicker } from '@/components/date-range-picker';

interface PurchaseViewProps {
  darkMode: boolean;
  language: Language;
}

export function PurchaseView({ darkMode, language }: PurchaseViewProps) {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dealerName, setDealerName] = useState('');
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState('');
  
  const [purchases, setPurchases] = useState<any[]>([]);

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerName || !amount) return;
    setPurchases((prev) => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map(p => p.id)) + 1 : 1,
        dealer: dealerName,
        product: productName || 'Electronics',
        amount: parseFloat(amount) || 0,
        date: '2026-10-22'
      }
    ]);
    setDealerName('');
    setProductName('');
    setAmount('');
    setIsModalOpen(false);
  };

  const filtered = purchases.filter(p => p.dealer.toLowerCase().includes(search.toLowerCase()) || p.product.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Top Header Card matching screenshot */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          {language === 'bn' ? 'ক্রয় (Purchase)' : 'Purchase'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {purchases.length}
        </p>
      </div>

      {/* Action Button Bar matching screenshot */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> {language === 'bn' ? 'নতুন ক্রয় (New purchase)' : 'New purchase'}
        </button>
      </div>

      {/* Search & Date Filter Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className={`flex-1 px-3.5 py-2.5 rounded-xl border flex items-center gap-2.5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'bn' ? 'ডিলার বা পণ্যের নাম...' : 'Dealer or product name...'}
            className="bg-transparent text-xs w-full focus:outline-none"
          />
        </div>

        {/* Date position set at right center */}
        <div className="flex items-center justify-end">
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

      {/* Content Area or Empty State matching screenshot */}
      {filtered.length === 0 ? (
        <div className={`p-16 rounded-3xl border text-center flex flex-col items-center justify-center space-y-3 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <ClipboardList className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              No results found.
            </h3>
            <p className="text-xs text-slate-400">
              There are no purchases in this filter.
            </p>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <table className="w-full text-left text-sm">
            <thead className={`border-b text-xs font-semibold ${darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <tr>
                <th className="p-4">Dealer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {filtered.map((item) => (
                <tr key={`purchase-row-${item.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{item.dealer}</td>
                  <td className="p-4 text-slate-500">{item.product}</td>
                  <td className="p-4 text-slate-500">{item.date}</td>
                  <td className="p-4 text-right font-bold text-sky-600">৳ {item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-6 animate-in fade-in zoom-in-95 duration-150 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base">New Purchase</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Dealer Name</label>
                <input
                  type="text"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  placeholder="e.g. Acme Electronics"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Product / Item</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Refrigerators"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Total Amount (৳)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
