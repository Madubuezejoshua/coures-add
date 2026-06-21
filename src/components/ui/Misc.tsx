import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { Tone } from './Badge';

export const Spinner: React.FC<{ className?: string; label?: string }> = ({ className, label }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
    <Loader2 className={cn('h-7 w-7 animate-spin text-brand-500', className)} />
    {label && <p className="text-sm">{label}</p>}
  </div>
);

const accentTones: Record<Tone, { ring: string; icon: string }> = {
  slate: { ring: 'bg-slate-100', icon: 'text-slate-500' },
  brand: { ring: 'bg-brand-50', icon: 'text-brand-600' },
  amber: { ring: 'bg-amber-50', icon: 'text-amber-600' },
  emerald: { ring: 'bg-emerald-50', icon: 'text-emerald-600' },
  rose: { ring: 'bg-rose-50', icon: 'text-rose-600' },
  sky: { ring: 'bg-sky-50', icon: 'text-sky-600' },
  indigo: { ring: 'bg-indigo-50', icon: 'text-indigo-600' },
};

export const StatCard: React.FC<{
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: Tone;
}> = ({ icon: Icon, label, value, hint, tone = 'brand' }) => {
  const a = accentTones[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', a.ring)}>
          <Icon className={cn('h-5 w-5', a.icon)} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
};

export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
      <Icon className="h-7 w-7 text-brand-500" />
    </span>
    <h3 className="mt-4 text-base font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/** Coloured contextual note box (info / warning / danger / success). */
export const Notice: React.FC<{
  tone?: 'info' | 'warning' | 'danger' | 'success';
  className?: string;
  children: React.ReactNode;
}> = ({ tone = 'info', className, children }) => {
  const map = {
    info: 'bg-brand-50 text-brand-800 ring-brand-200',
    warning: 'bg-amber-50 text-amber-800 ring-amber-200',
    danger: 'bg-rose-50 text-rose-800 ring-rose-200',
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  };
  return (
    <div className={cn('rounded-xl px-4 py-3 text-sm ring-1 ring-inset', map[tone], className)}>{children}</div>
  );
};
