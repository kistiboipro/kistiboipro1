'use client';

import React, { useState } from 'react';
import {
  Plus,
  Receipt,
  ShoppingCart,
  Search,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  User,
  ChevronLeft,
  Camera,
  Phone,
  PlusCircle,
  Building2,
  Home,
  Users,
  ShieldCheck,
  CreditCard,
  Banknote,
  Clock,
  X,
  AlertCircle,
  Check,
  Trash2,
  Save,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '@/lib/i18n';
import { DateRangePicker } from './date-range-picker';
import { CustomerDetailView } from './customer-detail-view';
import {
  CustomerRecord,
  CustomerType,
  validateCustomer,
  filterCustomerList,
} from '@/lib/customer-service';
import { saveCustomerToSupabase } from '@/lib/supabase-service';

interface CustomersViewProps {
  darkMode: boolean;
  language: Language;
  customers: CustomerRecord[];
  onUpdateCustomers: React.Dispatch<React.SetStateAction<CustomerRecord[]>>;
  onTabChange: (tab: string, customerId?: string | number | null) => void;
}

export function CustomersView({ darkMode, language, customers, onUpdateCustomers, onTabChange }: CustomersViewProps) {
  const t = translations[language];
  // Navigation view: 'list' | 'form' | 'detail'
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [selectedCustomerType, setSelectedCustomerType] = useState<CustomerType>('Installment');
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filter & search states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form input states
  const [name, setName] = useState('');
  const [primaryMobile, setPrimaryMobile] = useState('');
  const [secondMobile, setSecondMobile] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [address, setAddress] = useState('');

  // Family Info states
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [familyMemberMobile, setFamilyMemberMobile] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [landlordMobile, setLandlordMobile] = useState('');

  // Guarantor Info states
  const [guarantors, setGuarantors] = useState<CustomerRecord['guarantors']>([{ name: '', mobile: '', details: '', photoAdded: false }]);

  // Photo & NID toggles
  const [customerPhotoAdded, setCustomerPhotoAdded] = useState(false);
  const [nidAdded, setNidAdded] = useState(false);

  // Dynamic extra fields
  const [extraKeyFields, setExtraKeyFields] = useState<string[]>([]);
  const [extraFamilyFields, setExtraFamilyFields] = useState<string[]>([]);
  const [extraGuarantorFields, setExtraGuarantorFields] = useState<string[]>([]);

  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const resetForm = () => {
    setName('');
    setPrimaryMobile('');
    setSecondMobile('');
    setWorkplace('');
    setWorkAddress('');
    setAddress('');
    setFamilyMemberName('');
    setFamilyMemberMobile('');
    setLandlordName('');
    setLandlordMobile('');
    setGuarantors([{ name: '', mobile: '', details: '', photoAdded: false }]);
    setCustomerPhotoAdded(false);
    setNidAdded(false);
    setExtraKeyFields([]);
    setExtraFamilyFields([]);
    setExtraGuarantorFields([]);
    setFormErrors({});
  };

  const handleSelectTypeAndOpenForm = (type: CustomerType) => {
    resetForm();
    setSelectedCustomerType(type);
    setIsTypeSelectorOpen(false);
    setView('form');
  };

  const handleBackToList = () => {
    resetForm();
    setSelectedCustomer(null);
    setView('list');
  };

  const handleCustomerClick = (customer: CustomerRecord) => {
    setSelectedCustomer(customer);
    setView('detail');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateCustomer(selectedCustomerType, {
      name,
      primaryMobile,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const avatarColors = ['bg-blue-600', 'bg-rose-500', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600'];
    const chosenColor = avatarColors[customers.length % avatarColors.length];

    const nextId = customers.length > 0 ? Math.max(...customers.map((c) => Number(c.id) || 0)) + 1 : 1;

    const newCustomer: CustomerRecord = {
      id: nextId,
      name: name.trim(),
      type: selectedCustomerType,
      primaryMobile: primaryMobile.trim(),
      secondMobile: secondMobile.trim(),
      workplace: workplace.trim(),
      workAddress: workAddress.trim(),
      address: address.trim(),
      familyMemberName: familyMemberName.trim(),
      familyMemberMobile: familyMemberMobile.trim(),
      landlordName: landlordName.trim(),
      landlordMobile: landlordMobile.trim(),
      guarantors: guarantors.filter(g => g.name.trim() || g.mobile.trim()),
      hasNid: nidAdded,
      status: selectedCustomerType === 'Cash' ? 'Completed' : 'No cell',
      avatarBg: chosenColor,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Save customer information instantly
    const computedId = customers.length > 0 ? Math.max(...customers.map((c) => Number(c.id) || 0)) + 1 : 1;
    const finalCustomer = { ...newCustomer, id: computedId };

    setSelectedCustomer(finalCustomer);
    onUpdateCustomers((prev) => [finalCustomer, ...prev]);

    // Persist customer record to Supabase database
    saveCustomerToSupabase(finalCustomer);

    // Instantly display success modal popup
    setShowSuccessModal(true);
  };

  const filtered = filterCustomerList(customers, search, typeFilter, statusFilter, dateRange);

  // Form View (Installment, Cash, Cash-remaining)
  const isInstallmentOrCashRemaining =
    selectedCustomerType === 'Installment' || selectedCustomerType === 'Cash-remaining';

  const formHeading =
    selectedCustomerType === 'Installment'
      ? 'New installment customer'
      : selectedCustomerType === 'Cash-remaining'
      ? 'New cash-remaining customer'
      : 'New cash customer';
  return (
    <>
      {/* FORM VIEW */}
      {view === 'form' && (
        <div className="max-w-3xl mx-auto py-2 px-1 sm:px-4 space-y-6">
          {/* Top Header with Back Arrow matching screenshot: < New [type] customer */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToList}
              className="p-1 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {formHeading}
            </h1>
          </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* SECTION 1: KEY INFORMATION */}
          <div
            className={`border rounded-2xl p-6 sm:p-8 space-y-5 transition-colors ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-500" />
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                KEY INFORMATION
              </h2>
            </div>

            {/* If Installment or Cash-Remaining, show Photo uploader beside Name */}
            {isInstallmentOrCashRemaining ? (
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Customer Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Customer photo
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomerPhotoAdded(!customerPhotoAdded)}
                    className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer ${
                      customerPhotoAdded
                        ? 'border-blue-500 bg-blue-50/50 text-blue-600'
                        : darkMode
                        ? 'border-slate-700 hover:border-slate-600 text-slate-400'
                        : 'border-slate-300 hover:border-slate-400 text-slate-400'
                    }`}
                  >
                    <Camera className="w-5 h-5 opacity-70" />
                    <span>{customerPhotoAdded ? 'Photo added' : 'Add photo'}</span>
                  </button>
                </div>

                {/* Name & Primary Mobile */}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      placeholder="Customer's full name"
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        formErrors.name
                          ? 'border-red-400 bg-red-50/20'
                          : darkMode
                          ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Primary Mobile <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={primaryMobile}
                        onChange={(e) => {
                          setPrimaryMobile(e.target.value);
                          if (formErrors.primaryMobile)
                            setFormErrors((prev) => ({ ...prev, primaryMobile: '' }));
                        }}
                        placeholder="017XXXXXXXX"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          formErrors.primaryMobile
                            ? 'border-red-400 bg-red-50/20'
                            : darkMode
                            ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Example: 01712345678 (11 digits)</p>
                    {formErrors.primaryMobile && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {formErrors.primaryMobile}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Cash customer Key Information layout
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    placeholder="Customer's full name"
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      formErrors.name
                        ? 'border-red-400 bg-red-50/20'
                        : darkMode
                        ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobile number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={primaryMobile}
                      onChange={(e) => {
                        setPrimaryMobile(e.target.value);
                        if (formErrors.primaryMobile) setFormErrors((prev) => ({ ...prev, primaryMobile: '' }));
                      }}
                      placeholder="017XXXXXXXX"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        formErrors.primaryMobile
                          ? 'border-red-400 bg-red-50/20'
                          : darkMode
                          ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{language === 'bn' ? 'উদাহরণ: ০১৭১২৩৪৫৬৭৮ (১১ সংখ্যা)' : 'Example: 01712345678 (11 digits)'}</p>
                  {formErrors.primaryMobile && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.primaryMobile}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* If Installment or Cash-Remaining, show Second Mobile, Workplace & Work Address */}
            {isInstallmentOrCashRemaining && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Second mobile
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={secondMobile}
                      onChange={(e) => setSecondMobile(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        darkMode
                          ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Example: 01712345678 (11 digits)</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Workplace
                    </label>
                    <input
                      type="text"
                      value={workplace}
                      onChange={(e) => setWorkplace(e.target.value)}
                      placeholder="Company/Organization Name"
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        darkMode
                          ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Work address
                    </label>
                    <input
                      type="text"
                      value={workAddress}
                      onChange={(e) => setWorkAddress(e.target.value)}
                      placeholder="Work address"
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        darkMode
                          ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Home address"
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* Extra Dynamic Key Fields */}
            {extraKeyFields.map((field, idx) => (
              <div key={`extra-key-${idx}`} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Custom field #${idx + 1}`}
                  defaultValue={field}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setExtraKeyFields((prev) => prev.filter((_, i) => i !== idx))}
                  className="p-2 text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* + Add input field */}
            <button
              type="button"
              onClick={() => setExtraKeyFields((prev) => [...prev, ''])}
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer pt-1"
            >
              <div className="w-5 h-5 rounded-full border border-blue-600 dark:border-blue-400 flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </div>
              <span>Add input field</span>
            </button>
          </div>

          {/* SECTION 2: FAMILY INFORMATION (Only for Installment & Cash-remaining) */}
          {isInstallmentOrCashRemaining && (
            <div
              className={`border rounded-2xl p-6 sm:p-8 space-y-5 transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  FAMILY INFORMATION
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Family member&apos;s name
                  </label>
                  <input
                    type="text"
                    value={familyMemberName}
                    onChange={(e) => setFamilyMemberName(e.target.value)}
                    placeholder="Father / Mother / Brother / Sister"
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      darkMode
                        ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Member&apos;s mobile
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={familyMemberMobile}
                      onChange={(e) => setFamilyMemberMobile(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        darkMode
                          ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Example: 01712345678 (11 digits)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Landlord&apos;s name
                  </label>
                  <input
                    type="text"
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                    placeholder=""
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      darkMode
                        ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Landlord&apos;s mobile
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={landlordMobile}
                      onChange={(e) => setLandlordMobile(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        darkMode
                          ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Example: 01712345678 (11 digits)</p>
                </div>
              </div>

              {extraFamilyFields.map((field, idx) => (
                <div key={`extra-family-${idx}`} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Custom field #${idx + 1}`}
                    defaultValue={field}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setExtraFamilyFields((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setExtraFamilyFields((prev) => [...prev, ''])}
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer pt-1"
              >
                <div className="w-5 h-5 rounded-full border border-blue-600 dark:border-blue-400 flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </div>
                <span>Add input field</span>
              </button>
            </div>
          )}

          {/* SECTION 3: GUARANTOR INFORMATION (Only for Installment & Cash-remaining) */}
          {isInstallmentOrCashRemaining && (
            <div
              className={`border rounded-2xl p-6 sm:p-8 space-y-8 transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    GUARANTOR INFORMATION
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setGuarantors(prev => [...prev, { name: '', mobile: '', details: '', photoAdded: false }])}
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add guarantor</span>
                </button>
              </div>

              {guarantors.map((g, idx) => (
                <div key={`guarantor-${idx}`} className={`space-y-5 ${idx > 0 ? 'pt-8 border-t border-slate-100 dark:border-slate-800' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guarantor #{idx + 1}</h4>
                    {guarantors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setGuarantors(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    {/* Guarantor's photo */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Guarantor photo
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newG = [...guarantors];
                          newG[idx].photoAdded = !newG[idx].photoAdded;
                          setGuarantors(newG);
                        }}
                        className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer ${
                          g.photoAdded
                            ? 'border-blue-500 bg-blue-50/50 text-blue-600'
                            : darkMode
                            ? 'border-slate-700 hover:border-slate-600 text-slate-400'
                            : 'border-slate-300 hover:border-slate-400 text-slate-400'
                        }`}
                      >
                        <Camera className="w-5 h-5 opacity-70" />
                        <span>{g.photoAdded ? 'Photo added' : 'Add photo'}</span>
                      </button>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Guarantor&apos;s name
                        </label>
                        <input
                          type="text"
                          value={g.name}
                          onChange={(e) => {
                            const newG = [...guarantors];
                            newG[idx].name = e.target.value;
                            setGuarantors(newG);
                          }}
                          placeholder=""
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                            darkMode
                              ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Guarantor&apos;s mobile
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input
                            type="tel"
                            value={g.mobile}
                            onChange={(e) => {
                              const newG = [...guarantors];
                              newG[idx].mobile = e.target.value;
                              setGuarantors(newG);
                            }}
                            placeholder="017XXXXXXXX"
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                              darkMode
                                ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                                : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Example: 01712345678 (11 digits)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Guarantor details
                    </label>
                    <textarea
                      value={g.details}
                      onChange={(e) => {
                        const newG = [...guarantors];
                        newG[idx].details = e.target.value;
                        setGuarantors(newG);
                      }}
                      placeholder="Address, relationship, etc."
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        darkMode
                          ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 4: NATIONAL IDENTITY CARD (NID) (Only for Installment & Cash-remaining) */}
          {isInstallmentOrCashRemaining && (
            <div
              className={`border rounded-2xl p-6 sm:p-8 space-y-4 transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-rose-500" />
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  NATIONAL IDENTITY CARD (NID)
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setNidAdded(!nidAdded)}
                className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer ${
                  nidAdded
                    ? 'border-blue-500 bg-blue-50/50 text-blue-600'
                    : darkMode
                    ? 'border-slate-700 hover:border-slate-600 text-slate-400'
                    : 'border-slate-300 hover:border-slate-400 text-slate-400'
                }`}
              >
                <Camera className="w-5 h-5 opacity-70" />
                <span>{nidAdded ? 'NID added' : 'Add NID'}</span>
              </button>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="space-y-3 pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-2 ${
                isSaving 
                  ? 'bg-blue-600/70 text-white cursor-not-allowed' 
                  : 'bg-[#1a68ff] hover:bg-blue-600 active:bg-blue-700 text-white'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Wait...</span>
                </>
              ) : (
                'Add customer'
              )}
            </button>
            <button
              type="button"
              onClick={handleBackToList}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm border transition-all text-center cursor-pointer ${
                darkMode
                  ? 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      )}

      {/* DETAIL VIEW */}
      {view === 'detail' && selectedCustomer && (
        <CustomerDetailView
          customer={selectedCustomer}
          onBack={handleBackToList}
          darkMode={darkMode}
          language={language}
        />
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="space-y-6">
      {/* Toast message */}
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

      {/* Top Header Card matching screenshot: Customer / 0 people */}
      <div
        className={`p-5 rounded-2xl border ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          {language === 'bn' ? 'গ্রাহক' : 'Customer'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {customers.length} {language === 'bn' ? 'জন মানুষ' : 'people'}
        </p>
      </div>

      {/* Action Buttons Bar matching screenshot: + New customer, Sale, Retail */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsTypeSelectorOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1a68ff] hover:bg-blue-600 text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {language === 'bn' ? 'নতুন গ্রাহক' : 'New customer'}
        </button>
        <button
          onClick={() => onTabChange('installments')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#16a34a] hover:bg-emerald-700 text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Receipt className="w-4 h-4" /> {language === 'bn' ? 'বিক্রি' : 'Sale'}
        </button>
        <button
          onClick={() => showToast('Opening Retail Cash Sale flow...')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#ea580c] hover:bg-orange-700 text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" /> {language === 'bn' ? 'খুচরা' : 'Retail'}
        </button>
      </div>

      {/* Search Bar matching screenshot */}
      <div
        className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            language === 'bn'
              ? 'নাম, মোবাইল বা গ্রাহক নম্বর...'
              : 'Name, mobile or customer number...'
          }
          className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
      </div>

      {/* Filter and Sorting Bar matching screenshot: All types ⌄, All statuses ⌄, Date ⌄, Sorting 1 ⌄ */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* All types filter */}
          <div className="relative">
            <button
              onClick={() => {
                setIsTypeFilterOpen(!isTypeFilterOpen);
                setIsStatusFilterOpen(false);
              }}
              className={`px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              <span className="capitalize">
                {typeFilter === 'all'
                  ? 'All types'
                  : typeFilter === 'Cash-remaining'
                  ? 'Cash balance'
                  : typeFilter}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {isTypeFilterOpen && (
              <div
                className={`absolute left-0 mt-1.5 w-44 border rounded-xl shadow-lg py-1 z-20 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {['all', 'Installment', 'Cash', 'Cash-remaining'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTypeFilter(t);
                      setIsTypeFilterOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 capitalize"
                  >
                    {t === 'all' ? 'All types' : t === 'Cash-remaining' ? 'Cash balance' : t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* All statuses filter */}
          <div className="relative">
            <button
              onClick={() => {
                setIsStatusFilterOpen(!isStatusFilterOpen);
                setIsTypeFilterOpen(false);
              }}
              className={`px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              <span className="capitalize">
                {statusFilter === 'all' ? 'All statuses' : statusFilter}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {isStatusFilterOpen && (
              <div
                className={`absolute left-0 mt-1.5 w-44 border rounded-xl shadow-lg py-1 z-20 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {['all', 'Completed', 'No cell'].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setIsStatusFilterOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 capitalize"
                  >
                    {s === 'all' ? 'All statuses' : s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date filter component */}
          <DateRangePicker
            startDate={dateRange?.start || '2026-01-01'}
            endDate={dateRange?.end || '2026-12-31'}
            onApply={(start, end) => setDateRange({ start, end })}
            darkMode={darkMode}
            language={language}
          />

          {/* Sorting 1 button matching screenshot with active pill badge */}
          <button
            onClick={() => showToast('Sorting options')}
            className="px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 border-blue-400 text-blue-600 dark:text-blue-400 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sorting</span>
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              1
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>

        {/* Count summary text */}
        <div className="text-xs text-slate-400 font-medium">
          {filtered.length} customers — 1 sort active
        </div>
      </div>

      {/* Customer Cards Grid matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const isCompleted = c.status === 'Completed';
          const isNoCell = c.status === 'No cell';
          const displayType = c.type === 'Cash-remaining' ? 'Cash balance' : c.type;
          
          // Get initials for avatar
          const initials = c.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

          return (
            <motion.div
              layout
              key={`customer-${c.id}`}
              onClick={() => handleCustomerClick(c)}
              className={`p-5 rounded-2xl border transition-all shadow-xs cursor-pointer hover:shadow-md active:scale-[0.98] ${
                isCompleted
                  ? darkMode
                    ? 'bg-emerald-950/20 border-emerald-900/40'
                    : 'bg-[#f0fdf4] border-[#dcfce7] hover:border-emerald-300'
                  : darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 hover:border-blue-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full ${
                    c.avatarBg || 'bg-blue-600'
                  } text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{c.name}</h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      c.type === 'Installment' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : c.type === 'Cash'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}>
                      {c.type === 'Installment' 
                        ? (t as any).installmentCustomer 
                        : c.type === 'Cash' 
                        ? (t as any).cashCustomer 
                        : (t as any).cashRemainingCustomer}
                    </span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> {(t as any).completedStatus}
                      </span>
                    ) : isNoCell ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {(t as any).noCellStatus}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {(t as any).activeStatus}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{(t as any).balanceLabel}</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {c.type === 'Installment' || c.type === 'Cash-remaining' ? '৳ 12,500' : '৳ 0'}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      </div>
      )}

      {/* ============================================================== */}
      {/* 3 OPTIONS MODAL: Installment, Cash, Cash-remaining */}
      {/* ============================================================== */}
      {isTypeSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md rounded-3xl shadow-2xl border p-6 space-y-4 animate-in zoom-in-95 duration-150 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base">Add New Customer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select customer type to open registration form
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTypeSelectorOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {/* Option 1: Installment customer */}
              <button
                type="button"
                onClick={() => handleSelectTypeAndOpenForm('Installment')}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer group ${
                  darkMode
                    ? 'border-slate-800 hover:border-blue-500 hover:bg-slate-800/60'
                    : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50/40'
                }`}
              >
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                    Installment customer
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Customer purchasing via installment plans. Includes Key, Family, Guarantor, and NID information.
                  </p>
                </div>
              </button>

              {/* Option 2: Cash customer */}
              <button
                type="button"
                onClick={() => handleSelectTypeAndOpenForm('Cash')}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer group ${
                  darkMode
                    ? 'border-slate-800 hover:border-emerald-500 hover:bg-slate-800/60'
                    : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40'
                }`}
              >
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                    Cash customer
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Customer purchasing directly with full cash. Quick registration with Name, Mobile, and Address.
                  </p>
                </div>
              </button>

              {/* Option 3: Cash-remaining customer */}
              <button
                type="button"
                onClick={() => handleSelectTypeAndOpenForm('Cash-remaining')}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer group ${
                  darkMode
                    ? 'border-slate-800 hover:border-amber-500 hover:bg-slate-800/60'
                    : 'border-slate-200 hover:border-amber-500 hover:bg-amber-50/40'
                }`}
              >
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors">
                    Cash-remaining customer
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Cash customer with due balance. Full verification form identical to installment customer.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setIsTypeSelectorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal matching image_05b1d986.png */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-sm p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6 ${
                darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'
              }`}
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Customer information ready
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  What to do now?
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    const targetCustId = selectedCustomer?.id;
                    resetForm();
                    setView('list');
                    onTabChange('installments', targetCustId);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#1a68ff] hover:bg-blue-600 text-white font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5" /> Go to Sales
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    resetForm();
                    setView('form');
                  }}
                  className={`w-full py-3.5 rounded-2xl border font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.98] ${
                    darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <Save className="w-5 h-5" /> Keep adding customers.
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    handleBackToList();
                  }}
                  className="w-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold transition-colors cursor-pointer pt-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
