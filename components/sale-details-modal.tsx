'use client';

import React from 'react';
import { 
  ChevronLeft, 
  Printer, 
  Trash2 
} from 'lucide-react';
import { Language } from '@/lib/i18n';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  language: Language;
}

export function SaleDetailsModal({ isOpen, onClose, darkMode, language }: SaleDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border p-6 animate-in zoom-in-95 duration-150 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <ChevronLeft className="w-5 h-5" /> Sale details
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"><Printer className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"><Trash2 className="w-5 h-5 text-red-500" /></button>
          </div>
        </div>

        {/* Item Info */}
        <div className={`p-4 rounded-2xl mb-6 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <h3 className="text-lg font-bold">Led 32&quot;</h3>
          <p className="text-xs text-slate-500">Sale date: September 19, 2026</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Purchase price', value: '৳20,500', color: 'text-slate-900' },
            { label: 'Selling price', value: '৳30,000', color: 'text-purple-600' },
            { label: 'Profit', value: '৳9,500', color: 'text-emerald-600' },
          ].map((item) => (
            <div key={item.label} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">{item.label}</p>
              <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total price', value: '৳30,000', color: 'text-slate-900' },
            { label: 'Advance', value: '৳30,000', color: 'text-emerald-600' },
            { label: 'Outstanding', value: '৳0', color: 'text-red-500' },
          ].map((item) => (
            <div key={item.label} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">{item.label}</p>
              <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Installment Info */}
        <div className={`p-4 rounded-2xl border mb-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between py-2 border-b border-inherit text-sm"><span>Number of installments</span><span className="font-bold">0</span></div>
          <div className="flex justify-between py-2 border-b border-inherit text-sm"><span>Installment interval</span><span className="font-bold">Monthly</span></div>
          <div className="flex justify-between py-2 text-sm"><span>Amount per installment</span><span className="font-bold">৳0</span></div>
        </div>

        {/* Footer */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs text-slate-500 mb-2">Sabbir Bhuiyan</p>
          <button className="w-full py-3 rounded-xl border font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            View customer profile →
          </button>
        </div>
      </div>
    </div>
  );
}
