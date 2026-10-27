'use client';

import React, { useState } from 'react';
import { Sparkles, Bot, Send, Loader2, TrendingUp, ShieldAlert, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { translations, Language } from '@/lib/i18n';

interface AiAdvisorProps {
  businessData: any;
  darkMode: boolean;
  language: Language;
}

export function AiAdvisor({ businessData, darkMode, language }: AiAdvisorProps) {
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string>('');
  const [prompt, setPrompt] = useState('');

  const fetchAdvice = async (customPrompt?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt || (language === 'bn' ? 'আমাদের বর্তমান ব্যবসার আয়, কালেকশন ও বাকি এর ওপর ভিত্তি করে ৫টি গুরুত্বপূর্ণ ব্যবসায়িক পরামর্শ দিন।' : 'Give 5 key business advisory points based on our current sales, collection, and dues.'),
          businessData,
          language
        }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setAdvice(data.text);
    } catch (err: any) {
      setAdvice(language === 'bn' ? `ত্রুটি: ${err.message || 'এআই থেকে পরামর্শ আনতে সমস্যা হয়েছে।'}` : `Error: ${err.message || 'Failed to fetch AI advice.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border relative overflow-hidden ${
        darkMode ? 'bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border-slate-800' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-sm'
      }`}>
        <div className="absolute right-4 top-4 text-blue-600/15 dark:text-blue-400/15 pointer-events-none">
          <Bot className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <Sparkles className="w-3.5 h-3.5" /> Gemini AI Business Advisor
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.aiTitle}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {t.aiDesc}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => fetchAdvice(language === 'bn' ? 'কিভাবে আমাদের বাকি কালেকশন দ্রুত বৃদ্ধি করা যায় এবং ঝুঁকি কমানো যায়?' : 'How can we quickly increase due collections and reduce default risks?')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> {t.dueCollectionTip}
          </button>
          <button
            onClick={() => fetchAdvice(language === 'bn' ? 'আমাদের ইলেকট্রনিক্স ও ফার্নিচার বিক্রয় ও প্রফিট মার্জিন বাড়ানোর সেরা উপায় কী?' : 'What are the best ways to increase sales and profit margin for electronics and furniture?')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {t.profitTip}
          </button>
          <button
            onClick={() => fetchAdvice(language === 'bn' ? 'মাসিক খরচ কমাতে এবং ডিলার দেনা পরিশোধের কার্যকর পরিকল্পনা দিন।' : 'Provide an effective plan to reduce monthly expenses and pay off dealer debt.')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> {t.dealerDebtTip}
          </button>
        </div>
      </div>

      {/* Custom Prompt Box */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.askAiPlaceholder}
            className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
          <button
            onClick={() => fetchAdvice(prompt)}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{t.getAdvice}</span>
          </button>
        </div>
      </div>

      {/* Output Response */}
      {(advice || loading) && (
        <div className={`p-6 rounded-3xl border space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-inherit">
            <Bot className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm">{t.aiAnalysisTitle}</h3>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500">{language === 'bn' ? 'আপনার ব্যবসার উপাত্ত বিশ্লেষণ করা হচ্ছে...' : 'Analyzing business data...'}</p>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
              <ReactMarkdown>{advice}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
