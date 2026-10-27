'use client';

import React from 'react';
import { 
  ChevronLeft, 
  Trash2, 
  Pencil, 
  User, 
  MapPin, 
  Phone, 
  CreditCard, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { CustomerRecord } from '@/lib/customer-service';
import { Language } from '@/lib/i18n';
import { SaleDetailsModal } from './sale-details-modal';
import { CustomerEditModal } from './customer-edit-modal';
import { DeleteCustomerModal } from './delete-customer-modal';

interface CustomerDetailViewProps {
  customer: CustomerRecord;
  onBack: () => void;
  darkMode: boolean;
  language: Language;
}

export function CustomerDetailView({ customer, onBack, darkMode, language }: CustomerDetailViewProps) {
  const [isSaleModalOpen, setIsSaleModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'cell' | 'installments' | 'history'>('cell');
  const [viewMode, setViewMode] = React.useState<'details' | 'profile'>('details');

  return (
    <div className="max-w-6xl mx-auto py-2 px-1 sm:px-4 space-y-6">
      <SaleDetailsModal 
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        darkMode={darkMode}
        language={language}
      />
      <CustomerEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
        darkMode={darkMode}
        language={language}
      />
      <DeleteCustomerModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        customerName={customer.name}
        onConfirm={() => { alert('Deleted'); setIsDeleteModalOpen(false); }}
        darkMode={darkMode}
        language={language}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={viewMode === 'profile' ? () => setViewMode('details') : onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          Go back
        </button>
        <div className="flex items-center gap-3">
          <button 
            className="p-2 text-slate-400 hover:text-red-500 cursor-pointer"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            className="p-2 text-slate-400 hover:text-blue-500 cursor-pointer"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button 
            className={`p-2 rounded-full cursor-pointer transition-colors ${viewMode === 'profile' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            onClick={() => setViewMode(viewMode === 'profile' ? 'details' : 'profile')}
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'profile' ? (
        /* Profile View matching image_bc6c00f9.png */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className={`p-6 rounded-3xl border flex items-center gap-5 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className={`w-20 h-20 rounded-2xl ${customer.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-2xl`}>
                {customer.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{customer.name}</h2>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-900/50">
                  {customer.type === 'Cash-remaining' ? 'Cash-remaining customer' : customer.type}
                </span>
              </div>
           </div>

           <div className={`max-w-md p-6 rounded-3xl border space-y-6 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">KEY INFORMATION</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1">Mobile number</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{customer.primaryMobile}</p>
                </div>
                
                <div className="pt-4 border-t border-inherit">
                  <p className="text-xs font-semibold text-slate-400 mb-1">Customer No.</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{customer.id}</p>
                </div>

                {customer.guarantors && customer.guarantors.length > 0 && (
                  <div className="pt-4 border-t border-inherit space-y-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Guarantors</p>
                    {customer.guarantors.map((g, idx) => (
                      <div key={`detail-guarantor-${idx}`} className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400">Guarantor #{idx + 1}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{g.name}</p>
                        <p className="text-xs text-slate-500">{g.mobile}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
           </div>
        </div>
      ) : (
        /* Original Details View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Left Column: Customer Profile Summary */}
          <div className={`lg:col-span-1 p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl ${customer.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xl`}>
                {customer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{customer.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400"># {customer.id}</p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                {customer.primaryMobile}
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                {customer.address}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-8">
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Purchase</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">৳30,000</p>
              </div>
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-emerald-950/40' : 'bg-emerald-50'}`}>
                <p className="text-[10px] text-emerald-600 uppercase font-bold">Total paid</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1">৳30,000</p>
              </div>
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-amber-950/40' : 'bg-amber-50'}`}>
                <p className="text-[10px] text-amber-600 uppercase font-bold">Total outstanding</p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-1">৳0</p>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-500">Overall progress</span>
                <span className="font-bold text-slate-900 dark:text-white">100%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="w-full h-full rounded-full bg-blue-600" />
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`flex p-1 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <button 
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${activeTab === 'cell' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 font-medium'}`}
                onClick={() => setActiveTab('cell')}
              >
                Cell List
              </button>
              <button 
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${activeTab === 'installments' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 font-medium'}`}
                onClick={() => setActiveTab('installments')}
              >
                All installments
              </button>
              <button 
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 font-medium'}`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>

            {activeTab === 'cell' && (
              <button 
                className={`w-full text-left p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                onClick={() => setIsSaleModalOpen(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Led 32&quot;</h3>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Sep 19, 2026</p>
                <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
                  <p>Selling price: <span className="font-semibold text-slate-900 dark:text-white">৳30,000</span></p>
                  <p>Advance: <span className="font-semibold text-slate-900 dark:text-white">৳30,000</span></p>
                  <p>Installment: <span className="font-semibold text-slate-900 dark:text-white">0 / 0</span></p>
                </div>
              </button>
            )}

            {activeTab === 'installments' && (
              <div className="space-y-3">
                {[
                  { id: 1, date: 'Oct 19, 2026', amount: '৳5,000', status: 'Paid', method: 'Cash' },
                  { id: 2, date: 'Nov 19, 2026', amount: '৳5,000', status: 'Pending', method: '-' },
                  { id: 3, date: 'Dec 19, 2026', amount: '৳5,000', status: 'Pending', method: '-' },
                ].map((inst) => (
                  <div key={`detail-inst-${inst.id}`} className={`p-4 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xs'}`}>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{inst.date}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">{inst.method === '-' ? 'Upcoming' : `Paid via ${inst.method}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{inst.amount}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inst.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                        {inst.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                {[
                  { id: 1, date: 'Sep 19, 2026', event: 'Sale Created', details: 'Led 32&quot; - ৳30,000' },
                  { id: 2, date: 'Sep 19, 2026', event: 'Advance Payment', details: '৳30,000 received' },
                  { id: 3, date: 'Oct 18, 2026', event: 'Customer Created', details: 'Added to system' },
                ].map((log) => (
                  <div key={`detail-history-${log.id}`} className={`p-4 rounded-2xl border flex items-start gap-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xs'}`}>
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{log.event}</p>
                        <span className="text-[10px] text-slate-400">{log.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
