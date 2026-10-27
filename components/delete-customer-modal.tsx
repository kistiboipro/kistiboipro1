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
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CustomerRecord } from '@/lib/customer-service';
import { Language } from '@/lib/i18n';

interface DeleteCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  onConfirm: () => void;
  darkMode: boolean;
  language: Language;
}

export function DeleteCustomerModal({ isOpen, onClose, customerName, onConfirm, darkMode, language }: DeleteCustomerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className={`w-full max-w-sm rounded-3xl shadow-2xl border p-6 animate-in zoom-in-95 duration-150 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
        <h2 className="text-xl font-bold mb-4">Delete customer?</h2>
        <p className="text-sm text-slate-500 mb-6">
          Once you delete {customerName}, the information cannot be recovered. To confirm, type the following number:
        </p>
        <div className="text-center text-3xl font-bold text-red-500 mb-6 tracking-widest">3600</div>
        <input type="text" placeholder="Enter the number." className={`w-full px-4 py-3 rounded-xl border mb-6 text-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold border cursor-pointer">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl font-bold bg-red-400 text-white cursor-pointer">Delete</button>
        </div>
      </div>
    </div>
  );
}
