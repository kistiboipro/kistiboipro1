'use client';

import React, { useState } from 'react';
import { Plus, Search, Handshake, Check, X } from 'lucide-react';
import { Language } from '@/lib/i18n';

interface DealerViewProps {
  darkMode: boolean;
  language: Language;
}

export function DealerView({ darkMode, language }: DealerViewProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [dealers, setDealers] = useState<any[]>([]);

  const handleAddDealer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setDealers((prev) => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map(d => d.id)) + 1 : 1,
        name,
        phone: phone || '01800-000000',
        debt: 0
      }
    ]);
    setName('');
    setPhone('');
    setIsModalOpen(false);
  };

  const filtered = dealers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search));

  return (
    <div className="space-y-6">
      {/* Top Header Card matching screenshot */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          {language === 'bn' ? 'ডিলার (Dealer)' : 'Dealer'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {dealers.length} {language === 'bn' ? 'জন মানুষ' : 'people'}
        </p>
      </div>

      {/* Action Buttons Bar matching screenshot */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> {language === 'bn' ? 'নতুন ডিলার' : 'New dealer'}
        </button>
        <button
          onClick={() => alert('New Purchase')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> {language === 'bn' ? 'নতুন ক্রয় (New purchase)' : 'New purchase'}
        </button>
      </div>

      {/* Search Input Bar */}
      <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === 'bn' ? 'নাম, মোবাইল বা ডিলার নম্বর...' : 'Search by name, mobile or dealer number'}
          className="bg-transparent text-xs w-full focus:outline-none"
        />
      </div>

      {/* Filter Chips & Sort Bar matching screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['All', 'There is debt.', 'Refined', 'No purchase'].map((item) => (
            <button
              key={`dealer-filter-${item}`}
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                filter === item 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border text-slate-600 hover:bg-slate-50')
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <button className={`px-4 py-2 rounded-xl border text-xs font-medium ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
          New before
        </button>
      </div>

      {/* Content Area or Empty State matching screenshot */}
      {filtered.length === 0 ? (
        <div className={`p-16 rounded-3xl border text-center flex flex-col items-center justify-center space-y-3 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Handshake className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              No dealers found.
            </h3>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <table className="w-full text-left text-sm">
            <thead className={`border-b text-xs font-semibold ${darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <tr>
                <th className="p-4">Dealer Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4 text-right">Debt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {filtered.map((item) => (
                <tr key={`dealer-row-${item.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{item.name}</td>
                  <td className="p-4 text-slate-500">{item.phone}</td>
                  <td className="p-4 text-right font-bold text-rose-600">৳ {item.debt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Dealer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-6 animate-in fade-in zoom-in-95 duration-150 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base">New Dealer</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddDealer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Dealer Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Electronics"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01800-000000"
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
                  <Check className="w-4 h-4" /> Save Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
