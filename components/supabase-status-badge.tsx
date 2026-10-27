'use client';

import React from 'react';
import { Database, CheckCircle2 } from 'lucide-react';
import { SUPABASE_PROJECT_ID } from '@/lib/supabase-service';

export function SupabaseStatusBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shadow-xs ${className}`}
      title={`Supabase Connected (Project: ${SUPABASE_PROJECT_ID})`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span className="font-mono text-[11px] tracking-tight">Supabase: {SUPABASE_PROJECT_ID.slice(0, 8)}...</span>
      <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5 shrink-0" />
    </div>
  );
}
