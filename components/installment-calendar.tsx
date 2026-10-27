'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  CalendarDays, 
  List, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Search, 
  Phone, 
  Send, 
  X, 
  Check, 
  BellRing,
  Wallet,
  Building2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Activity,
  User,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '@/lib/i18n';
import { updateInstallmentPaymentInSupabase, saveInstallmentRecordToSupabase } from '@/lib/supabase-service';

export interface InstallmentScheduleItem {
  id: string;
  customerId: string | number;
  customerName: string;
  customerPhone: string;
  productName: string;
  installmentNo: number;
  totalInstallments: number;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  status: 'overdue' | 'due_today' | 'upcoming' | 'paid';
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  paidDate?: string;
  paidAmount?: number;
  collectorName?: string;
  avatarBg?: string;
}

const INITIAL_SCHEDULE_ITEMS: InstallmentScheduleItem[] = [
  {
    id: 'inst-101',
    customerId: 1,
    customerName: 'Sabbir Bhuiyan',
    customerPhone: '01712345678',
    productName: 'Singer LED TV 32"',
    installmentNo: 3,
    totalInstallments: 12,
    dueDate: '2026-10-15',
    amount: 2500,
    status: 'overdue',
    lastPaymentDate: '2026-09-10',
    lastPaymentAmount: 2500,
    avatarBg: 'bg-rose-500',
  },
  {
    id: 'inst-102',
    customerId: 2,
    customerName: 'Karim Ullah',
    customerPhone: '01898765432',
    productName: 'Walton Refrigerator 220L',
    installmentNo: 5,
    totalInstallments: 10,
    dueDate: '2026-10-10',
    amount: 3500,
    status: 'overdue',
    lastPaymentDate: '2026-08-25',
    lastPaymentAmount: 3500,
    avatarBg: 'bg-amber-600',
  },
  {
    id: 'inst-103',
    customerId: 3,
    customerName: 'Rony',
    customerPhone: '01812345678',
    productName: 'Samsung Washing Machine',
    installmentNo: 2,
    totalInstallments: 6,
    dueDate: '2026-10-20',
    amount: 2000,
    status: 'overdue',
    lastPaymentDate: '2026-09-18',
    lastPaymentAmount: 2000,
    avatarBg: 'bg-blue-600',
  },
  {
    id: 'inst-104',
    customerId: 4,
    customerName: 'Jamal Hossain',
    customerPhone: '01911223344',
    productName: 'Realme 11 Pro Smartphone',
    installmentNo: 4,
    totalInstallments: 6,
    dueDate: '2026-10-25',
    amount: 1800,
    status: 'due_today',
    lastPaymentDate: '2026-09-25',
    lastPaymentAmount: 1800,
    avatarBg: 'bg-emerald-600',
  },
  {
    id: 'inst-105',
    customerId: 5,
    customerName: 'Rahim Sheikh',
    customerPhone: '01655443322',
    productName: 'BRB Ceiling Fan (2 Pcs)',
    installmentNo: 1,
    totalInstallments: 4,
    dueDate: '2026-10-25',
    amount: 1200,
    status: 'due_today',
    lastPaymentDate: '2026-09-25',
    lastPaymentAmount: 1200,
    avatarBg: 'bg-purple-600',
  },
  {
    id: 'inst-106',
    customerId: 6,
    customerName: 'Anowar Ali',
    customerPhone: '01799887766',
    productName: 'Panasonic Microwave Oven',
    installmentNo: 2,
    totalInstallments: 6,
    dueDate: '2026-10-28',
    amount: 2200,
    status: 'upcoming',
    lastPaymentDate: '2026-09-28',
    lastPaymentAmount: 2200,
    avatarBg: 'bg-indigo-600',
  },
  {
    id: 'inst-107',
    customerId: 7,
    customerName: 'Monir Hossain',
    customerPhone: '01844332211',
    productName: 'Gree AC 1.5 Ton Inverter',
    installmentNo: 1,
    totalInstallments: 12,
    dueDate: '2026-11-01',
    amount: 5000,
    status: 'upcoming',
    lastPaymentDate: '2026-10-01',
    lastPaymentAmount: 5000,
    avatarBg: 'bg-teal-600',
  },
  {
    id: 'inst-108',
    customerId: 8,
    customerName: 'Tanvir Ahmed',
    customerPhone: '01511223344',
    productName: 'HP Core i5 Laptop',
    installmentNo: 6,
    totalInstallments: 6,
    dueDate: '2026-10-05',
    amount: 4000,
    status: 'paid',
    lastPaymentDate: '2026-10-04',
    lastPaymentAmount: 4000,
    paidDate: '2026-10-04',
    paidAmount: 4000,
    collectorName: 'Asadul Islam',
    avatarBg: 'bg-emerald-600',
  },
  {
    id: 'inst-109',
    customerId: 9,
    customerName: 'Nusrat Jahan',
    customerPhone: '01722334455',
    productName: 'Kent Water Purifier',
    installmentNo: 2,
    totalInstallments: 5,
    dueDate: '2026-10-12',
    amount: 1500,
    status: 'paid',
    lastPaymentDate: '2026-10-12',
    lastPaymentAmount: 1500,
    paidDate: '2026-10-12',
    paidAmount: 1500,
    collectorName: 'Md. Rahim Mia',
    avatarBg: 'bg-rose-500',
  },
];

interface InstallmentCalendarProps {
  darkMode: boolean;
  language: Language;
}

export function InstallmentCalendarTracker({ darkMode, language }: InstallmentCalendarProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'table' | 'tracker'>('tracker');
  const [schedules, setSchedules] = useState<InstallmentScheduleItem[]>(INITIAL_SCHEDULE_ITEMS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'critical' | 'overdue' | 'due_today' | 'upcoming' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time System Reference Date (defaults to 2026-10-25)
  const [systemDate, setSystemDate] = useState<string>('2026-10-25');

  // Current calendar view month/year
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October
  
  // Selected date on calendar
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('2026-10-25');

  // Modals state
  const [collectModalItem, setCollectModalItem] = useState<InstallmentScheduleItem | null>(null);
  const [smsModalItem, setSmsModalItem] = useState<InstallmentScheduleItem | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectorNameInput, setCollectorNameInput] = useState<string>('Md. Rahim Mia');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // REAL-TIME MISSED PAYMENT CROSS-REFERENCING ANALYSIS ENGINE
  const missedPaymentAnalysis = useMemo(() => {
    const sysTime = new Date(systemDate).getTime();

    return schedules.map((item) => {
      const lastPayStr = item.paidDate || item.lastPaymentDate || item.dueDate;
      const lastPayTime = new Date(lastPayStr).getTime();
      const dueTime = new Date(item.dueDate).getTime();

      // Days since last payment received
      const daysSinceLastPay = Math.max(0, Math.floor((sysTime - lastPayTime) / (1000 * 60 * 60 * 24)));
      
      // Days past expected due date
      const daysPastDue = Math.max(0, Math.floor((sysTime - dueTime) / (1000 * 60 * 60 * 24)));

      let level: 'critical_defaulter' | 'grace_overdue' | 'due_today' | 'on_track' | 'paid_complete' = 'on_track';
      let missedMonths = 0;
      let riskTag: 'CRITICAL' | 'MEDIUM' | 'DUE TODAY' | 'LOW' | 'RESOLVED' = 'LOW';

      if (item.status === 'paid') {
        level = 'paid_complete';
        riskTag = 'RESOLVED';
      } else if (daysSinceLastPay >= 45 || daysPastDue >= 14) {
        level = 'critical_defaulter';
        missedMonths = Math.max(1, Math.floor(daysSinceLastPay / 30));
        riskTag = 'CRITICAL';
      } else if (daysSinceLastPay > 30 || daysPastDue > 0) {
        level = 'grace_overdue';
        missedMonths = 1;
        riskTag = 'MEDIUM';
      } else if (item.dueDate === systemDate) {
        level = 'due_today';
        riskTag = 'DUE TODAY';
      } else {
        level = 'on_track';
        riskTag = 'LOW';
      }

      return {
        ...item,
        lastPayStr,
        daysSinceLastPay,
        daysPastDue,
        level,
        missedMonths,
        riskTag,
      };
    });
  }, [schedules, systemDate]);

  // KPI Breakdown derived from real-time analysis
  const criticalDefaulters = useMemo(() => missedPaymentAnalysis.filter((i) => i.level === 'critical_defaulter'), [missedPaymentAnalysis]);
  const graceOverdues = useMemo(() => missedPaymentAnalysis.filter((i) => i.level === 'grace_overdue'), [missedPaymentAnalysis]);
  const dueTodayAnalyzed = useMemo(() => missedPaymentAnalysis.filter((i) => i.level === 'due_today'), [missedPaymentAnalysis]);
  const paidAnalyzed = useMemo(() => missedPaymentAnalysis.filter((i) => i.level === 'paid_complete'), [missedPaymentAnalysis]);

  const totalCriticalAmount = useMemo(() => criticalDefaulters.reduce((s, i) => s + i.amount, 0), [criticalDefaulters]);
  const totalOverdueAmount = useMemo(() => [...criticalDefaulters, ...graceOverdues].reduce((s, i) => s + i.amount, 0), [criticalDefaulters, graceOverdues]);

  // Filtered list for Tracker & Table view
  const filteredAnalysis = useMemo(() => {
    return missedPaymentAnalysis.filter((item) => {
      const matchSearch =
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerPhone.includes(searchQuery) ||
        item.productName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (filterStatus === 'critical') return item.level === 'critical_defaulter';
      if (filterStatus === 'overdue') return item.level === 'critical_defaulter' || item.level === 'grace_overdue';
      if (filterStatus === 'due_today') return item.level === 'due_today';
      if (filterStatus === 'upcoming') return item.level === 'on_track';
      if (filterStatus === 'paid') return item.level === 'paid_complete';

      return true;
    });
  }, [missedPaymentAnalysis, searchQuery, filterStatus]);

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = language === 'bn'
    ? ['জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const weekDayNames = language === 'bn'
    ? ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const getItemsForDate = (dateStr: string) => {
    return schedules.filter((s) => s.dueDate === dateStr);
  };

  // Confirm Payment Collection
  const handleConfirmCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalItem) return;

    const collectedVal = collectAmount || collectModalItem.amount;

    setSchedules((prev) =>
      prev.map((item) =>
        item.id === collectModalItem.id
          ? {
              ...item,
              status: 'paid',
              paidDate: systemDate,
              lastPaymentDate: systemDate,
              paidAmount: collectedVal,
              collectorName: collectorNameInput,
            }
          : item
      )
    );

    // Persist payment to Supabase database
    updateInstallmentPaymentInSupabase(collectModalItem.id, {
      paidDate: systemDate,
      paidAmount: collectedVal,
      collectorName: collectorNameInput,
    });

    showToast(
      language === 'bn'
        ? `${collectModalItem.customerName}-এর ৳${collectedVal} কিস্তি আদায় নিশ্চিত হয়েছে!`
        : `Payment of ৳${collectedVal} collected for ${collectModalItem.customerName}!`
    );

    setCollectModalItem(null);
  };

  const itemsOnSelectedDate = getItemsForDate(selectedCalendarDate);

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

      {/* REAL-TIME SYSTEM REFERENCE DATE CONTROL & DEFECT ALERT HEADER */}
      <div className={`p-5 rounded-3xl border space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/30 shrink-0 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  {language === 'bn' ? 'রিয়েল-টাইম কিস্তি খেলাপ ট্র্যাকার' : 'Real-Time Installment Status Tracker'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Live Cross-Reference Sync
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                {language === 'bn'
                  ? 'বর্তমান সিস্টেম তারিখের সাথে সর্বশেষ পেমেন্টের তারিখ ও চুক্তির মেয়াদ ক্রস-রেফারেন্স করে সরাসরি কিস্তি খেলাপিদের চিহ্নিত করা হচ্ছে।'
                  : 'Cross-referencing real-time system date against each customer\'s last recorded payment date and contract schedule to highlight missed installments.'}
              </p>
            </div>
          </div>

          {/* System Reference Date Control */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs flex items-center gap-3 shrink-0 self-start md:self-auto">
            <CalendarIcon className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {language === 'bn' ? 'সিস্টেম রেফারেন্স তারিখ:' : 'System Reference Date:'}
              </label>
              <input
                type="date"
                value={systemDate}
                onChange={(e) => setSystemDate(e.target.value)}
                className="bg-transparent font-mono font-bold text-white text-xs focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI STAT CARDS WITH REAL-TIME DEFAULTER COUNTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Critical Defaulters */}
        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'ক্রিটিক্যাল খেলাপি (>৪৫ দিন)' : 'Critical Defaulters (>45 Days)'}
            </span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {criticalDefaulters.length} {language === 'bn' ? 'জন গ্রাহক' : 'Customers'}
          </p>
          <p className="text-xs text-rose-500 mt-1 font-bold">
            ৳ {totalCriticalAmount.toLocaleString()} {language === 'bn' ? 'বাকি আটকে আছে' : 'missed dues'}
          </p>
        </div>

        {/* Card 2: Grace Period Overdues */}
        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'মোট মেয়াদোত্তীর্ণ কিস্তি' : 'Total Overdue Dues'}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            ৳ {totalOverdueAmount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {criticalDefaulters.length + graceOverdues.length} {language === 'bn' ? 'টি কিস্তি সময়মত আদায় হয়নি' : 'missed installments'}
          </p>
        </div>

        {/* Card 3: Due Today */}
        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'আজ প্রদেয় কিস্তি' : 'Due Today'}
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {dueTodayAnalyzed.length}
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {language === 'bn' ? 'আজকের কিস্তি প্রদানের শিডিউল' : 'scheduled for today'}
          </p>
        </div>

        {/* Card 4: Paid Complete */}
        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'পরিশোধিত সফল কিস্তি' : 'Paid & Up-to-Date'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {paidAnalyzed.length}
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {language === 'bn' ? 'সফল পেমেন্ট রেকর্ড' : 'cleared payments'}
          </p>
        </div>
      </div>

      {/* HEADER & TOGGLE CONTROLS (3 TABS) */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {language === 'bn' ? 'কিস্তি শিডিউল ও খেলাপি ট্র্যাকার' : 'Installment Schedule & Defaulter Tracker'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'ভিউ সিলেক্ট করুন: রিয়েল-টাইম খেলাপ ট্র্যাকার, ক্যালেন্ডার গ্রিড বা বিস্তারিত তালিকা'
              : 'Select view: Real-time missed payment tracker, visual calendar, or schedule table'}
          </p>
        </div>

        {/* 3 View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode('tracker')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'tracker'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{language === 'bn' ? 'খেলাপ ট্র্যাকার' : 'Missed Payment Tracker'}</span>
            {criticalDefaulters.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>{language === 'bn' ? 'ক্যালেন্ডার' : 'Calendar View'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            <span>{language === 'bn' ? 'তালিকা' : 'Table View'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: REAL-TIME MISSED PAYMENT TRACKER */}
      {/* ========================================================================= */}
      {viewMode === 'tracker' && (
        <div className="space-y-4">
          {/* Filter Pills & Search */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'খেলাপি গ্রাহকের নাম বা মোবাইল...' : 'Search defaulter name or phone...'}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none"
              />
            </div>

            {/* Filter Risk Pills */}
            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              {[
                { key: 'all', label: language === 'bn' ? 'সকল (All)' : 'All' },
                { key: 'critical', label: `🚨 ${language === 'bn' ? 'ক্রিটিক্যাল খেলাপ' : 'Critical Defaulters'} (${criticalDefaulters.length})` },
                { key: 'overdue', label: `⚠️ ${language === 'bn' ? 'মোট বাকি' : 'All Overdue'} (${criticalDefaulters.length + graceOverdues.length})` },
                { key: 'due_today', label: `⏰ ${language === 'bn' ? 'আজকের প্রদেয়' : 'Due Today'} (${dueTodayAnalyzed.length})` },
                { key: 'paid', label: `✅ ${language === 'bn' ? 'পরিশোধিত' : 'Paid'} (${paidAnalyzed.length})` },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setFilterStatus(pill.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    filterStatus === pill.key
                      ? 'bg-rose-600 text-white shadow-xs'
                      : darkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnalysis.map((item) => {
              const isCritical = item.level === 'critical_defaulter';
              const isGrace = item.level === 'grace_overdue';
              const isDueToday = item.level === 'due_today';
              const isPaid = item.level === 'paid_complete';

              return (
                <div
                  key={`track-${item.id}`}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden ${
                    isCritical
                      ? 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/30 dark:border-rose-900/80 ring-1 ring-rose-400/30'
                      : isGrace
                      ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-900/80'
                      : isDueToday
                      ? 'bg-blue-50/70 border-blue-300 dark:bg-blue-950/30 dark:border-blue-900/80'
                      : darkMode
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Top Header & Risk Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${item.avatarBg || 'bg-rose-600'} text-white flex items-center justify-center font-black text-sm shadow-md shrink-0`}>
                        {item.customerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {item.customerName}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {item.customerPhone}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                        : isGrace
                        ? 'bg-amber-500 text-white'
                        : isDueToday
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {item.riskTag}
                    </span>
                  </div>

                  {/* Product & Installment No */}
                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-inherit space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">{item.productName}</p>
                    <p className="text-[11px] text-slate-500">
                      {language === 'bn' ? 'কিস্তি নম্বর: ' : 'Installment #: '}
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.installmentNo} / {item.totalInstallments}</span>
                    </p>
                  </div>

                  {/* Cross-Referencing Audit Breakdown */}
                  <div className="space-y-2 text-xs border-t border-b border-inherit py-3">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-500">{language === 'bn' ? 'সর্বশেষ পেমেন্ট তারিখ:' : 'Last Payment Received:'}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{item.lastPayStr}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-500">{language === 'bn' ? 'সর্বশেষ পেমেন্ট হতে অতিবাহিত:' : 'Days Since Last Payment:'}</span>
                      <span className={`font-mono font-black ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.daysSinceLastPay} {language === 'bn' ? 'দিন আগের পেমেন্ট' : 'days ago'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-500">{language === 'bn' ? 'ধার্যকৃত কিস্তির তারিখ:' : 'Expected Due Date:'}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{item.dueDate}</span>
                    </div>

                    {isCritical && (
                      <div className="p-2 rounded-xl bg-rose-100/90 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[11px] font-bold flex items-center justify-between">
                        <span>🚨 {language === 'bn' ? 'খেলাপি কিস্তির সংখ্যা:' : 'Missed Installments:'}</span>
                        <span className="font-black text-rose-700 dark:text-rose-300">{item.missedMonths} {language === 'bn' ? 'টি কিস্তি মিসড' : 'Months Missed'}</span>
                      </div>
                    )}
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{language === 'bn' ? 'বাকি টাকার পরিমাণ:' : 'Due Amount:'}</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        ৳ {item.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isPaid && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCollectModalItem(item);
                              setCollectAmount(item.amount);
                            }}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'আদায়' : 'Collect'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSmsModalItem(item)}
                            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer"
                            title="Send SMS"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {isPaid && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Paid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CALENDAR VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar Grid */}
          <div className={`lg:col-span-2 p-6 rounded-3xl border space-y-5 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{monthNames[currentMonth]} {currentYear}</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setCurrentMonth(9);
                    setCurrentYear(2026);
                    setSelectedCalendarDate('2026-10-25');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 cursor-pointer"
                >
                  {language === 'bn' ? 'আজ' : 'Today'}
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
              {weekDayNames.map((day) => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr gap-2 sm:gap-2.5">
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="min-h-[84px] sm:min-h-[96px] rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 opacity-30" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                const formattedMonth = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
                const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

                const dayItems = getItemsForDate(dateStr);
                const isSelected = selectedCalendarDate === dateStr;
                const isToday = dateStr === '2026-10-25';

                const hasOverdue = dayItems.some((i) => i.status === 'overdue');
                const hasDueToday = dayItems.some((i) => i.status === 'due_today');

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => setSelectedCalendarDate(dateStr)}
                    className={`min-h-[84px] sm:min-h-[96px] p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/40 shadow-sm'
                        : isToday
                        ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                        : darkMode
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        isToday
                          ? 'bg-amber-500 text-white font-extrabold'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {dayNum}
                      </span>

                      {dayItems.length > 0 && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          hasOverdue
                            ? 'bg-rose-500 text-white'
                            : hasDueToday
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}>
                          {dayItems.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayItems.slice(0, 2).map((item) => (
                        <div
                          key={`mini-${item.id}`}
                          className={`text-[10px] font-bold truncate px-1.5 py-0.5 rounded ${
                            item.status === 'overdue'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : item.status === 'due_today'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : item.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          ৳{item.amount} • {item.customerName.split(' ')[0]}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Detail Side Panel */}
          <div className={`p-6 rounded-3xl border space-y-5 flex flex-col justify-between ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {language === 'bn' ? 'তারিখের কিস্তি শিডিউল' : 'Date Schedule'}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                    {selectedCalendarDate}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                  {itemsOnSelectedDate.length} {language === 'bn' ? 'টি এন্ট্রি' : 'Items'}
                </span>
              </div>

              {itemsOnSelectedDate.length === 0 ? (
                <div className="py-12 text-center space-y-2 text-slate-400">
                  <CalendarIcon className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-xs font-semibold">
                    {language === 'bn' ? 'এই তারিখে কোনো কিস্তির শিডিউল নেই' : 'No installments scheduled on this date'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {itemsOnSelectedDate.map((item) => (
                    <div
                      key={`side-${item.id}`}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.customerName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {item.productName} ({item.installmentNo}/{item.totalInstallments})
                          </p>
                        </div>
                        <span className="text-xs font-bold text-blue-600">
                          ৳ {item.amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCollectModalItem(item);
                            setCollectAmount(item.amount);
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                        >
                          Collect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: TABLE VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className={`rounded-2xl border overflow-hidden ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-bold ${
                  darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {missedPaymentAnalysis.map((item) => (
                  <tr key={`table-${item.id}`} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold">{item.customerName}</td>
                    <td className="py-3.5 px-4">{item.productName}</td>
                    <td className="py-3.5 px-4 font-mono">{item.dueDate}</td>
                    <td className="py-3.5 px-4 text-right font-black">৳ {item.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold">{item.riskTag}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setCollectModalItem(item);
                          setCollectAmount(item.amount);
                        }}
                        className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                      >
                        Collect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: RECORD COLLECTION PAYMENT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {collectModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-5 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base">
                    {language === 'bn' ? 'কিস্তি আদায় এন্ট্রি' : 'Collect Installment Payment'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCollectModalItem(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                  <span>{collectModalItem.customerName}</span>
                  <span className="text-blue-600 dark:text-blue-400">{collectModalItem.customerPhone}</span>
                </div>
                <p className="text-slate-500">
                  {collectModalItem.productName} ({collectModalItem.installmentNo}/{collectModalItem.totalInstallments})
                </p>
                <p className="text-slate-500">
                  {language === 'bn' ? 'নির্ধারিত তারিখ: ' : 'Due Date: '} <span className="font-mono font-semibold">{collectModalItem.dueDate}</span>
                </p>
              </div>

              <form onSubmit={handleConfirmCollection} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'আদায়কৃত টাকার পরিমাণ (৳)' : 'Collected Amount (৳)'}
                  </label>
                  <input
                    type="number"
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(Number(e.target.value))}
                    required
                    className={`w-full px-4 py-3 rounded-xl border font-bold text-lg text-emerald-600 dark:text-emerald-400 focus:outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'কালেক্টরের নাম' : 'Collector Name'}
                  </label>
                  <input
                    type="text"
                    value={collectorNameInput}
                    onChange={(e) => setCollectorNameInput(e.target.value)}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCollectModalItem(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'আদায় নিশ্চিত করুন' : 'Confirm Payment'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: URGENCY REMINDER SMS */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {smsModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-5 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-rose-600" />
                  <h3 className="font-extrabold text-base">
                    {language === 'bn' ? 'জরুরি কিস্তি খেলাপ তাগাদা বার্তা' : 'Urgent Missed Payment SMS'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsModalItem(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs space-y-1">
                <p className="font-bold text-rose-900 dark:text-rose-200">{smsModalItem.customerName}</p>
                <p className="text-rose-600 font-mono font-semibold">{smsModalItem.customerPhone}</p>
              </div>

              <div>
                <label className="block font-bold mb-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'জরুরি বার্তা টেক্সট:' : 'Urgent Notice Preview:'}
                </label>
                <textarea
                  rows={4}
                  readOnly
                  value={
                    language === 'bn'
                      ? `[জরুরি বার্তা] শ্রদ্ধাভাজন ${smsModalItem.customerName}, বিসমিল্লাহ ইলেকট্রনিক্স-এ আপনার ${smsModalItem.productName}-এর কিস্তি ৳${smsModalItem.amount.toLocaleString()} সময়মত জমা হয়নি। সিস্টেম রেকর্ড অনুযায়ী আপনার সর্বশেষ পেমেন্ট ছিল ${smsModalItem.lastPaymentDate || 'পূর্ববর্তী মাসে'}। অনুগ্রহ করে আজই যোগাযোগের মাধ্যমে কিস্তি পরিশোধ করুন।`
                      : `[URGENT] Dear ${smsModalItem.customerName}, your installment of ৳${smsModalItem.amount.toLocaleString()} for ${smsModalItem.productName} is overdue. According to system records, your last payment was on ${smsModalItem.lastPaymentDate || 'last month'}. Please remit payment today.`
                  }
                  className={`w-full p-3.5 rounded-2xl border text-xs leading-relaxed resize-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSmsModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(
                      language === 'bn'
                        ? `${smsModalItem.customerName} (${smsModalItem.customerPhone})-কে জরুরি খেলাপ নোটিশ পাঠানো হয়েছে!`
                        : `Urgent missed payment notice sent to ${smsModalItem.customerName}!`
                    );
                    setSmsModalItem(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'বার্তা পাঠান' : 'Send Urgency Notice'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
