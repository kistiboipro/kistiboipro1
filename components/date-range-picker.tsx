'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '@/lib/i18n';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onApply: (start: string, end: string, label?: string) => void;
  darkMode: boolean;
  language: Language;
  align?: 'left' | 'right';
  position?: 'down' | 'up' | 'auto';
}

export function DateRangePicker({ 
  startDate, 
  endDate, 
  onApply, 
  darkMode, 
  language, 
  align = 'right',
  position = 'down'
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  
  // Safe date parts parser to avoid timezone bugs
  const parseDateParts = (str: string) => {
    if (!str) return { year: 2026, month: 8, day: 22 };
    const parts = str.split('-').map(Number);
    return {
      year: parts[0] || 2026,
      month: (parts[1] !== undefined ? parts[1] - 1 : 8),
      day: parts[2] || 1
    };
  };

  const initialParts = parseDateParts(startDate);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialParts.year, initialParts.month, 1)
  );

  const [activeShortcut, setActiveShortcut] = useState<'today' | 'thisMonth' | 'thisYear' | 'custom'>('custom');
  const popoverRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    if (!isOpen) {
      setTempStart(startDate);
      setTempEnd(endDate);
      const p = parseDateParts(startDate);
      setCurrentMonth(new Date(p.year, p.month, 1));
    }
    setIsOpen(!isOpen);
  };

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSelectingRange(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const shortMonthNamesEn = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const shortMonthNamesBn = [
    'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
  ];

  // Helper to format button label
  const getDisplayLabel = () => {
    if (activeShortcut === 'today' || (startDate === '2026-10-22' && endDate === '2026-10-22' && activeShortcut !== 'custom')) {
      return language === 'bn' ? 'আজ (২২ অক্টো)' : 'Today (22 Oct)';
    }
    if (activeShortcut === 'thisMonth' || (startDate === '2026-10-01' && endDate === '2026-10-31')) {
      return language === 'bn' ? 'এই মাস' : 'This month';
    }
    if (activeShortcut === 'thisYear' || (startDate === '2026-01-01' && endDate === '2026-12-31')) {
      return language === 'bn' ? 'এই বছর' : 'This year';
    }
    if (startDate === '2026-09-22' && endDate === '2026-09-22') {
      return language === 'bn' ? '২২ সেপ্টে' : '22 Sep';
    }

    if (startDate && endDate) {
      if (startDate === endDate) {
        const parts = startDate.split('-');
        const day = parseInt(parts[2], 10);
        const mIdx = parseInt(parts[1], 10) - 1;
        const mName = language === 'bn' ? shortMonthNamesBn[mIdx] : shortMonthNamesEn[mIdx];
        return `${day} ${mName}`;
      } else {
        const sParts = startDate.split('-');
        const eParts = endDate.split('-');
        const sDay = parseInt(sParts[2], 10);
        const sMonth = language === 'bn' ? shortMonthNamesBn[parseInt(sParts[1], 10) - 1] : shortMonthNamesEn[parseInt(sParts[1], 10) - 1];
        const eDay = parseInt(eParts[2], 10);
        const eMonth = language === 'bn' ? shortMonthNamesBn[parseInt(eParts[1], 10) - 1] : shortMonthNamesEn[parseInt(eParts[1], 10) - 1];

        if (sParts[1] === eParts[1]) {
          return `${sDay} - ${eDay} ${sMonth}`;
        }
        return `${sDay} ${sMonth} - ${eDay} ${eMonth}`;
      }
    }
    return language === 'bn' ? 'তারিখ নির্বাচন' : 'Select date';
  };

  const handleShortcut = (type: 'today' | 'thisMonth' | 'thisYear') => {
    setActiveShortcut(type);
    setIsSelectingRange(false);
    let s = tempStart;
    let e = tempEnd;
    if (type === 'today') {
      s = '2026-10-22';
      e = '2026-10-22';
      setCurrentMonth(new Date(2026, 9, 1));
    } else if (type === 'thisMonth') {
      s = '2026-10-01';
      e = '2026-10-31';
      setCurrentMonth(new Date(2026, 9, 1));
    } else if (type === 'thisYear') {
      s = '2026-01-01';
      e = '2026-12-31';
      setCurrentMonth(new Date(2026, 9, 1));
    }
    setTempStart(s);
    setTempEnd(e);
    // Instant apply so the dashboard immediately updates without confusion
    onApply(s, e, type);
    setIsOpen(false);
  };

  const handleSelectMonth = (monthIdx: number, yearNum: number) => {
    const formattedMonth = (monthIdx + 1) < 10 ? `0${monthIdx + 1}` : `${monthIdx + 1}`;
    const lastDay = new Date(yearNum, monthIdx + 1, 0).getDate();
    const formattedLastDay = lastDay < 10 ? `0${lastDay}` : `${lastDay}`;

    const s = `${yearNum}-${formattedMonth}-01`;
    const e = `${yearNum}-${formattedMonth}-${formattedLastDay}`;

    setTempStart(s);
    setTempEnd(e);
    setActiveShortcut('custom');
    setCurrentMonth(new Date(yearNum, monthIdx, 1));
    onApply(s, e, 'custom');
    setIsOpen(false);
  };

  const handleDateClick = (dateStr: string) => {
    setActiveShortcut('custom');
    if (!isSelectingRange) {
      // First click: select single date and allow second click for range
      setTempStart(dateStr);
      setTempEnd(dateStr);
      setIsSelectingRange(true);
      onApply(dateStr, dateStr, 'custom');
    } else {
      // Second click: completes range
      let finalS = tempStart;
      let finalE = dateStr;
      if (dateStr < tempStart) {
        // Auto Swap if clicked before start date
        finalS = dateStr;
        finalE = tempStart;
      }
      setTempStart(finalS);
      setTempEnd(finalE);
      setIsSelectingRange(false);
      onApply(finalS, finalE, 'custom');
    }
  };

  const handleApply = () => {
    let finalStart = tempStart;
    let finalEnd = tempEnd;
    if (finalStart > finalEnd) {
      const swap = finalStart;
      finalStart = finalEnd;
      finalEnd = swap;
    }
    onApply(finalStart, finalEnd, activeShortcut);
    setIsOpen(false);
    setIsSelectingRange(false);
  };

  const handleCancel = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setIsSelectingRange(false);
    setIsOpen(false);
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <div className="relative inline-block text-left z-40" ref={popoverRef}>
      {/* Trigger Button matching image_0873533b.png */}
      <button
        type="button"
        onClick={toggleOpen}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer ${
          darkMode 
            ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' 
            : 'bg-[#eff6ff] border-[#bfdbfe] text-[#2563eb] hover:bg-[#dbeafe]/80'
        }`}
      >
        <CalendarIcon className="w-4 h-4 text-[#2563eb] dark:text-blue-400 shrink-0" />
        <span className="font-semibold text-[#2563eb] dark:text-blue-400">{getDisplayLabel()}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#2563eb] dark:text-blue-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover matching image_7bbb4eaa.png */}
      {isOpen && (
        <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
          position === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
        } w-80 max-h-[78vh] overflow-y-auto rounded-2xl shadow-2xl border p-3.5 z-[9999] animate-in fade-in zoom-in-95 duration-150 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          {/* Top Shortcuts: Today | This month | This year */}
          <div className="flex items-center justify-between gap-1.5 mb-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleShortcut('today')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all text-center cursor-pointer ${
                activeShortcut === 'today'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'bn' ? 'আজ' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => handleShortcut('thisMonth')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all text-center cursor-pointer ${
                activeShortcut === 'thisMonth'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'bn' ? 'এই মাস' : 'This month'}
            </button>
            <button
              type="button"
              onClick={() => handleShortcut('thisYear')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all text-center cursor-pointer ${
                activeShortcut === 'thisYear'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'bn' ? 'এই বছর' : 'This year'}
            </button>
          </div>

          {/* Quick Month Dropdown & Custom Range Inputs */}
          <div className="space-y-2 mb-3 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'নির্দিষ্ট মাস:' : 'Select Month:'}
              </span>
              <select
                value={`${year}-${month}`}
                onChange={(e) => {
                  const [yNum, mNum] = e.target.value.split('-').map(Number);
                  handleSelectMonth(mNum, yNum);
                }}
                className={`px-2.5 py-1 text-xs rounded-xl border font-medium focus:outline-none cursor-pointer ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {[
                  { m: 9, y: 2026, label: language === 'bn' ? 'অক্টোবর ২০২৬' : 'October 2026' },
                  { m: 8, y: 2026, label: language === 'bn' ? 'সেপ্টেম্বর ২০২৬' : 'September 2026' },
                  { m: 7, y: 2026, label: language === 'bn' ? 'আগস্ট ২০২৬' : 'August 2026' },
                  { m: 6, y: 2026, label: language === 'bn' ? 'জুলাই ২০২৬' : 'July 2026' },
                  { m: 5, y: 2026, label: language === 'bn' ? 'জুন ২০২৬' : 'June 2026' },
                  { m: 10, y: 2026, label: language === 'bn' ? 'নভেম্বর ২০২৬' : 'November 2026' },
                  { m: 11, y: 2026, label: language === 'bn' ? 'ডিসেম্বর ২০২৬' : 'December 2026' },
                ].map((item) => (
                  <option key={`m-opt-${item.y}-${item.m}`} value={`${item.y}-${item.m}`}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date to End Date Range Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                  {language === 'bn' ? 'হতে (From)' : 'From Date'}
                </label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => {
                    setTempStart(e.target.value);
                    setActiveShortcut('custom');
                  }}
                  className={`w-full px-2 py-1 rounded-lg border text-xs focus:outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                  {language === 'bn' ? 'পর্যন্ত (To)' : 'To Date'}
                </label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => {
                    setTempEnd(e.target.value);
                    setActiveShortcut('custom');
                  }}
                  className={`w-full px-2 py-1 rounded-lg border text-xs focus:outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Month Header Navigation */}
          <div className="flex items-center justify-between my-3 px-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
              {language === 'bn' ? `${monthNamesBn[month]} ${year}` : `${monthNamesEn[month]} ${year}`}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Day Names Header - Clean 3-letter / short names that never overlap */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5">
            <span>{language === 'bn' ? 'রবি' : 'Sun'}</span>
            <span>{language === 'bn' ? 'সোম' : 'Mon'}</span>
            <span>{language === 'bn' ? 'মঙ্গল' : 'Tue'}</span>
            <span>{language === 'bn' ? 'বুধ' : 'Wed'}</span>
            <span>{language === 'bn' ? 'বৃহঃ' : 'Thu'}</span>
            <span>{language === 'bn' ? 'শুক্র' : 'Fri'}</span>
            <span>{language === 'bn' ? 'শনি' : 'Sat'}</span>
          </div>

          {/* Days Grid - Uniform 7 columns with explicit row height & alignment */}
          <div className="grid grid-cols-7 auto-rows-fr place-items-center gap-x-1 gap-y-1.5 text-xs py-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8" />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const isStart = dateStr === tempStart;
              const isEnd = dateStr === tempEnd;
              const minD = tempStart <= tempEnd ? tempStart : tempEnd;
              const maxD = tempStart <= tempEnd ? tempEnd : tempStart;
              const inRange = Boolean(tempStart && tempEnd && dateStr >= minD && dateStr <= maxD);
              const isToday = dateStr === '2026-10-25';

              return (
                <button
                  type="button"
                  key={dateStr}
                  onClick={() => handleDateClick(dateStr)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-bold transition-all text-xs cursor-pointer shrink-0 relative ${
                    isStart || isEnd
                      ? 'bg-blue-600 text-white font-black shadow-md ring-2 ring-blue-400/40'
                      : inRange
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold'
                      : isToday
                      ? 'border-2 border-amber-500 font-black text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Helper notice matching screenshot */}
          <p className="text-[10px] text-slate-400 mt-3 text-center">
            {language === 'bn'
              ? 'একটি তারিখ = একক · দুই ক্লিক = পরিসীমা · স্বয়ংক্রিয় অদলবদল'
              : 'One date = Single · Two clicks = Range · First click = Auto Swap'}
          </p>

          {/* Actions: Cancel | Apply */}
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-inherit">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              {language === 'bn' ? 'প্রয়োগ করুন' : 'Apply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
