'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Package,
  AlertTriangle,
  Check,
  Edit3,
  Trash2,
  Store,
  Tag,
  DollarSign,
  MoreVertical,
  Eye,
  PackagePlus,
  ArrowLeftRight,
  X,
  TrendingUp,
  Boxes,
  Building2,
  FileText,
  AlertCircle,
  History,
  Info
} from 'lucide-react';
import { Language } from '@/lib/i18n';
import {
  StockProduct,
  isLowStock,
  validateProductData,
  filterStockProducts,
  calculateStockSummary,
  applyStockAdd,
  applyStockExchange,
} from '@/lib/stock-service';

interface StockViewProps {
  darkMode: boolean;
  language: Language;
}

const CATEGORY_OPTIONS = [
  'Led',
  'mobile',
  'laptop',
  'electronics',
  'television',
  'refrigerator',
  'fan',
  'microwave oven',
  'audio system',
  'furniture',
];

const DEALER_OPTIONS = [
  'Rowsanara',
  'Rahman Traders',
  'Walton Hi-Tech',
  'Minister Group',
  'Jamuna Electronics',
  'Singer Bangladesh',
  'RFL Electronics',
  'Samsung BD Distributor',
];

const INITIAL_PRODUCTS: StockProduct[] = [
  {
    id: 1,
    name: 'Led 32"',
    category: 'Led',
    description: '32 inch smart Android LED TV with framed border and HD resolution',
    purchasePrice: 17500,
    setSellingPrice: true,
    sellingPrice: 20500,
    dealerName: 'Rowsanara',
    quantity: 199,
    forRetailSale: false,
    createdAt: '2026-10-18',
    movements: [
      {
        id: 'mov-1',
        productId: 1,
        type: 'add',
        quantity: 199,
        date: '2026-10-18',
        note: 'Opening stock batch from Rowsanara',
      },
    ],
  },
  {
    id: 2,
    name: 'Samsung Galaxy A55',
    category: 'mobile',
    description: '8GB RAM, 128GB ROM, Awesome Iceblue with 5000mAh battery',
    purchasePrice: 38500,
    setSellingPrice: true,
    sellingPrice: 42999,
    dealerName: 'Samsung BD Distributor',
    quantity: 12,
    forRetailSale: true,
    createdAt: '2026-10-20',
  },
  {
    id: 3,
    name: 'Walton Refrigerator 220L',
    category: 'refrigerator',
    description: 'Direct cool inverter refrigerator with tempered glass',
    purchasePrice: 32000,
    setSellingPrice: true,
    sellingPrice: 36500,
    dealerName: 'Walton Hi-Tech',
    quantity: 3, // Low stock demo (<5)
    forRetailSale: false,
    createdAt: '2026-10-21',
  },
  {
    id: 4,
    name: 'Vision Ceiling Fan 56"',
    category: 'fan',
    description: 'High speed energy efficient 56 inch ceiling fan',
    purchasePrice: 2800,
    setSellingPrice: true,
    sellingPrice: 3400,
    dealerName: 'RFL Electronics',
    quantity: 24,
    forRetailSale: true,
    createdAt: '2026-10-22',
  },
];

export function StockView({ darkMode, language }: StockViewProps) {
  // Navigation view: 'list' | 'add'
  const [view, setView] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);

  // Products state
  const [products, setProducts] = useState<StockProduct[]>(INITIAL_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<StockProduct | null>(null);

  // Active popup menu product ID (tap product / 3 dots)
  const [activeMenuProductId, setActiveMenuProductId] = useState<string | number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Modals for menu actions
  const [detailsProduct, setDetailsProduct] = useState<StockProduct | null>(null);
  const [addStockProduct, setAddStockProduct] = useState<StockProduct | null>(null);
  const [exchangeStockProduct, setExchangeStockProduct] = useState<StockProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<StockProduct | null>(null);

  // Modal input states
  const [addStockQty, setAddStockQty] = useState('10');
  const [addStockNote, setAddStockNote] = useState('');
  
  const [exchangeType, setExchangeType] = useState<'exchange' | 'damage' | 'return'>('exchange');
  const [exchangeQty, setExchangeQty] = useState('1');
  const [exchangeReason, setExchangeReason] = useState('');
  const [exchangeError, setExchangeError] = useState('');

  // Form states matching screenshot
  const [forRetailSale, setForRetailSale] = useState(false);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [setSellingPrice, setSetSellingPrice] = useState(false);
  const [sellingPrice, setSellingPriceState] = useState('');
  const [dealerName, setDealerName] = useState('');
  const [isDealerOpen, setIsDealerOpen] = useState(false);
  const [stockQuantity, setStockQuantity] = useState('0');

  // Form errors & notification
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close popup menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuProductId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Reset Add/Edit form
  const resetForm = () => {
    setForRetailSale(false);
    setProductName('');
    setCategory('');
    setDescription('');
    setPurchasePrice('');
    setSetSellingPrice(false);
    setSellingPriceState('');
    setDealerName('');
    setStockQuantity('0');
    setEditingProduct(null);
    setFormErrors({});
  };

  const handleOpenAddForm = () => {
    resetForm();
    setView('add');
    setActiveMenuProductId(null);
  };

  const handleOpenEditForm = (item: StockProduct) => {
    setEditingProduct(item);
    setForRetailSale(item.forRetailSale || false);
    setProductName(item.name || '');
    setCategory(item.category || '');
    setDescription(item.description || '');
    setPurchasePrice(item.purchasePrice ? String(item.purchasePrice) : '');
    setSetSellingPrice(item.setSellingPrice || false);
    setSellingPriceState(item.sellingPrice ? String(item.sellingPrice) : '');
    setDealerName(item.dealerName || '');
    setStockQuantity(String(item.quantity ?? 0));
    setFormErrors({});
    setView('add');
    setActiveMenuProductId(null);
  };

  const handleCancel = () => {
    resetForm();
    setView('list');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateProductData({
      name: productName,
      purchasePrice,
      quantity: stockQuantity,
      setSellingPrice,
      sellingPrice,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    // Simulate server delay as shown in the video ("Wait...")
    setTimeout(() => {
      const parsedPurchasePrice = parseFloat(purchasePrice) || 0;
      const parsedQty = parseInt(stockQuantity, 10) || 0;
      const parsedSellingPrice = setSellingPrice ? parseFloat(sellingPrice) || 0 : undefined;

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingProduct.id
              ? {
                  ...item,
                  name: productName.trim(),
                  category: category.trim() || 'General',
                  description: description.trim(),
                  purchasePrice: parsedPurchasePrice,
                  setSellingPrice,
                  sellingPrice: parsedSellingPrice,
                  dealerName: dealerName.trim(),
                  quantity: parsedQty,
                  forRetailSale,
                }
              : item
          )
        );
        showToast(language === 'bn' ? 'পণ্য সফলভাবে আপডেট করা হয়েছে!' : 'Product updated successfully!');
      } else {
        setProducts((prev) => {
          const nextId = prev.length > 0 ? Math.max(...prev.map((p) => Number(p.id) || 0)) + 1 : 1;
          const newProduct: StockProduct = {
            id: nextId,
            name: productName.trim(),
            category: category.trim() || 'general',
            description: description.trim(),
            purchasePrice: parsedPurchasePrice,
            setSellingPrice,
            sellingPrice: parsedSellingPrice,
            dealerName: dealerName.trim(),
            quantity: parsedQty,
            forRetailSale,
            createdAt: new Date().toISOString().split('T')[0],
          };
          return [newProduct, ...prev];
        });
        showToast(
          language === 'bn'
            ? 'নতুন পণ্য সফলভাবে স্টকে যুক্ত করা হয়েছে!'
            : 'Product added successfully to stock!'
        );
      }

      setIsSubmitting(false);
      resetForm();
      setView('list');
    }, 1500);
  };

  // Stock Add action execution
  const handleConfirmStockAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStockProduct) return;
    const qty = parseInt(addStockQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    const updated = applyStockAdd(addStockProduct, qty, addStockNote);
    setProducts((prev) => prev.map((p) => (p.id === addStockProduct.id ? updated : p)));
    showToast(
      language === 'bn'
        ? `+${qty} পিস স্টক যোগ করা হয়েছে (${addStockProduct.name})`
        : `Added ${qty} units to ${addStockProduct.name}. New stock: ${updated.quantity}`
    );
    setAddStockProduct(null);
    setAddStockQty('10');
    setAddStockNote('');
  };

  // Stock Exchange action execution
  const handleConfirmStockExchange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exchangeStockProduct) return;
    setExchangeError('');
    const qty = parseInt(exchangeQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setExchangeError('Please enter a valid quantity greater than 0');
      return;
    }

    const result = applyStockExchange(exchangeStockProduct, qty, exchangeType, exchangeReason);
    if (!result.success || !result.updatedProduct) {
      setExchangeError(result.error || 'Failed to exchange stock');
      return;
    }

    setProducts((prev) => prev.map((p) => (p.id === exchangeStockProduct.id ? result.updatedProduct! : p)));
    showToast(
      language === 'bn'
        ? `${qty} পিস স্টক এক্সচেঞ্জ সম্পন্ন হয়েছে (${exchangeStockProduct.name})`
        : `Exchanged/deducted ${qty} units from ${exchangeStockProduct.name}. Remaining: ${result.updatedProduct.quantity}`
    );
    setExchangeStockProduct(null);
    setExchangeQty('1');
    setExchangeReason('');
  };

  // Delete product action execution
  const handleConfirmDelete = () => {
    if (!deleteProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
    showToast(`Deleted "${deleteProduct.name}" from stock.`);
    setDeleteProduct(null);
  };

  const filteredProducts = filterStockProducts(products, search, selectedCategory);
  const summary = calculateStockSummary(products);

  // If view is 'add', render the exact Add/Edit Product form from the screenshots
  if (view === 'add') {
    return (
      <div className="max-w-3xl mx-auto py-2 px-1 sm:px-4">
        {/* Breadcrumb Navigation matching screenshot: Stock / New product */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-5">
          <button
            type="button"
            onClick={handleCancel}
            className="hover:text-blue-600 transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            {language === 'bn' ? 'স্টক' : 'Stock'}
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">
            {editingProduct
              ? language === 'bn'
                ? 'পণ্য এডিট'
                : 'Edit product'
              : language === 'bn'
              ? 'নতুন পণ্য'
              : 'New product'}
          </span>
        </div>

        {/* Header Title & Subtitle matching screenshot */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {editingProduct
              ? language === 'bn'
                ? 'পণ্য এডিট করুন'
                : 'Edit product'
              : language === 'bn'
              ? 'নতুন পণ্য যোগ করুন'
              : 'Add new product'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'পণ্যের তথ্য পূরণ করুন এবং স্টকে যোগ করুন।'
              : 'Fill in the product information and add to stock.'}
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
            {/* 1. For retail sale Card */}
            <div
              className={`border rounded-xl p-4 flex items-center justify-between transition-colors ${
                darkMode
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {language === 'bn' ? 'খুচরা বিক্রয়ের জন্য' : 'For retail sale'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'bn'
                    ? 'চালু করলে, এই পণ্যটি শুধুমাত্র "খুচরা" তে প্রদর্শিত হবে'
                    : 'If turned on, this product will only appear in "Retail"'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={forRetailSale}
                onClick={() => setForRetailSale(!forRetailSale)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  forRetailSale
                    ? 'bg-blue-600'
                    : darkMode
                    ? 'bg-slate-700'
                    : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    forRetailSale ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 2. Product Name * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'পণ্যের নাম' : 'Product Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  if (formErrors.name) {
                    setFormErrors((prev) => ({ ...prev, name: '' }));
                  }
                }}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: স্যামসাং গ্যালাক্সি A55'
                    : 'For example: Samsung Galaxy A55'
                }
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

            {/* 3. Categories with dropdown selector */}
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
                      ? 'যেমন: মোবাইল, ল্যাপটপ...'
                      : 'For example: mobile, laptop...'
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
                    {language === 'bn' ? 'ক্যাটেগরি তালিকা' : 'Popular Categories'}
                  </div>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={`cat-option-${cat}`}
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

            {/* 4. Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'বিবরণ' : 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'পণ্যটি সম্পর্কে একটি সংক্ষিপ্ত বিবরণ লিখুন...'
                    : 'Write a brief description about the product...'
                }
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* 5. Purchase price (৳) * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'ক্রয় মূল্য (৳)' : 'Purchase price (৳)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={purchasePrice}
                onChange={(e) => {
                  setPurchasePrice(e.target.value);
                  if (formErrors.purchasePrice) {
                    setFormErrors((prev) => ({ ...prev, purchasePrice: '' }));
                  }
                }}
                placeholder="0.00"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  formErrors.purchasePrice
                    ? 'border-red-400 bg-red-50/20'
                    : darkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
              {formErrors.purchasePrice && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.purchasePrice}
                </p>
              )}
            </div>

            {/* 6. Set selling price Card */}
            <div
              className={`border rounded-xl p-4 flex items-center justify-between transition-colors ${
                darkMode
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {language === 'bn' ? 'বিক্রয় মূল্য নির্ধারণ করুন' : 'Set selling price'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'bn'
                    ? 'চালু করলে, বিক্রয়ের সময় এই মূল্য স্বয়ংক্রিয়ভাবে সেট হয়ে যাবে (সেখানে পরিবর্তন করা যাবে)'
                    : 'If turned on, this price will be automatically set at the time of sale (can be changed there)'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={setSellingPrice}
                onClick={() => setSetSellingPrice(!setSellingPrice)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  setSellingPrice
                    ? 'bg-blue-600'
                    : darkMode
                    ? 'bg-slate-700'
                    : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    setSellingPrice ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Dynamic Selling Price input when toggle is ON */}
            {setSellingPrice && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-150">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'bn' ? 'বিক্রয় মূল্য (৳)' : 'Selling price (৳)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={sellingPrice}
                  onChange={(e) => {
                    setSellingPriceState(e.target.value);
                    if (formErrors.sellingPrice) {
                      setFormErrors((prev) => ({ ...prev, sellingPrice: '' }));
                    }
                  }}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    formErrors.sellingPrice
                      ? 'border-red-400 bg-red-50/20'
                      : darkMode
                      ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                {formErrors.sellingPrice && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.sellingPrice}
                  </p>
                )}
              </div>
            )}

            {/* 7. Dealer Name with dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'ডিলারের নাম' : 'Dealer Name'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  onFocus={() => setIsDealerOpen(true)}
                  placeholder={
                    language === 'bn'
                      ? 'যেমন: রহমান ট্রেডার্স'
                      : 'For example: Rahman Traders'
                  }
                  className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsDealerOpen(!isDealerOpen)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isDealerOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Dealer suggestions */}
              {isDealerOpen && (
                <div
                  className={`absolute z-30 left-0 right-0 mt-1.5 border rounded-xl shadow-lg py-1.5 max-h-52 overflow-y-auto ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {language === 'bn' ? 'তালিকাভুক্ত ডিলার' : 'Registered Dealers'}
                  </div>
                  {DEALER_OPTIONS.map((dealer) => (
                    <button
                      key={`dealer-option-${dealer}`}
                      type="button"
                      onClick={() => {
                        setDealerName(dealer);
                        setIsDealerOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        dealerName === dealer
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <span>{dealer}</span>
                      {dealerName === dealer && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Stock quantity * with Low stock warning */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'স্টক পরিমাণ' : 'Stock quantity'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => {
                  setStockQuantity(e.target.value);
                  if (formErrors.quantity) {
                    setFormErrors((prev) => ({ ...prev, quantity: '' }));
                  }
                }}
                placeholder="0"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  formErrors.quantity
                    ? 'border-red-400 bg-red-50/20'
                    : darkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
              {formErrors.quantity && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.quantity}
                </p>
              )}
              {/* Warning label matching screenshot */}
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500 font-medium mt-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'কম স্টক — ৫ এর নিচে হলে সতর্কতা দেখাবে'
                    : 'Low stock — will show warning if below 5'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              <button
                type="submit"
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all text-center cursor-pointer shadow-sm ${
                  isSubmitting 
                    ? 'bg-blue-600/70 text-white cursor-not-allowed' 
                    : 'bg-[#1a68ff] hover:bg-blue-600 active:bg-blue-700 text-white'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{language === 'bn' ? 'অপেক্ষা করুন...' : 'Wait...'}</span>
                  </>
                ) : (
                  editingProduct
                    ? language === 'bn'
                      ? 'পণ্য আপডেট করুন'
                      : 'Update product'
                    : language === 'bn'
                    ? 'পণ্য যোগ করুন'
                    : 'Add product'
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm border transition-all text-center cursor-pointer ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
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

  // Stock List View matching screenshot: image_3b22b019.png
  return (
    <div className="space-y-6">
      {/* Toast message */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Card matching screenshot: Stock / 0 */}
      <div
        className={`p-5 rounded-2xl border ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          {language === 'bn' ? 'স্টক' : 'Stock'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {products.length}
        </p>
      </div>

      {/* Action Bar with New Product button, Search, and All Categories */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          onClick={handleOpenAddForm}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1a68ff] hover:bg-blue-600 text-white shadow-xs flex items-center justify-center gap-2 w-fit transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {language === 'bn' ? 'নতুন পণ্য' : 'New product'}
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`flex-1 sm:w-80 px-3.5 py-2 rounded-xl border flex items-center gap-2.5 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'bn' ? 'পণ্য খুঁজুন...' : 'Find the product...'}
              className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
              className={`px-4 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              <span className="capitalize">
                {selectedCategory === 'all'
                  ? language === 'bn'
                    ? 'সকল ক্যাটেগরি'
                    : 'All categories'
                  : selectedCategory}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {isCategoryFilterOpen && (
              <div
                className={`absolute right-0 mt-1.5 w-48 border rounded-xl shadow-lg py-1 z-20 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setIsCategoryFilterOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {language === 'bn' ? 'সকল ক্যাটেগরি' : 'All categories'}
                </button>
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={`cat-filter-${cat}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsCategoryFilterOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors capitalize"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((item) => {
          const isMenuOpen = activeMenuProductId === item.id;
          const displayPrice = item.sellingPrice || item.purchasePrice;

          return (
            <div
              key={`product-${item.id}`}
              className={`rounded-2xl border transition-all duration-150 relative cursor-pointer group ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-100 shadow-xs hover:shadow-sm'
              }`}
              onClick={() => {
                setActiveMenuProductId(isMenuOpen ? null : item.id);
              }}
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Package className="w-6 h-6 opacity-70" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm font-semibold text-slate-400">
                      ৳ {displayPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                    {item.quantity}
                  </div>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuProductId(isMenuOpen ? null : item.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute right-0 top-8 w-48 rounded-2xl shadow-2xl border py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 ${
                          darkMode
                            ? 'bg-slate-900 border-slate-800 text-slate-200'
                            : 'bg-white border-slate-100 text-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuProductId(null);
                            setDetailsProduct(item);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer font-medium"
                        >
                          <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                          <span>Product Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuProductId(null);
                            setAddStockProduct(item);
                            setAddStockQty('10');
                            setAddStockNote('');
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer font-medium"
                        >
                          <PackagePlus className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                          <span>Stock Add</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuProductId(null);
                            setExchangeStockProduct(item);
                            setExchangeType('exchange');
                            setExchangeQty('1');
                            setExchangeReason('');
                            setExchangeError('');
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer font-medium"
                        >
                          <ArrowLeftRight className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                          <span>Stock Exchange</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuProductId(null);
                            handleOpenEditForm(item);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer font-medium"
                        >
                          <Edit3 className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuProductId(null);
                            setDeleteProduct(item);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 transition-colors cursor-pointer font-medium"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer count matching screenshot: Showing 1 product */}
      <div className="text-center py-6 text-xs text-slate-400 font-medium">
        {language === 'bn'
          ? `মোট ${filteredProducts.length} টি পণ্য দেখানো হচ্ছে`
          : `Showing ${filteredProducts.length} product`}
      </div>

      {/* ============================================================== */}
      {/* 1. PRODUCT DETAILS MODAL */}
      {/* ============================================================== */}
      {detailsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-3xl shadow-2xl border p-6 space-y-5 animate-in zoom-in-95 duration-150 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">{detailsProduct.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{detailsProduct.category || 'General'}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailsProduct(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial & Inventory Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px]">Current Stock</span>
                <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                  {detailsProduct.quantity} units
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px]">Purchase Price</span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  ৳ {detailsProduct.purchasePrice.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px]">Selling Price</span>
                <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                  ৳ {(detailsProduct.sellingPrice || detailsProduct.purchasePrice).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-amber-500" /> Dealer / Supplier
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {detailsProduct.dealerName || 'Rowsanara'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-500" /> Channel
                </span>
                <span className="font-semibold">
                  {detailsProduct.forRetailSale ? 'Retail only' : 'General & Retail'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-indigo-500" /> Inventory Valuation
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ৳ {(detailsProduct.purchasePrice * detailsProduct.quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Description */}
            {detailsProduct.description && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold block text-slate-500 mb-1">Description:</span>
                <p>{detailsProduct.description}</p>
              </div>
            )}

            {/* Stock Movement History */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Recent Stock Movements
              </h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {detailsProduct.movements && detailsProduct.movements.length > 0 ? (
                  detailsProduct.movements.map((mov) => (
                    <div
                      key={`movement-${mov.id}`}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                          {mov.type}: {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} units
                        </span>
                        <p className="text-[11px] text-slate-400">{mov.note || mov.dealerOrReason}</p>
                      </div>
                      <span className="text-[11px] text-slate-400">{mov.date}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No movement recorded yet.</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const p = detailsProduct;
                  setDetailsProduct(null);
                  setAddStockProduct(p);
                  setAddStockQty('10');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PackagePlus className="w-4 h-4" /> Add Stock
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = detailsProduct;
                  setDetailsProduct(null);
                  handleOpenEditForm(p);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. STOCK ADD MODAL */}
      {/* ============================================================== */}
      {addStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md rounded-3xl shadow-2xl border p-6 space-y-4 animate-in zoom-in-95 duration-150 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Stock Add</h3>
                  <p className="text-xs text-slate-500">{addStockProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setAddStockProduct(null)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStockAdd} className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">Current Stock Quantity:</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                  {addStockProduct.quantity} units
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quantity to Add <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={addStockQty}
                  onChange={(e) => setAddStockQty(e.target.value)}
                  placeholder="Enter quantity"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                />

                {/* Quick Add Buttons */}
                <div className="flex items-center gap-2 mt-2">
                  {[5, 10, 20, 50, 100].map((num) => (
                    <button
                      key={`quick-add-${num}`}
                      type="button"
                      onClick={() => setAddStockQty(String(num))}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Note / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={addStockNote}
                  onChange={(e) => setAddStockNote(e.target.value)}
                  placeholder="e.g., Invoice #1024 or Dealer Shipment"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddStockProduct(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1a68ff] hover:bg-blue-600 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PackagePlus className="w-4 h-4" /> Add to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. STOCK EXCHANGE MODAL */}
      {/* ============================================================== */}
      {exchangeStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md rounded-3xl shadow-2xl border p-6 space-y-4 animate-in zoom-in-95 duration-150 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Stock Exchange</h3>
                  <p className="text-xs text-slate-500">{exchangeStockProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setExchangeStockProduct(null)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStockExchange} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Available Stock:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {exchangeStockProduct.quantity} units
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Exchange / Movement Type
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'exchange', label: 'Exchange' },
                    { id: 'return', label: 'Return' },
                    { id: 'damage', label: 'Defect' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setExchangeType(t.id as any)}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition-colors cursor-pointer ${
                        exchangeType === t.id
                          ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={exchangeStockProduct.quantity}
                  value={exchangeQty}
                  onChange={(e) => setExchangeQty(e.target.value)}
                  placeholder="Quantity to exchange"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reason / Dealer / Customer Note
                </label>
                <input
                  type="text"
                  value={exchangeReason}
                  onChange={(e) => setExchangeReason(e.target.value)}
                  placeholder="e.g. Swapped model with customer or dealer credit"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              {exchangeError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {exchangeError}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setExchangeStockProduct(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4" /> Confirm Exchange
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-3xl shadow-2xl border p-6 space-y-4 animate-in zoom-in-95 duration-150 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">Delete Product?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <span className="font-bold">{deleteProduct.name}</span> from your stock? All its records and inventory count will be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteProduct(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
