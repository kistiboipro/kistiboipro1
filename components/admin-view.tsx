'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  UserCheck, 
  Users, 
  Clock, 
  Smartphone, 
  Monitor, 
  Laptop, 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  Power, 
  Key, 
  Eye, 
  Calendar, 
  Globe, 
  Check, 
  X,
  Store,
  FileSpreadsheet
} from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { 
  UserSession, 
  LoginAuditRecord, 
  StaffMember, 
  INITIAL_STAFF, 
  INITIAL_LOGIN_LOGS 
} from '@/lib/session-service';

interface AdminViewProps {
  currentUser: UserSession | null;
  darkMode: boolean;
  language: Language;
  onSwitchUser?: (user: UserSession) => void;
  onNavigateTab?: (tab: string) => void;
}

export function AdminView({
  currentUser,
  darkMode,
  language,
  onSwitchUser,
  onNavigateTab,
}: AdminViewProps) {
  const t = translations[language];

  // RBAC Guard: If user is not admin, deny access immediately
  const isAdmin = currentUser?.isAdmin ?? (currentUser?.roleKey === 'admin');

  const [logs, setLogs] = useState<LoginAuditRecord[]>(INITIAL_LOGIN_LOGS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'cashier'>('all');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showExportSuccessToast, setShowExportSuccessToast] = useState(false);
  const [sessionTerminatedNotice, setSessionTerminatedNotice] = useState<string | null>(null);

  // New staff form state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'manager' | 'cashier'>('manager');

  // Filtered login logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch = 
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userPhone.includes(searchQuery) ||
        log.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.deviceInfo.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || log.status === statusFilter;
      const matchRole = roleFilter === 'all' || log.roleKey === roleFilter;

      return matchSearch && matchStatus && matchRole;
    });
  }, [logs, searchQuery, statusFilter, roleFilter]);

  // Terminate a session
  const handleTerminateSession = (logId: string, userName: string) => {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? { ...l, status: 'ended', sessionDuration: language === 'bn' ? 'অ্যাডমিন কর্তৃক বাতিল' : 'Terminated by Admin' }
          : l
      )
    );
    setSessionTerminatedNotice(
      language === 'bn'
        ? `${userName}-এর সেশন সফলভাবে বাতিল করা হয়েছে!`
        : `Session for ${userName} has been terminated!`
    );
    setTimeout(() => setSessionTerminatedNotice(null), 3500);
  };

  // Export audit log as CSV
  const handleExportCSV = () => {
    const headers = ['Session ID', 'User Name', 'Role', 'Phone', 'Login Time', 'IP Address', 'Device', 'Status', 'Actions'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.userName}"`,
      `"${l.role}"`,
      l.userPhone,
      `"${l.loginTime}"`,
      `"${l.ipAddress}"`,
      `"${l.deviceInfo}"`,
      l.status,
      `"${l.actionsPerformed.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bismillah_login_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportSuccessToast(true);
    setTimeout(() => setShowExportSuccessToast(false), 3000);
  };

  // Add new staff member
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffPhone.trim()) return;

    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim(),
      phone: newStaffPhone.trim(),
      email: `${newStaffName.toLowerCase().replace(/\s+/g, '')}@bismillah.com`,
      role: newStaffRole === 'manager' 
        ? (language === 'bn' ? 'সেলস ম্যানেজার' : 'Sales Manager')
        : (language === 'bn' ? 'ক্যাশিয়ার' : 'Cashier'),
      roleKey: newStaffRole,
      avatarBg: newStaffRole === 'manager' ? 'bg-gradient-to-tr from-emerald-600 to-teal-600' : 'bg-gradient-to-tr from-amber-600 to-orange-600',
      status: 'active',
      joinedDate: '2026-10-25',
      permissions: {
        dashboard: true,
        customers: true,
        sales: true,
        collections: true,
        dealers: newStaffRole === 'cashier',
        stock: newStaffRole === 'manager',
        expenses: newStaffRole === 'cashier',
        adminPanel: false,
      },
    };

    setStaff((prev) => [...prev, newMember]);
    setShowAddStaffModal(false);
    setNewStaffName('');
    setNewStaffPhone('');
  };

  // ==========================================
  // RESTRICTED ACCESS SCREEN (FOR NON-ADMINS)
  // ==========================================
  if (!isAdmin) {
    return (
      <div className={`p-8 rounded-3xl border text-center max-w-2xl mx-auto my-12 space-y-6 shadow-xl ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.accessRestrictedTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            {t.accessRestrictedNotice}
          </p>
        </div>

        {/* Current user info pill */}
        <div className={`p-4 rounded-2xl border inline-flex items-center gap-3 text-left ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`w-10 h-10 rounded-full ${currentUser?.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {currentUser?.name || 'Unknown User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'বর্তমান রোল: ' : 'Current Role: '}
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {currentUser?.role || 'Staff Member'}
              </span>
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
            >
              {t.backToDashboard}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // FULL ADMIN ACCESS VIEW
  // ==========================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Toast notifications */}
      <AnimatePresence>
        {sessionTerminatedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2.5 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{sessionTerminatedNotice}</span>
          </motion.div>
        )}
        {showExportSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{language === 'bn' ? 'লগইন অডিট ফাইল সফলভাবে ডাউনলোড হয়েছে!' : 'Audit log CSV exported successfully!'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Header Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {t.adminPanel}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {language === 'bn' ? 'শুধুমাত্র অ্যাডমিন' : 'Admin Only'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.loginHistorySubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t.exportAuditLog}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddStaffModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.addNewStaff}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Logged In Person */}
        <div className={`p-4 rounded-2xl border transition-shadow ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'বর্তমান ইউজার' : 'Active Admin'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white truncate">
            {currentUser?.name || 'Md. Rahim Mia'}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate mt-0.5">
            {currentUser?.role || t.roleAdmin}
          </p>
        </div>

        {/* Stat 2: Active Sessions */}
        <div className={`p-4 rounded-2xl border transition-shadow ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.activeSessionsCount}
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {logs.filter(l => l.status === 'active').length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn' ? '১টি ব্রাউজার সেশন সক্রিয়' : '1 live browser session'}
          </p>
        </div>

        {/* Stat 3: Total Logins Today */}
        <div className={`p-4 rounded-2xl border transition-shadow ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.totalLoginsToday}
            </span>
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {logs.filter(l => l.loginTime.includes('2026-10-25')).length || 2}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn' ? 'সকল সেশন রেকর্ড সংরক্ষিত' : 'All session logs logged'}
          </p>
        </div>

        {/* Stat 4: Registered Staff */}
        <div className={`p-4 rounded-2xl border transition-shadow ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.authorizedUsers}
            </span>
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {staff.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn' ? '৩ জন অনুমোদিত কর্মচারী' : '3 authorized personnel'}
          </p>
        </div>
      </div>

      {/* HIGHLIGHTED CARD: WHO IS CURRENTLY LOGGED IN */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden ${
        darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border-blue-900/50' : 'bg-gradient-to-br from-blue-50/60 via-white to-sky-50/50 border-blue-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t.currentActiveSession}
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {language === 'bn' ? 'সরাসরি অনলাইন' : 'Active Right Now'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* User profile */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${currentUser?.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center font-extrabold text-xl shadow-lg shrink-0`}>
              {currentUser?.name?.charAt(0) || 'M'}
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {currentUser?.name || 'Md. Rahim Mia'}
              </h4>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {currentUser?.role || t.roleAdmin}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser?.phone || '01812-345678'}
              </p>
            </div>
          </div>

          {/* Device & Location info */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-800 pl-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-400" />
              <span>{language === 'bn' ? 'ডিভাইস: ' : 'Device: '}Desktop Chrome 124 (Linux/Windows)</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>{language === 'bn' ? 'আইপি ও লোকেশন: ' : 'IP / Location: '}192.168.1.10 (Dhaka Store HQ)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{language === 'bn' ? 'লগইন সময়: ' : 'Login Time: '}2026-10-25 08:30 AM</span>
            </div>
          </div>

          {/* Access permissions summary */}
          <div className="border-l border-slate-200 dark:border-slate-800 pl-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {language === 'bn' ? 'সক্রিয় অনুমতি' : 'Active Privileges'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                {language === 'bn' ? 'সম্পূর্ণ নিয়ন্ত্রণ' : 'Full Admin Control'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                {language === 'bn' ? 'কিস্তি ও বিক্রয়' : 'Sales & Dues'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                {language === 'bn' ? 'ডিলার লেজার' : 'Dealer Ledger'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                {language === 'bn' ? 'স্টাফ অডিট' : 'Staff Audit'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE 1: WHO LOGIN MY APP (AUDIT LOGS) */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t.loginHistoryTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'অ্যাপে কারা কারা প্রবেশ করেছে এবং তাদের বর্তমান সেশন বিস্তারিত' : 'Record of users who logged into the store app and their session details'}
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'নাম, ফোন বা রোল সার্চ...' : 'Search user, phone or role...'}
                className={`pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`px-3 py-1.5 text-xs rounded-xl border focus:outline-hidden ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
              <option value="active">{language === 'bn' ? 'চলমান (Active)' : 'Active Sessions'}</option>
              <option value="ended">{language === 'bn' ? 'সমাপ্ত (Ended)' : 'Ended Sessions'}</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className={`px-3 py-1.5 text-xs rounded-xl border focus:outline-hidden ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">{language === 'bn' ? 'সকল রোল' : 'All Roles'}</option>
              <option value="admin">{language === 'bn' ? 'অ্যাডমিন' : 'Admin'}</option>
              <option value="manager">{language === 'bn' ? 'ম্যানেজার' : 'Manager'}</option>
              <option value="cashier">{language === 'bn' ? 'ক্যাশিয়ার' : 'Cashier'}</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-semibold ${
                darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <th className="py-3 px-4">{language === 'bn' ? 'ব্যবহারকারী ও রোল' : 'User & Assigned Role'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}</th>
                <th className="py-3 px-4">{t.loginTime}</th>
                <th className="py-3 px-4">{t.deviceAndIp}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'সেশন সময়কাল' : 'Duration / Status'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'কার্যক্রম লগ' : 'Activity Summary'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'কন্ট্রোল' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {language === 'bn' ? 'কোনো সেশন লগ পাওয়া যায়নি।' : 'No session logs match your criteria.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr 
                    key={log.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                      log.status === 'active' ? (darkMode ? 'bg-blue-950/20' : 'bg-blue-50/30') : ''
                    }`}
                  >
                    {/* User & Role */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${log.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                          {log.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {log.userName}
                          </p>
                          <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 ${
                            log.roleKey === 'admin'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : log.roleKey === 'manager'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {log.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {log.userPhone}
                    </td>

                    {/* Login Time */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {log.loginTime}
                    </td>

                    {/* Device & IP */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {log.deviceInfo}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {log.ipAddress}
                      </p>
                    </td>

                    {/* Duration & Status */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          log.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`} />
                        <span className={`font-semibold ${
                          log.status === 'active' 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {log.sessionDuration}
                        </span>
                      </div>
                    </td>

                    {/* Actions Log */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate text-[11px]">
                      {log.actionsPerformed}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      {log.status === 'active' ? (
                        <button
                          type="button"
                          onClick={() => handleTerminateSession(log.id, log.userName)}
                          title="Force terminate this session"
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                        >
                          {t.terminateSession}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {language === 'bn' ? 'সম্পন্ন' : 'Ended'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE 2: STAFF DIRECTORY & PERMISSION MATRIX */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {t.staffManagement}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'দোকানের কর্মচারীদের ভূমিকা ও অনুমতি তালিকা' : 'Store personnel, assigned roles, and access privilege matrix'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-semibold ${
                darkMode ? 'bg-slate-800/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <th className="py-3 px-4">{language === 'bn' ? 'স্টাফ নাম ও পদবী' : 'Staff Member & Role'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'যোগাযোগ' : 'Contact'}</th>
                <th className="py-3 px-4 text-center">Dashboard</th>
                <th className="py-3 px-4 text-center">Customer & Sale</th>
                <th className="py-3 px-4 text-center">Payments</th>
                <th className="py-3 px-4 text-center">Dealer & Debt</th>
                <th className="py-3 px-4 text-center">Stock & Expense</th>
                <th className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400">Admin Page</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  {/* Name & Role */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${member.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3 px-4">
                    <p className="font-mono text-slate-700 dark:text-slate-300">{member.phone}</p>
                    <p className="text-[10px] text-slate-400">{member.email}</p>
                  </td>

                  {/* Permissions checks */}
                  <td className="py-3 px-4 text-center">
                    {member.permissions.dashboard ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {member.permissions.sales ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {member.permissions.collections ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {member.permissions.dealers ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {member.permissions.stock || member.permissions.expenses ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {member.permissions.adminPanel ? (
                      <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded text-[11px]">
                        <ShieldCheck className="w-3 h-3" />
                        {language === 'bn' ? 'অনুমোদিত' : 'Allowed'}
                      </span>
                    ) : (
                      <span className="text-rose-500 dark:text-rose-400 font-semibold text-[11px] bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                        <Lock className="w-2.5 h-2.5 inline mr-1" />
                        {language === 'bn' ? 'নিষিদ্ধ' : 'Locked'}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {language === 'bn' ? 'সক্রিয়' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD NEW STAFF MEMBER */}
      <AnimatePresence>
        {showAddStaffModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base">
                    {t.addNewStaff}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'স্টাফের পূর্ণ নাম' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Asadul Islam"
                    required
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'মোবাইল নম্বর (লগইন ইউজারনেম)' : 'Mobile Phone (Login Username)'}
                  </label>
                  <input
                    type="text"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    placeholder="017XX-XXXXXX"
                    required
                    className={`w-full px-3.5 py-2 rounded-xl border font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t.userRole}
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-hidden ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="manager">{language === 'bn' ? 'সেলস ম্যানেজার (Sales Manager)' : 'Sales Manager'}</option>
                    <option value="cashier">{language === 'bn' ? 'ক্যাশিয়ার ও হিসাবরক্ষক (Cashier)' : 'Cashier & Accounts'}</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'bn' 
                      ? 'অ্যাডমিন পেজ শুধুমাত্র প্রধান মালিকের জন্য সংরক্ষিত থাকবে।' 
                      : 'Admin page remains strictly locked to the primary proprietor.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-[11px] space-y-1">
                  <p className="font-semibold">{language === 'bn' ? 'ডিফল্ট নিরাপত্তা পিন: 1234' : 'Default Security PIN: 1234'}</p>
                  <p className="opacity-90">{language === 'bn' ? 'স্টাফ তার মোবাইল ও পিন 1234 দিয়ে লগইন করতে পারবে।' : 'New staff can log in using their phone and demo PIN 1234.'}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-colors"
                  >
                    {language === 'bn' ? 'যুক্ত করুন' : 'Confirm & Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
