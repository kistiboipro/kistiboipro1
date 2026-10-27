'use client';

import React, { useState } from 'react';
import { Search, Wallet } from 'lucide-react';
import { Language } from '@/lib/i18n';
import { DateRangePicker } from '@/components/date-range-picker';

interface PayoutViewProps {
  darkMode: boolean;
  language: Language;
}

export function PayoutView({ darkMode, language }: PayoutViewProps) {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [payouts, setPayouts] = useState<any[]>([]);

  const filtered = payouts.filter(p => p.dealer?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Top Header Card matching screenshot */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          {language === 'bn' ? 'পেআউট (Payout)' : 'Payout'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {payouts.length}
        </p>
      </div>

      {/* Search & Date Filter Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className={`flex-1 px-3.5 py-2.5 rounded-xl border flex items-center gap-2.5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'bn' ? 'ডিলারের নাম দিয়ে খুঁজুন...' : 'Search by dealer name'}
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
            <Wallet className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              No payout found.
            </h3>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <table className="w-full text-left text-sm">
            <thead className={`border-b text-xs font-semibold ${darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <tr>
                <th className="p-4">Dealer</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {filtered.map((item) => (
                <tr key={`payout-row-${item.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{item.dealer}</td>
                  <td className="p-4 text-slate-500">{item.date}</td>
                  <td className="p-4 text-right font-bold text-emerald-600">৳ {item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
