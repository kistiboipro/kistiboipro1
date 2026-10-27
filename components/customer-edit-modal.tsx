'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Phone, 
  Camera,
  Plus,
  X,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { CustomerRecord, validateCustomer } from '@/lib/customer-service';
import { Language } from '@/lib/i18n';

interface CustomerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord;
  darkMode: boolean;
  language: Language;
}

export function CustomerEditModal({ isOpen, onClose, customer, darkMode, language }: CustomerEditModalProps) {
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

  // Photo & NID toggles (placeholders for real uploads)
  const [customerPhotoAdded, setCustomerPhotoAdded] = useState(false);
  const [nidAdded, setNidAdded] = useState(false);

  // Dynamic extra fields
  const [extraKeyFields, setExtraKeyFields] = useState<string[]>([]);
  const [extraFamilyFields, setExtraFamilyFields] = useState<string[]>([]);
  const [extraGuarantorFields, setExtraGuarantorFields] = useState<string[]>([]);

  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize form with customer data
  useEffect(() => {
    if (isOpen && customer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(customer.name || '');
      setPrimaryMobile(customer.primaryMobile || '');
      setSecondMobile(customer.secondMobile || '');
      setWorkplace(customer.workplace || '');
      setWorkAddress(customer.workAddress || '');
      setAddress(customer.address || '');
      setFamilyMemberName(customer.familyMemberName || '');
      setFamilyMemberMobile(customer.familyMemberMobile || '');
      setLandlordName(customer.landlordName || '');
      setLandlordMobile(customer.landlordMobile || '');
      
      if (customer.guarantors && customer.guarantors.length > 0) {
        setGuarantors(customer.guarantors);
      } else {
        setGuarantors([{ name: '', mobile: '', details: '', photoAdded: false }]);
      }

      setNidAdded(!!customer.hasNid);
      setFormErrors({});
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateCustomer(customer.type, {
      name,
      primaryMobile,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    // In a real app, we'd call a service here. 
    // Since this is a UI demo, we'll just close and show a success message.
    alert(`Customer "${name}" updated successfully!`);
    onClose();
  };

  const sectionClass = `border rounded-2xl p-6 sm:p-8 space-y-5 transition-colors ${
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
  }`;

  const inputClass = (error?: string) => `w-full px-4 py-3 rounded-xl border text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
    error
      ? 'border-red-400 bg-red-50/20'
      : darkMode
      ? 'bg-slate-800/80 border-slate-700 text-slate-100'
      : 'bg-slate-50 border-slate-200 text-slate-900'
  }`;

  const labelClass = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto pt-10">
      <div className={`w-full max-w-4xl rounded-3xl shadow-2xl border mb-10 animate-in zoom-in-95 duration-150 ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b border-inherit bg-inherit rounded-t-3xl">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-extrabold">Customer Edit</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          {/* SECTION 1: KEY INFORMATION */}
          <div className={sectionClass}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">KEY INFORMATION</h3>
            
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Photo Upload */}
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Customer photo</p>
                <button
                  type="button"
                  onClick={() => setCustomerPhotoAdded(!customerPhotoAdded)}
                  className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-[10px] transition-colors cursor-pointer ${
                    customerPhotoAdded
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600'
                      : 'border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <Camera className="w-5 h-5 opacity-70" />
                  <span>{customerPhotoAdded ? 'Photo added' : 'Add photo'}</span>
                </button>
              </div>

              {/* Name & Mobile */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className={labelClass}>Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass(formErrors.name)}
                  />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formErrors.name}</p>}
                </div>
                <div>
                  <label className={labelClass}>Primary Mobile <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={primaryMobile}
                      onChange={(e) => setPrimaryMobile(e.target.value)}
                      className={`${inputClass(formErrors.primaryMobile)} pl-10`}
                    />
                  </div>
                  {formErrors.primaryMobile && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formErrors.primaryMobile}</p>}
                </div>
              </div>
            </div>

            {/* Second Mobile */}
            <div>
              <label className={labelClass}>Second mobile</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={secondMobile}
                  onChange={(e) => setSecondMobile(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className={`${inputClass()} pl-10`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Example: 01712345678 (11 digits)</p>
            </div>

            {/* Workplace & Work Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Workplace</label>
                <input
                  type="text"
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  placeholder="Company/Organization Name"
                  className={inputClass()}
                />
              </div>
              <div>
                <label className={labelClass}>Work address</label>
                <input
                  type="text"
                  value={workAddress}
                  onChange={(e) => setWorkAddress(e.target.value)}
                  placeholder="Work address"
                  className={inputClass()}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className={labelClass}>Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Home address"
                rows={3}
                className={`${inputClass()} resize-none`}
              />
            </div>

            {/* Extra Fields */}
            {extraKeyFields.map((_, idx) => (
              <div key={`extra-key-${idx}`} className="flex items-center gap-2">
                <input type="text" className={inputClass()} placeholder={`Custom field #${idx + 1}`} />
                <button type="button" onClick={() => setExtraKeyFields(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setExtraKeyFields(prev => [...prev, ''])}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full border border-blue-600 dark:border-blue-400 flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </div>
              <span>Add input field</span>
            </button>
          </div>

          {/* SECTION 2: FAMILY INFORMATION */}
          <div className={sectionClass}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">FAMILY INFORMATION</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Family member&apos;s name</label>
                <input
                  type="text"
                  value={familyMemberName}
                  onChange={(e) => setFamilyMemberName(e.target.value)}
                  placeholder="Father / Mother / Brother / Sister"
                  className={inputClass()}
                />
              </div>
              <div>
                <label className={labelClass}>Member&apos;s mobile</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={familyMemberMobile}
                    onChange={(e) => setFamilyMemberMobile(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className={`${inputClass()} pl-10`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Landlord&apos;s name</label>
                <input
                  type="text"
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  className={inputClass()}
                />
              </div>
              <div>
                <label className={labelClass}>Landlord&apos;s mobile</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={landlordMobile}
                    onChange={(e) => setLandlordMobile(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className={`${inputClass()} pl-10`}
                  />
                </div>
              </div>
            </div>

            {/* Extra Fields */}
            {extraFamilyFields.map((_, idx) => (
              <div key={`extra-family-${idx}`} className="flex items-center gap-2">
                <input type="text" className={inputClass()} placeholder={`Custom field #${idx + 1}`} />
                <button type="button" onClick={() => setExtraFamilyFields(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setExtraFamilyFields(prev => [...prev, ''])}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full border border-blue-600 dark:border-blue-400 flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </div>
              <span>Add input field</span>
            </button>
          </div>

          {/* SECTION 3: GUARANTOR INFORMATION */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">GUARANTOR INFORMATION</h3>
              <button
                type="button"
                onClick={() => setGuarantors(prev => [...prev, { name: '', mobile: '', details: '', photoAdded: false }])}
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add guarantor</span>
              </button>
            </div>
            
            {guarantors.map((g, idx) => (
              <div key={`edit-guarantor-${idx}`} className={`space-y-6 ${idx > 0 ? 'pt-8 border-t border-inherit' : ''}`}>
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

                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Guarantor&apos;s photo</p>
                    <button
                      type="button"
                      onClick={() => {
                        const newG = [...guarantors];
                        newG[idx].photoAdded = !newG[idx].photoAdded;
                        setGuarantors(newG);
                      }}
                      className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-[10px] transition-colors cursor-pointer ${
                        g.photoAdded
                          ? 'border-blue-500 bg-blue-50/50 text-blue-600'
                          : 'border-slate-300 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <Camera className="w-5 h-5 opacity-70" />
                      <span>{g.photoAdded ? 'Photo added' : 'Add photo'}</span>
                    </button>
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <label className={labelClass}>Guarantor&apos;s name</label>
                      <input
                        type="text"
                        value={g.name}
                        onChange={(e) => {
                          const newG = [...guarantors];
                          newG[idx].name = e.target.value;
                          setGuarantors(newG);
                        }}
                        className={inputClass()}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Guarantor&apos;s mobile</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={g.mobile}
                          onChange={(e) => {
                            const newG = [...guarantors];
                            newG[idx].mobile = e.target.value;
                            setGuarantors(newG);
                          }}
                          placeholder="017XXXXXXXX"
                          className={`${inputClass()} pl-10`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Guarantor details</label>
                  <textarea
                    value={g.details}
                    onChange={(e) => {
                      const newG = [...guarantors];
                      newG[idx].details = e.target.value;
                      setGuarantors(newG);
                    }}
                    placeholder="Address, relationship, etc."
                    rows={3}
                    className={`${inputClass()} resize-none`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 4: NID */}
          <div className={sectionClass}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">NATIONAL IDENTITY CARD (NID)</h3>
            <button
              type="button"
              onClick={() => setNidAdded(!nidAdded)}
              className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-[10px] transition-colors cursor-pointer ${
                nidAdded
                  ? 'border-blue-500 bg-blue-50/50 text-blue-600'
                  : 'border-slate-300 dark:border-slate-700 text-slate-400'
              }`}
            >
              <Camera className="w-5 h-5 opacity-70" />
              <span>{nidAdded ? 'NID added' : 'Add NID'}</span>
            </button>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-6 pb-4">
            <button type="submit" className="w-full py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer">
              Update
            </button>
            <button type="button" onClick={onClose} className={`w-full py-4 rounded-xl font-bold border transition-all cursor-pointer ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
