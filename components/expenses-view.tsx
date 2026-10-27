'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Receipt,
  ChevronDown,
  Calendar,
  Check,
  Edit2,
  Trash2,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { Language } from '@/lib/i18n';
import { DateRangePicker } from '@/components/date-range-picker';
import {
  ExpenseRecord,
  validateExpenseData,
  filterExpenses,
  calculateTotalExpenses,
} from '@/lib/expense-service';
import { saveExpenseToSupabase } from '@/lib/supabase-service';

interface ExpensesViewProps {
  darkMode: boolean;
  language: Language;
}

const EXPENSE_CATEGORIES = [
  'salary',
  'rent',
  'electricity',
  'shop transport',
  'entertainment',
  'wifi & internet',
  'tea & snacks',
  'maintenance',
  'advertising',
  'general utility',
];

const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 1,
    title: 'Shop rent October',
    category: 'rent',
    amount: 15000,
    date: '2026-10-01',
    notes: 'Paid via bank transfer for showroom premise',
  },
  {
    id: 2,
    title: 'Electricity bill October',
    category: 'electricity',
    amount: 3500,
    date: '2026-10-15',
    notes: 'DESCO commercial bill',
  },
  {
    id: 3,
    title: 'Shop transport & loading',
    category: 'shop transport',
    amount: 1200,
    date: '2026-10-22',
    notes: 'Transport for refrigerator batch delivery',
  },
  {
    id: 4,
    title: 'Staff lunch & tea expenses',
    category: 'tea & snacks',
    amount: 650,
    date: '2026-10-22',
    notes: 'Weekly refreshment for 4 sales executives',
  },
];

export function ExpensesView({ darkMode, language }: ExpensesViewProps) {
  // Navigation view: 'list' | 'add'
  const [view, setView] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');

  // Expense list state
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  // Form states matching screenshot: image_7776b406.png
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-10-23');
  const [notes, setNotes] = useState('');

  // Validation errors & notification toast
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setAmount('');
    setDate('2026-10-23');
    setNotes('');
    setEditingExpense(null);
    setFormErrors({});
    setIsCategoryOpen(false);
  };

  const handleOpenAddForm = () => {
    resetForm();
    setView('add');
  };

  const handleOpenEditForm = (item: ExpenseRecord) => {
    setEditingExpense(item);
    setTitle(item.title);
    setCategory(item.category || '');
    setAmount(String(item.amount));
    setDate(item.date);
    setNotes(item.notes || '');
    setFormErrors({});
    setIsCategoryOpen(false);
    setView('add');
  };

  const handleCancel = () => {
    resetForm();
    setView('list');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateExpenseData({
      title,
      amount,
      date,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const parsedAmount = parseFloat(amount) || 0;

      if (editingExpense) {
        // Update existing
        setExpenses((prev) =>
          prev.map((item) =>
            item.id === editingExpense.id
              ? {
                  ...item,
                  title: title.trim(),
                  category: category.trim() || 'general',
                  amount: parsedAmount,
                  date: date || '2026-10-23',
                  notes: notes.trim(),
                }
              : item
          )
        );
        showToast(
          language === 'bn' ? 'খরচ সফলভাবে আপডেট করা হয়েছে!' : 'Expense updated successfully!'
        );
      } else {
        // Add new expense
        const nextId = expenses.length > 0 ? Math.max(...expenses.map((e) => Number(e.id) || 0)) + 1 : 1;
        const newRecord: ExpenseRecord = {
          id: nextId,
          title: title.trim(),
          category: category.trim() || 'general',
          amount: parsedAmount,
          date: date || '2026-10-23',
          notes: notes.trim(),
        };
        setExpenses((prev) => [newRecord, ...prev]);

        // Persist to Supabase
        saveExpenseToSupabase(newRecord);
        showToast(
          language === 'bn' ? 'নতুন খরচ সফলভাবে যোগ করা হয়েছে!' : 'Expense added successfully!'
        );
      }

    resetForm();
    setView('list');
  };

  const handleDeleteExpense = (id: string | number, expenseTitle: string) => {
    if (confirm(`Are you sure you want to delete "${expenseTitle}"?`)) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast('Expense removed.');
    }
  };

  const filtered = filterExpenses(expenses, search, startDate, endDate);
  const totalAmount = calculateTotalExpenses(filtered);

  // If view is 'add', render the exact form matching image_7776b406.png
  if (view === 'add') {
    return (
      <div className="max-w-3xl mx-auto py-2 px-1 sm:px-4">
        {/* Breadcrumb Navigation matching screenshot: Expense / New Expense */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-5">
          <button
            type="button"
            onClick={handleCancel}
            className="hover:text-blue-600 transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            {language === 'bn' ? 'খরচ' : 'Expense'}
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">
            {editingExpense
              ? language === 'bn'
                ? 'খরচ এডিট'
                : 'Edit Expense'
              : language === 'bn'
              ? 'নতুন খরচ'
              : 'New Expense'}
          </span>
        </div>

        {/* Title & Subtitle matching screenshot */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {editingExpense
              ? language === 'bn'
                ? 'খরচ এডিট করুন'
                : 'Edit expense'
              : language === 'bn'
              ? 'নতুন খরচ যোগ করুন'
              : 'Add new expense'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'খরচের তথ্য পূরণ করুন এবং যুক্ত করুন।'
              : 'Fill in the expense information and add it.'}
          </p>
        </div>

        {/* Main Form Container Card matching screenshot */}
        <div
          className={`border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs transition-colors ${
            darkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200/90 text-slate-900'
          }`}
        >
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* 1. Title * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'শিরোনাম' : 'Title'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formErrors.title) {
                    setFormErrors((prev) => ({ ...prev, title: '' }));
                  }
                }}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: অফিস ভাড়া জুলাই'
                    : 'For example: Office rent July'
                }
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  formErrors.title
                    ? 'border-red-400 bg-red-50/20'
                    : darkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
              {formErrors.title && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.title}
                </p>
              )}
            </div>

            {/* 2. Categories with dropdown selector */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'ক্যাটেগরি' : 'Categories'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onFocus={() => setIsCategoryOpen(true)}
                  placeholder={
                    language === 'bn'
                      ? 'যেমন: বেতন, ভাড়া, বিদ্যুৎ...'
                      : 'For example: salary, rent, electricity...'
                  }
                  className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isCategoryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Suggestions dropdown */}
              {isCategoryOpen && (
                <div
                  className={`absolute z-30 left-0 right-0 mt-1.5 border rounded-xl shadow-lg py-1.5 max-h-52 overflow-y-auto ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {language === 'bn' ? 'সাধারণ ক্যাটেগরি' : 'Common Categories'}
                  </div>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={`expense-cat-${cat}`}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        category.toLowerCase() === cat.toLowerCase()
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <span className="capitalize">{cat}</span>
                      {category.toLowerCase() === cat.toLowerCase() && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Amount (৳) * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'পরিমাণ (৳)' : 'Amount (৳)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (formErrors.amount) {
                    setFormErrors((prev) => ({ ...prev, amount: '' }));
                  }
                }}
                placeholder="0.00"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  formErrors.amount
                    ? 'border-red-400 bg-red-50/20'
                    : darkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
              {formErrors.amount && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.amount}
                </p>
              )}
            </div>

            {/* 4. Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'তারিখ' : 'Date'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* 5. Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'নোট' : 'Notes'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'অতিরিক্ত তথ্য লিখুন...'
                    : 'Additional information...'
                }
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* 6. Action Buttons matching screenshot */}
            <div className="space-y-3 pt-3">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#1a68ff] hover:bg-blue-600 active:bg-blue-700 text-white shadow-sm transition-all text-center cursor-pointer"
              >
                {editingExpense
                  ? language === 'bn'
                    ? 'খরচ আপডেট করুন'
                    : 'Update expense'
                  : language === 'bn'
                  ? 'খরচ যোগ করুন'
                  : 'Add expenses'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm border transition-all text-center cursor-pointer ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                }`}
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Expense List View
  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Card matching screenshot: Expense / 0 */}
      <div
        className={`p-5 rounded-2xl border flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {language === 'bn' ? 'খরচ' : 'Expense'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {expenses.length} {language === 'bn' ? 'টি খরচ এন্ট্রি' : 'entries'} •{' '}
            {language === 'bn' ? 'মোট:' : 'Total:'} ৳ {totalAmount.toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Total Expenses</span>
          <span className="font-extrabold text-lg text-amber-600 dark:text-amber-500">
            ৳ {totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="space-y-3">
        {/* New Expense button triggers the exact Add new expense view */}
        <button
          onClick={handleOpenAddForm}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1a68ff] hover:bg-blue-600 text-white shadow-xs flex items-center justify-center gap-2 w-fit transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {language === 'bn' ? 'নতুন খরচ' : 'New Expense'}
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div
            className={`flex-1 sm:w-80 px-3.5 py-2.5 rounded-xl border flex items-center gap-2.5 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'bn' ? 'খরচ খুঁজুন...' : 'Find expenses...'}
              className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

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
      </div>

      {/* Expense List */}
      {filtered.length === 0 ? (
        <div
          className={`p-16 rounded-3xl border text-center flex flex-col items-center justify-center space-y-3 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Receipt className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              No expenses found.
            </h3>
            <p className="text-xs text-slate-400">
              There is no expense in this filter.
            </p>
          </div>
          <button
            onClick={handleOpenAddForm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1a68ff] hover:bg-blue-600 text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            {language === 'bn' ? 'নতুন খরচ যোগ করুন' : 'Add new expense'}
          </button>
        </div>
      ) : (
        <div
          className={`rounded-2xl border overflow-hidden ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <table className="w-full text-left text-sm">
            <thead
              className={`border-b text-xs font-semibold ${
                darkMode
                  ? 'bg-slate-800/80 border-slate-800 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {filtered.map((item) => (
                <tr
                  key={`expense-${item.id}`}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.notes}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                      {item.category || 'General'}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-400">{item.date}</td>
                  <td className="p-4 text-right font-bold text-amber-600 dark:text-amber-500">
                    ৳ {item.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditForm(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(item.id, item.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count */}
      <div className="text-center py-4 text-xs text-slate-400 font-medium">
        {language === 'bn'
          ? `মোট ${filtered.length} টি খরচ দেখানো হচ্ছে`
          : `Showing ${filtered.length} expense(s)`}
      </div>
    </div>
  );
}
