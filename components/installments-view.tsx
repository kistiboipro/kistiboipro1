'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';

interface InstallmentsViewProps {
  darkMode: boolean;
}

export function InstallmentsView({ darkMode }: InstallmentsViewProps) {
  const schedule = [
    { id: 1, customer: 'মোঃ শরিফুল ইসলাম', installmentNo: '৩য় কিস্তি', amount: 3500, dueDate: '২০২৬-১০-২৫', status: 'বাকি' },
    { id: 2, customer: 'মোসাম্মৎ পারভীন আক্তার', installmentNo: '৫ম কিস্তি', amount: 2000, dueDate: '২০২৬-১০-২৬', status: 'বাকি' },
    { id: 3, customer: 'নাজমুল হাসান সজীব', installmentNo: '২য় কিস্তি', amount: 4000, dueDate: '২০২৬-১০-২০', status: 'পরিশোধিত' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">কিস্তি হিসাব ও সিডিউল (Installment Ledger)</h2>
        <p className="text-xs text-slate-500">আসন্ন কিস্তি ও কিস্তি আদায়ের শিডিউল</p>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`border-b text-xs font-semibold ${darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <tr>
                <th className="p-4">গ্রাহকের নাম</th>
                <th className="p-4">কিস্তির বিবরণ</th>
                <th className="p-4">পরিমাণ</th>
                <th className="p-4">পরিশোধের তারিখ</th>
                <th className="p-4">স্ট্যাটাস</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {schedule.map((item) => (
                <tr key={`inst-row-${item.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{item.customer}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{item.installmentNo}</td>
                  <td className="p-4 font-bold text-emerald-600">৳ {item.amount.toLocaleString()}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.dueDate}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      item.status === 'পরিশোধিত' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60'
                    }`}>
                      {item.status === 'পরিশোধিত' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => alert(`${item.customer} এর কিস্তি গ্রহণ করা হলো`)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      টাকা গ্রহণ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
