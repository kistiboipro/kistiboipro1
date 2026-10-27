'use client';

import React from 'react';
import { FolderSearch, Plus, Sparkles } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';

interface TransactionEmptyStateProps {
  onLoadDemoData: () => void;
  onOpenAddModal: () => void;
  darkMode: boolean;
  language: Language;
}

export function TransactionEmptyState({ onLoadDemoData, onOpenAddModal, darkMode, language }: TransactionEmptyStateProps) {
  const t = translations[language];

  return (
    <div className={`p-12 rounded-3xl border text-center my-6 flex flex-col items-center justify-center space-y-4 ${
      darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
        <FolderSearch className="w-8 h-8" />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {t.emptyTitle}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.emptyDesc}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={onLoadDemoData}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" /> {t.loadDemoData}
        </button>
        <button
          onClick={onOpenAddModal}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-colors ${
            darkMode 
              ? 'border-slate-700 hover:bg-slate-800 text-slate-200' 
              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <Plus className="w-4 h-4 text-blue-600" /> {t.addNewTransaction}
        </button>
      </div>
    </div>
  );
}
