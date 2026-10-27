'use client';

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Wallet, 
  Banknote, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Tag, 
  PackageCheck,
  CheckCircle2,
  Coins
} from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { TransactionRecord } from '@/lib/transaction-service';
import { MetricDetailModal } from '@/components/metric-detail-modal';

interface SummaryCardsProps {
  data: {
    totalSales: number;
    totalCollection: number;
    downPayment: number;
    totalDue: number;
    totalExpenses: number;
    netProfit: number;
    cashSales: number;
    totalDiscount: number;
    totalPurchase: number;
    totalPaid: number;
    totalPayable: number;
    cashInHand: number;
  };
  darkMode: boolean;
  language: Language;
  hasData: boolean;
  transactions?: TransactionRecord[];
  startDate?: string;
  endDate?: string;
  onApplyDateRange?: (start: string, end: string, label?: string) => void;
}

export function SummaryCards({ 
  data, 
  darkMode, 
  language, 
  hasData, 
  transactions = [], 
  startDate = '2026-09-22', 
  endDate = '2026-10-22',
  onApplyDateRange,
}: SummaryCardsProps) {
  const t = translations[language];

  const [activeModalMetric, setActiveModalMetric] = useState<{
    type: 'totalSales' | 'totalCollection' | 'downPayment' | 'totalDue' | 'totalExpenses' | 'netProfit' | 'cashSales' | 'totalDiscount' | 'totalPurchase' | 'totalPaid' | 'totalPayable' | 'cashInHand';
    title: string;
    amount: string;
  } | null>(null);

  const formatAmount = (val: number) => {
    const prefix = language === 'bn' ? '৳' : 'Tk ';
    return `${prefix}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const mainCardsRow1 = [
    {
      type: 'totalSales' as const,
      title: t.totalSales,
      subtitle: t.totalSalesSub,
      amount: formatAmount(data.totalSales),
      icon: ShoppingCart,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50' : 'bg-[#f4f7fc] border-[#e2e8f0] hover:border-blue-300',
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      textAmountColor: 'text-[#1e293b] dark:text-slate-100'
    },
    {
      type: 'totalCollection' as const,
      title: t.totalCollection,
      subtitle: t.totalCollectionSub,
      amount: formatAmount(data.totalCollection),
      icon: Wallet,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50' : 'bg-[#f0fdf4] border-[#dcfce7] hover:border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
      textAmountColor: 'text-emerald-700 dark:text-emerald-400'
    },
    {
      type: 'downPayment' as const,
      title: t.downPayment,
      subtitle: t.downPaymentSub,
      amount: formatAmount(data.downPayment),
      icon: Banknote,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-purple-500/50' : 'bg-[#f8f7fc] border-[#ede9fe] hover:border-purple-300',
      iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
      textAmountColor: 'text-purple-700 dark:text-purple-300'
    },
    {
      type: 'totalDue' as const,
      title: t.totalRemaining,
      subtitle: t.totalRemainingSub,
      amount: formatAmount(data.totalDue),
      icon: AlertCircle,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-rose-500/50' : 'bg-[#fef2f2] border-[#fee2e2] hover:border-rose-300',
      iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
      textAmountColor: 'text-[#7f1d1d] dark:text-rose-300'
    },
  ];

  const mainCardsRow2 = [
    {
      type: 'totalExpenses' as const,
      title: t.totalCost,
      subtitle: t.totalCostSub,
      amount: formatAmount(data.totalExpenses),
      icon: FileText,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50' : 'bg-[#fffbeb] border-[#fef3c7] hover:border-amber-300',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
      textAmountColor: 'text-[#78350f] dark:text-amber-300'
    },
    {
      type: 'netProfit' as const,
      title: t.netProfit,
      subtitle: t.netProfitSub,
      amount: formatAmount(data.netProfit),
      icon: TrendingUp,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-[#f5f3ff] border-[#ede9fe] hover:border-indigo-300',
      iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
      textAmountColor: 'text-indigo-800 dark:text-indigo-300'
    },
    {
      type: 'cashSales' as const,
      title: t.retail,
      subtitle: t.retailSub,
      amount: formatAmount(data.cashSales),
      icon: Tag,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-teal-500/50' : 'bg-[#f0fdf4] border-[#dcfce7] hover:border-teal-300',
      iconBg: 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
      textAmountColor: 'text-teal-800 dark:text-teal-300'
    },
    {
      type: 'totalDiscount' as const,
      title: t.totalDiscount,
      subtitle: t.totalDiscountSub,
      amount: formatAmount(data.totalDiscount),
      icon: Coins,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-violet-500/50' : 'bg-[#fdf4ff] border-[#f5d0fe] hover:border-violet-300',
      iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
      textAmountColor: 'text-violet-900 dark:text-violet-300'
    },
  ];

  const dealerCards = [
    {
      type: 'totalPurchase' as const,
      title: t.totalPurchases,
      subtitle: t.totalPurchasesSub,
      amount: formatAmount(data.totalPurchase),
      icon: PackageCheck,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50' : 'bg-[#f4f7fc] border-[#e2e8f0] hover:border-blue-300',
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      textAmountColor: 'text-[#1e293b] dark:text-slate-100'
    },
    {
      type: 'totalPaid' as const,
      title: t.totalPaid,
      subtitle: t.totalPaidSub,
      amount: formatAmount(data.totalPaid),
      icon: CheckCircle2,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50' : 'bg-[#f0fdf4] border-[#dcfce7] hover:border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
      textAmountColor: 'text-emerald-700 dark:text-emerald-400'
    },
    {
      type: 'totalPayable' as const,
      title: t.totalDebt,
      subtitle: t.totalDebtSub,
      amount: formatAmount(data.totalPayable),
      icon: AlertCircle,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-rose-500/50' : 'bg-[#fef2f2] border-[#fee2e2] hover:border-rose-300',
      iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
      textAmountColor: 'text-[#7f1d1d] dark:text-rose-300'
    },
    {
      type: 'cashInHand' as const,
      title: t.cashInHand,
      subtitle: t.cashInHandSub,
      amount: formatAmount(data.cashInHand),
      icon: Coins,
      bg: darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50' : 'bg-[#f0fdf4] border-[#dcfce7] hover:border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
      textAmountColor: 'text-emerald-800 dark:text-emerald-300'
    },
  ];

  const handleCardClick = (type: any, title: string, amount: string) => {
    setActiveModalMetric({ type, title, amount });
  };

  return (
    <div className="space-y-6">
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCardsRow1.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={`summary-row1-${idx}`} 
              onClick={() => handleCardClick(card.type, card.title, card.amount)}
              className={`p-5 rounded-2xl border transition-all shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 group ${card.bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {language === 'bn' ? 'বিস্তারিত View →' : 'View →'}
                </span>
              </div>
              <h3 className={`text-2xl font-extrabold tracking-tight ${card.textAmountColor}`}>
                {card.amount}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCardsRow2.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={`summary-row2-${idx}`} 
              onClick={() => handleCardClick(card.type, card.title, card.amount)}
              className={`p-5 rounded-2xl border transition-all shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 group ${card.bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[180px]">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {language === 'bn' ? 'বিস্তারিত View →' : 'View →'}
                </span>
              </div>
              <h3 className={`text-2xl font-extrabold tracking-tight ${card.textAmountColor}`}>
                {card.amount}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Dealer Section Header */}
      <div className="pt-2">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {t.dealerAccountTitle}
        </h3>
      </div>

      {/* Row 3 (Dealer Summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dealerCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={`summary-dealer-${idx}`} 
              onClick={() => handleCardClick(card.type, card.title, card.amount)}
              className={`p-5 rounded-2xl border transition-all shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 group ${card.bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[180px]">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {language === 'bn' ? 'বিস্তারিত View →' : 'View →'}
                </span>
              </div>
              <h3 className={`text-2xl font-extrabold tracking-tight ${card.textAmountColor}`}>
                {card.amount}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Bottom Empty State Banner */}
      {!hasData && (
        <div className="p-4 rounded-2xl bg-[#fffbeb] border border-[#fef3c7] text-[#b45309] dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300 text-center text-xs font-medium shadow-sm">
          {t.noTransactionNotice}
        </div>
      )}

      {/* Interactive Detail Drill-Down Modal */}
      {activeModalMetric && (
        <MetricDetailModal
          isOpen={true}
          onClose={() => setActiveModalMetric(null)}
          metricType={activeModalMetric.type}
          metricTitle={activeModalMetric.title}
          metricAmount={activeModalMetric.amount}
          transactions={transactions}
          startDate={startDate}
          endDate={endDate}
          onApplyDateRange={onApplyDateRange}
          darkMode={darkMode}
          language={language}
        />
      )}
    </div>
  );
}
