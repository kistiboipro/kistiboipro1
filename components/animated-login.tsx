'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Phone, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Tv, 
  Armchair, 
  FileSpreadsheet, 
  Sun, 
  Moon, 
  Languages, 
  Store, 
  AlertCircle,
} from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { UserSession } from '@/lib/session-service';
import { supabase } from '@/lib/supabase';

export type { UserSession };

interface AnimatedLoginProps {
  onLoginSuccess: (user: UserSession) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export function AnimatedLogin({
  onLoginSuccess,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
}: AnimatedLoginProps) {
  const t = translations[language];

  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const triggerLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: mobile.trim().toLowerCase(),
        password: pin,
      });
      if (error || !data.user) throw new Error('Invalid email or password.');
      const { data: staff, error: staffError } = await supabase
        .from('user_accounts')
        .select('id,name,phone,role,role_key,is_active')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();
      if (staffError || !staff || !staff.is_active || !['admin', 'manager', 'cashier'].includes(staff.role_key)) {
        await supabase.auth.signOut();
        throw new Error('This account is not authorised. Contact your administrator.');
      }
      const roleKey = staff.role_key as UserSession['roleKey'];
      const chosenUser: UserSession = {
        id: data.user.id, name: staff.name, role: staff.role || roleKey, roleKey,
        isAdmin: roleKey === 'admin', phone: staff.phone || '',
        avatarBg: roleKey === 'admin' ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' :
          roleKey === 'manager' ? 'bg-gradient-to-tr from-emerald-600 to-teal-600' :
          'bg-gradient-to-tr from-amber-600 to-orange-600',
        email: data.user.email,
      };
      setIsSuccess(true);
      onLoginSuccess(chosenUser);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in.');
      setShakeKey((value) => value + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || !pin) {
      setErrorMessage(language === 'bn' ? 'ইমেইল ও পাসওয়ার্ড দিন।' : 'Enter your email and password.');
      setShakeKey((value) => value + 1);
      return;
    }
    void triggerLogin();
  };

  return (
    <div className={`relative min-h-screen w-full flex flex-col justify-between overflow-hidden transition-colors duration-300 font-sans ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f7fb] text-slate-900'
    }`}>
      {/* Background Animated Gradient Blobs & Floating Geometry */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Animated glowing orbs */}
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-40 ${
            darkMode ? 'bg-blue-600/30' : 'bg-blue-400/30'
          }`}
        />
        <motion.div
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 60, -30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-40 ${
            darkMode ? 'bg-indigo-600/30' : 'bg-indigo-400/30'
          }`}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${
            darkMode ? 'bg-sky-500/10' : 'bg-sky-200/40'
          }`}
        />

        {/* Ambient subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Top Header Bar: Store Branding & Controls */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                {language === 'bn' ? 'কিস্তিভাই Pro' : 'KistiBoi Pro'}
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {language === 'bn' ? 'বিসমিল্লাহ ইলেকট্রনিক্স অ্যান্ড ফার্নিচার' : 'Bismillah Electronics & Furniture'}
            </p>
          </div>
        </div>

        {/* Top Controls: Language & Theme */}
        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              darkMode 
                ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800' 
                : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
            }`}
            title="Toggle Language"
          >
            <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg text-xs transition-colors border ${
              darkMode 
                ? 'bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800' 
                : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100 shadow-2xs'
            }`}
            title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Column: Retail Visuals & Motion Badges (Hidden on very small screens, visible on lg) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t.systemOnline}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {language === 'bn' 
                  ? 'স্মার্ট কিস্তি হিসাব ও দোকান ব্যবস্থাপনা'
                  : 'Smart Installment & Retail Ledger System'}
              </h1>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'বিসমিল্লাহ ইলেকট্রনিক্স অ্যান্ড ফার্নিচারের কিস্তি ও ক্যাশ গ্রাহকের পূর্ণাঙ্গ লেজার, ইনভয়েস এবং লাইভ প্রফিট বিশ্লেষণ।'
                  : 'Complete ledger, installment tracking, automated collection schedules, and real-time dealer accounting for your retail enterprise.'}
              </p>
            </motion.div>

            {/* Floating Live Transaction Badges with Motion */}
            <div className="space-y-3 pt-2">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-shadow shadow-xs ${
                  darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {language === 'bn' ? 'এলইডি টিভি ৩২" বিক্রয়' : 'LED 32" TV Sale'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? 'সাব্বির ভূঁইয়া • কিস্তি প্ল্যান' : 'Sabbir Bhuiyan • Installment'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {language === 'bn' ? '৳২৫,০০০' : 'Tk 25,000'}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'ডাউন: ৳৬,০০০' : 'Down: Tk 6,000'}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                whileHover={{ scale: 1.02 }}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-shadow shadow-xs ${
                  darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {language === 'bn' ? 'কিস্তি কালেকশন প্রাপ্তি' : 'Installment Collected'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? 'রনি • রসিদ নং #১০৪' : 'Rony • Receipt #104'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {language === 'bn' ? '+৳৮,৫০০ ✓' : '+Tk 8,500 ✓'}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'ক্যাশ ইন হ্যান্ড' : 'Cash in Hand'}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-shadow shadow-xs ${
                  darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Armchair className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {language === 'bn' ? 'ফার্নিচার স্টক ব্যবস্থাপনা' : 'Furniture Inventory'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? 'ওয়ারড্রব ও ড্রেসিং টেবিল' : 'Wardrobes & Dressing Tables'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {language === 'bn' ? '২৪ আইটেম স্টক' : '24 In Stock'}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Animated Interactive Login Card */}
          <div className="lg:col-span-7 flex justify-center">
            <motion.div
              key={shakeKey}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={
                shakeKey > 0
                  ? { opacity: 1, y: 0, scale: 1, x: [-8, 8, -6, 6, -3, 3, 0] }
                  : { opacity: 1, y: 0, scale: 1, x: 0 }
              }
              transition={{ duration: 0.4 }}
              className={`w-full max-w-md rounded-2xl border p-6 sm:p-8 backdrop-blur-md transition-shadow shadow-xl ${
                darkMode 
                  ? 'bg-slate-900/90 border-slate-800/90 shadow-black/40' 
                  : 'bg-white/95 border-slate-200/90 shadow-slate-300/40'
              }`}
            >
              {/* Card Header */}
              <div className="text-center space-y-2 mb-6">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30"
                >
                  <ShieldCheck className="w-7 h-7" />
                </motion.div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {t.loginTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  {t.loginSubtitle}
                </p>
              </div>

              {/* Error Message Toast */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Feedback Overlay */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold">{t.loginSuccess}</p>
                      <p className="text-[11px] opacity-90">
                        {language === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করানো হচ্ছে...' : 'Redirecting to your dashboard...'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mobile / Username Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {language === 'bn' ? 'ইমেইল' : 'Email'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={isLoading || isSuccess}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border font-mono transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 ${
                        darkMode 
                          ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' 
                          : 'bg-slate-50/80 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* PIN / Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setErrorMessage(language === 'bn' ? 'পাসওয়ার্ড রিসেটের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।' : 'Contact your administrator to reset your password.')}
                      className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      disabled={isLoading || isSuccess}
                      className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border tracking-widest font-mono transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 ${
                        darkMode 
                          ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' 
                          : 'bg-slate-50/80 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                  {/* Animated Submit Button */}
                <motion.button
                  whileHover={!isLoading && !isSuccess ? { scale: 1.01 } : {}}
                  whileTap={!isLoading && !isSuccess ? { scale: 0.99 } : {}}
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full relative overflow-hidden py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-lg shadow-blue-600/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t.loggingIn}</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'bn' ? 'স্বাগতম!' : 'Success!'}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.loginBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

            </motion.div>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full py-3.5 px-6 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span>© 2026 {language === 'bn' ? 'বিসমিল্লাহ ইলেকট্রনিক্স অ্যান্ড ফার্নিচার' : 'Bismillah Electronics & Furniture'}</span>
          <span>•</span>
          <span>{language === 'bn' ? 'নিউ মার্কেট রোড, ঢাকা' : 'New Market Road, Dhaka'}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {language === 'bn' ? 'সার্ভার সক্রিয়' : 'Server Online'}
          </span>
          <span>•</span>
          <span>হেল্পলাইন: 01812-345678</span>
        </div>
      </footer>
    </div>
  );
}
