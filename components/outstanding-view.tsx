'use client';

import React from 'react';
import { Language } from '@/lib/i18n';
import { InstallmentCalendarTracker } from '@/components/installment-calendar';

interface OutstandingViewProps {
  darkMode: boolean;
  language: Language;
}

export function OutstandingView({ darkMode, language }: OutstandingViewProps) {
  return (
    <div className="space-y-6">
      {/* Outstanding dues & calendar tracker */}
      <InstallmentCalendarTracker darkMode={darkMode} language={language} />
    </div>
  );
}
