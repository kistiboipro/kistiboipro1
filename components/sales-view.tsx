'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Plus, ShoppingCart, Search, ClipboardList, Check, X, Package, ChevronLeft, PlusCircle, Send } from 'lucide-react';
import { Language } from '@/lib/i18n';
import { DateRangePicker } from '@/components/date-range-picker';
import { CustomerRecord } from '@/lib/customer-service';
import { saveTransactionToSupabase } from '@/lib/supabase-service';

interface SalesViewProps {
  darkMode: boolean;
  language: Language;
  customers: CustomerRecord[];
  initialCustomerId?: string | number | null;
}

// Mock data for search
const MOCK_PRODUCTS = [
  { name: 'Led 32"', price: 25000, stock: 199, purchasePrice: 17500 },
  { name: 'Samsung Galaxy A55', price: 42999, stock: 12, purchasePrice: 38500 },
  { name: 'Walton Refrigerator 220L', price: 36500, stock: 3, purchasePrice: 32000 },
  { name: 'Vision Ceiling Fan 56"', price: 3400, stock: 24, purchasePrice: 2800 },
  { name: 'Minister Inverter AC', price: 65000, stock: 5, purchasePrice: 55000 },
  { name: 'Singer Microwave Oven', price: 12500, stock: 10, purchasePrice: 10500 },
];

const getPreviousBalance = (customer: any) => {
  if (!customer) return 0;
  // If it's a "Cash" type customer or newly added, start with 0
  if (customer.type === 'Cash' || Number(customer.id) > 2) return 0;
  return 23000;
};

export function SalesView({ darkMode, language, customers, initialCustomerId }: SalesViewProps) {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [isRetailModalOpen, setIsRetailModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const [sales, setSales] = useState<any[]>([
    {
      id: 1,
      customer: 'Sabbir Bhuiyan',
      product: 'Led 32"',
      amount: 25000,
      date: '23 Oct, 2026, 12:00 AM',
      status: 'Active'
    }
  ]);

  const [view, setView] = useState<'list' | 'form'>(() => initialCustomerId ? 'form' : 'list');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(() => {
    if (initialCustomerId) {
      return customers.find(c => String(c.id) === String(initialCustomerId)) || null;
    }
    return null;
  });

  const [prevInitialCustomerId, setPrevInitialCustomerId] = useState(initialCustomerId);
  if (prevInitialCustomerId !== initialCustomerId) {
    setPrevInitialCustomerId(initialCustomerId);
    if (initialCustomerId) {
      const customer = customers.find(c => String(c.id) === String(initialCustomerId));
      if (customer) {
        setSelectedCustomer(customer);
        setView('form');
      }
    }
  }
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [customizeDate, setCustomizeDate] = useState(false);
  const [downPayment, setDownPayment] = useState('0');
  const [numInstallments, setNumInstallments] = useState('6');
  const [interval, setInterval] = useState('Monthly');
  const [firstDate, setFirstDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [showProductResults, setShowProductResults] = useState(false);

  const customerResults = useMemo(() => 
    customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      (c.primaryMobile && c.primaryMobile.includes(customerSearch))
    ), [customerSearch, customers]
  );

  const productResults = useMemo(() => 
    MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    ), [productSearch]
  );

  const calculateTotal = useCallback(() => 
    selectedProducts.reduce((sum, p) => sum + (p.price || 0) * (parseInt(p.quantity) || 1), 0),
    [selectedProducts]
  );

  const calculateRemaining = useCallback(() => 
    calculateTotal() - (parseFloat(downPayment) || 0),
    [calculateTotal, downPayment]
  );

  const installments = useMemo(() => {
    const num = parseInt(numInstallments) || 0;
    if (num <= 0) return [];
    
    const list = [];
    const totalRemaining = calculateRemaining();
    const amountPerInstallment = Math.floor(totalRemaining / num);
    const startDate = new Date(firstDate);
    
    for (let i = 0; i < num; i++) {
      const date = new Date(startDate);
      if (interval === 'Monthly') {
        date.setMonth(date.getMonth() + i);
      } else if (interval === 'Weekly') {
        date.setDate(date.getDate() + i * 7);
      } else if (interval === 'Fortnightly') {
        date.setDate(date.getDate() + i * 14);
      }
      
      list.push({
        id: i + 1,
        date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: i === num - 1 ? totalRemaining - (amountPerInstallment * (num - 1)) : amountPerInstallment,
        status: 'Outstanding'
      });
    }
    return list;
  }, [numInstallments, interval, firstDate, calculateRemaining]);

  const handleAddProduct = useCallback((product: any) => {
    setSelectedProducts(prev => [...prev, { 
      ...product, 
      quantity: '1', 
      sellingPrice: product.price.toString(),
      stock: product.stock,
      purchasePrice: product.purchasePrice
    }]);
    setProductSearch('');
    setShowProductResults(false);
  }, []);

  const resetForm = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setSelectedProducts([]);
    setDownPayment('0');
    setNumInstallments('6');
    setInterval('Monthly');
    setNotes('');
  }, []);

  const handleConfirm = useCallback((withSms: boolean) => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }
    if (selectedProducts.length === 0) {
      alert('Please add at least one product');
      return;
    }

    const total = calculateTotal();
    setIsConfirming(true);
    
    // Simulate server delay
    setTimeout(() => {
      const newId = `sale-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newSaleRecord = {
        id: newId,
        customer: selectedCustomer.name,
        product: selectedProducts.map(p => `${p.name} (x${p.quantity})`).join(', '),
        amount: total,
        date: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'Active'
      };

      setSales(prev => [newSaleRecord, ...prev]);

      // Persist transaction to Supabase
      saveTransactionToSupabase({
        id: newId,
        date: new Date().toISOString().split('T')[0],
        type: 'sale',
        amount: total,
        downPayment: Number(downPayment) || 0,
        customerOrDealer: selectedCustomer.name,
        note: `Sale: ${newSaleRecord.product}`
      });

      setIsConfirming(false);
      alert(`Sale confirmed! ${withSms ? 'SMS sent to customer.' : ''}`);
      setView('list');
      resetForm();
    }, 1500);
  }, [selectedCustomer, selectedProducts, calculateTotal, resetForm, downPayment]);

  const filtered = useMemo(() => 
    sales.filter(s => 
      s.customer.toLowerCase().includes(search.toLowerCase()) || 
      s.product.toLowerCase().includes(search.toLowerCase())
    ), [sales, search]
  );

  const inputClass = `w-full px-5 py-3.5 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 ${
    darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'
  }`;

  const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 ml-1";

  if (view === 'form') {
    return (
      <div className="max-w-4xl mx-auto py-2 px-1 sm:px-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Header matching Screenshot_2026-10-23_211627_0d24b982.png */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setView('list')}
            className="p-1 rounded-lg text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            New sales
          </h1>
        </div>

        <div className="space-y-6">
          {/* SECTION 1: Customers and products matching image_2ec8c1fb.png */}
          <div className={`p-10 rounded-[2.5rem] border space-y-8 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shadow-sm">1</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customers and products</h2>
            </div>

            <div className="space-y-6">
              {/* Customer Selection matching image_ed222ae0.png */}
              <div className="relative">
                <label className={labelClass}>Customer <span className="text-red-500">*</span></label>
                
                {selectedCustomer ? (
                  <div className={`p-4 rounded-2xl border flex items-center justify-between animate-in fade-in zoom-in-95 duration-200 ${darkMode ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                        {selectedCustomer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{selectedCustomer.primaryMobile || selectedCustomer.phone}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedCustomer(null)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search by name or phone number..." 
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerResults(true);
                      }}
                      onFocus={() => setShowCustomerResults(true)}
                      className={`${inputClass} pl-11`} 
                    />
                  </div>
                )}

                {showCustomerResults && !selectedCustomer && (
                  <div className={`absolute z-30 left-0 right-0 mt-2 border rounded-2xl shadow-xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    {customerResults.length > 0 ? (
                      customerResults.map((c) => (
                        <button
                          key={`customer-option-${c.id}`}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setCustomerSearch('');
                            setShowCustomerResults(false);
                          }}
                          className={`w-full text-left px-5 py-3 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</p>
                            <p className="text-[11px] text-slate-500">{c.primaryMobile || (c as any).phone}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-5 py-4 text-sm text-slate-500 text-center">No customers found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Product Search */}
              <div className="relative">
                <label className={labelClass}>Product <span className="text-red-500">*</span> <span className="text-[10px] font-normal text-slate-400 italic">(multiple products can be added)</span></label>
                <div className="relative">
                  <div className={`flex items-center gap-3 w-full px-5 py-2.5 rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search by product name or model..." 
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductResults(true);
                      }}
                      onFocus={() => setShowProductResults(true)}
                      className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {showProductResults && productSearch && (
                  <div className={`absolute z-30 left-0 right-0 mt-2 border rounded-2xl shadow-xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    {productResults.length > 0 ? (
                      productResults.map((p, idx) => (
                        <button
                          key={`product-option-${idx}`}
                          onClick={() => handleAddProduct(p)}
                          className={`w-full text-left px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                              <Package className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</span>
                          </div>
                          <span className="text-sm font-bold text-blue-600">৳{p.price.toLocaleString()}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-5 py-4 text-sm text-slate-500 text-center">No products found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Products List matching image_ed222ae0.png */}
              {selectedProducts.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {selectedProducts.map((p, i) => (
                    <div 
                      key={`selected-product-${i}`} 
                      className={`p-6 rounded-2xl border-l-4 border-l-emerald-500 border-y border-r relative ${
                        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                      }`}
                    >
                      {/* Close Button */}
                      <button 
                        onClick={() => setSelectedProducts(selectedProducts.filter((_, idx) => idx !== i))}
                        className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate pr-8">
                            {p.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <p className="text-[11px] text-slate-400 font-medium">
                              Stock: <span className="text-slate-600 dark:text-slate-300">{p.stock || 198} pieces</span>
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Purchase price: <span className="text-slate-600 dark:text-slate-300">৳{(p.purchasePrice || 20500).toLocaleString()}</span>
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                Selling price / unit (৳) <span className="text-red-500">*</span>
                              </label>
                              <input 
                                type="number" 
                                placeholder="Write"
                                value={p.sellingPrice || ''}
                                onChange={(e) => {
                                  const newList = [...selectedProducts];
                                  newList[i] = { ...p, sellingPrice: e.target.value, price: parseFloat(e.target.value) || 0 };
                                  setSelectedProducts(newList);
                                }}
                                className={inputClass} 
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                Quantity <span className="text-red-500">*</span>
                              </label>
                              <input 
                                type="number" 
                                placeholder="1"
                                value={p.quantity || '1'}
                                onChange={(e) => {
                                  const newList = [...selectedProducts];
                                  newList[i] = { ...p, quantity: e.target.value };
                                  setSelectedProducts(newList);
                                }}
                                className={inputClass} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer group w-fit pt-2">
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${customizeDate ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/20' : 'border-slate-300 group-hover:border-blue-400'}`}>
                  {customizeDate && <Check className="w-4 h-4 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={customizeDate} onChange={() => setCustomizeDate(!customizeDate)} />
                <span className="text-sm text-slate-600 dark:text-slate-300 font-bold">Customize date</span>
              </label>
            </div>
          </div>

          {/* SECTION 2: Price and installment plan matching Screenshot_2026-10-23_211657_305eabce.png */}
          <div className={`p-10 rounded-[2.5rem] border space-y-8 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shadow-sm">2</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Price and installment plan</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Down payment (৳)</label>
                  <input 
                    type="number" 
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className={labelClass}>Number of installments <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={numInstallments}
                    onChange={(e) => setNumInstallments(e.target.value)}
                    className={inputClass} 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Remaining amount (this cell)</label>
                  <div className={`w-full px-5 py-4 rounded-2xl border font-bold flex items-center text-lg ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                    {selectedProducts.length > 0 ? `৳${calculateRemaining().toLocaleString()}` : '—'}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Installment interval <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      value={interval}
                      onChange={(e) => setInterval(e.target.value)}
                      className={`${inputClass} appearance-none pr-10`}
                    >
                      <option>Monthly</option>
                      <option>Weekly</option>
                      <option>Fortnightly</option>
                    </select>
                    <ChevronLeft className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none opacity-40" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>First Installment Date <span className="text-red-500">*</span></label>
                <div className="relative">
                   <input 
                    type="date" 
                    value={firstDate}
                    onChange={(e) => setFirstDate(e.target.value)}
                    className={inputClass} 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Notes</label>
              <textarea 
                rows={4} 
                placeholder="Any special information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${inputClass} resize-none pt-4`}
              />
            </div>
          </div>

          {/* SECTION 3: Previous Account Summary matching image_70a75528.png */}
          {selectedCustomer && (
            <div className={`p-8 rounded-[2.5rem] border border-amber-200 bg-amber-50/30 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500`}>
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">Previous account summary</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-amber-600/70 uppercase">Previous cell</p>
                  <p className="text-xl font-bold text-amber-900">৳ {getPreviousBalance(selectedCustomer).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-amber-600/70 uppercase">Given</p>
                  <p className="text-xl font-bold text-amber-900">৳ 0</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-amber-600/70 uppercase">Total remaining</p>
                  <p className="text-xl font-bold text-amber-900">৳ {getPreviousBalance(selectedCustomer).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Installment Schedule Preview matching image_bc642317.png */}
          {selectedCustomer && selectedProducts.length > 0 && installments.length > 0 && (
            <div className={`p-10 rounded-[2.5rem] border space-y-8 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shadow-sm">3</div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Installment Schedule</h2>
                </div>
              </div>

              <div className="space-y-3">
                {installments.map((inst) => (
                  <div 
                    key={`installment-${inst.id}`}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                        {inst.id}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{inst.date}</p>
                        <p className="text-[10px] font-bold text-blue-600">৳{inst.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                        {inst.status}
                      </span>
                      <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400">
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Footer Bars */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                  <span className="text-sm font-bold uppercase tracking-wider opacity-90">Total outstanding</span>
                  <span className="text-xl font-black">৳ {(calculateRemaining() + getPreviousBalance(selectedCustomer)).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                  <span className="text-sm font-bold uppercase tracking-wider opacity-90">Total installment</span>
                  <span className="text-xl font-black">৳ {calculateRemaining().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons matching Screenshot_2026-10-23_211657_305eabce.png footer */}
          <div className="space-y-4 pt-4 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleConfirm(false)}
                className="py-5 rounded-2xl bg-[#71a3f9] hover:bg-blue-600 text-white font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-blue-500/10 active:scale-[0.98]"
              >
                <Check className="w-6 h-6" /> Cell Confirm
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className="py-5 rounded-2xl bg-[#67c28d] hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
              >
                <Send className="w-5 h-5" /> Confirm + SMS
              </button>
            </div>
            <button
              onClick={() => setView('list')}
              className={`w-full py-5 rounded-2xl border font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer ${darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card matching screenshot: Sale / 1 */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xs'}`}>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {language === 'bn' ? 'বিক্রি' : 'Sale'}
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          {sales.length}
        </p>
      </div>

      {/* Action Buttons Bar matching screenshot: + New cell, Retail */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('form')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1a68ff] hover:bg-blue-600 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {language === 'bn' ? 'নতুন কিস্তি' : 'New cell'}
        </button>
        <button
          onClick={() => setIsRetailModalOpen(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#f97316] hover:bg-orange-600 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" /> {language === 'bn' ? 'খুচরা' : 'Retail'}
        </button>
      </div>

      {/* Search & Date Filter Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className={`flex-1 px-4 py-3 rounded-xl border flex items-center gap-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xs'}`}>
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'bn' ? 'গ্রাহক বা পণ্যের নাম...' : 'Customer or product name...'}
            className="bg-transparent text-sm w-full focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center">
          <DateRangePicker 
            startDate={startDate} 
            endDate={endDate} 
            onApply={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }} 
            darkMode={darkMode} 
            language={language}
          />
        </div>
      </div>

      {/* Content Area matching screenshot: image_b4d2fed9.png */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className={`p-16 rounded-3xl border text-center flex flex-col items-center justify-center space-y-3 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xs'
          }`}>
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 flex items-center justify-center">
              <ClipboardList className="w-8 h-8 opacity-60" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                No results found.
              </h3>
              <p className="text-xs text-slate-400">
                There are no sales matching your search.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div 
                key={`sale-${item.id}`} 
                className={`p-4 rounded-3xl border flex items-center justify-between group transition-all hover:shadow-md ${
                  darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-100 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'}`}>
                    <Package className="w-5 h-5 opacity-70" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {item.product}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {item.customer} · {item.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-blue-600">
                    ৳{item.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex justify-center pt-4">
          <p className="text-xs text-slate-400 font-medium italic">
            Showing {filtered.length} {filtered.length === 1 ? 'cell' : 'cells'}
          </p>
        </div>
      )}

      {/* Confirming Overlay */}
      {isConfirming && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 px-8 py-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-slate-900 dark:text-white">Wait...</p>
          </div>
        </div>
      )}
    </div>
  );
}
