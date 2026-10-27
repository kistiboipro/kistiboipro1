'use client';

import React, { useState } from 'react';
import { Search, Clock } from 'lucide-react';
import { Language } from '@/lib/i18n';

interface DebtViewProps {
  darkMode: boolean;
  language: Language;
}

export function DebtView({ darkMode, language }: DebtViewProps) {
  const [search, setSearch] = useState('');
  const [debts, setDebts] = useState<any[]>([]);

  const filtered = debts.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Top Header Card matching screenshot */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          {language === 'bn' ? 'দেনা (Debt)' : 'Debt'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          No debt.
        </p>
      </div>

      {/* Search Input Bar matching screenshot */}
      <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === 'bn' ? 'নাম, মোবাইল বা ডিলার নম্বর...' : 'Name, mobile or dealer number...'}
          className="bg-transparent text-xs w-full focus:outline-none"
        />
      </div>

      {/* Content Area or Empty State matching screenshot */}
      {filtered.length === 0 ? (
        <div className={`p-16 rounded-3xl border text-center flex flex-col items-center justify-center space-y-3 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Clock className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              No debt.
            </h3>
            <p className="text-xs text-slate-400">
              All dealer dues are paid.
            </p>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <table className="w-full text-left text-sm">
            <thead className={`border-b text-xs font-semibold ${darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4 text-right">Due Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {filtered.map((item) => (
                <tr key={`debt-row-${item.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{item.name}</td>
                  <td className="p-4 text-slate-500">{item.phone}</td>
                  <td className="p-4 text-right font-bold text-rose-600">৳ {item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
