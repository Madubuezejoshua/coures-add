import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

/** Horizontal scrollable tab strip with an underline active indicator. */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-1 overflow-x-auto border-b border-slate-200', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'group relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
              isActive ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                )}
              >
                {tab.count}
              </span>
            )}
            <span
              className={cn(
                'absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-all',
                isActive ? 'bg-brand-600' : 'bg-transparent'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/** Pill-style filter buttons (used in lists with status filters). */
export function FilterPills<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { id: T; label: string; count?: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const isActive = o.id === active;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'
            )}
          >
            {o.label}
            {typeof o.count === 'number' && <span className="ml-1.5 opacity-70">({o.count})</span>}
          </button>
        );
      })}
    </div>
  );
}
