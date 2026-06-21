import React from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  Send,
  AlertTriangle,
  XCircle,
  Globe,
  Pencil,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/cn';

export type Tone = 'slate' | 'brand' | 'amber' | 'emerald' | 'rose' | 'sky' | 'indigo';

const tones: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};

export const Badge: React.FC<{
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}> = ({ tone = 'slate', icon: Icon, className, children }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
      tones[tone],
      className
    )}
  >
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </span>
);

const STATUS_MAP: Record<string, { tone: Tone; label: string; icon: LucideIcon }> = {
  draft: { tone: 'slate', label: 'Draft', icon: Pencil },
  submitted: { tone: 'sky', label: 'Submitted', icon: Send },
  under_review: { tone: 'amber', label: 'Under Review', icon: Clock },
  needs_correction: { tone: 'amber', label: 'Needs Correction', icon: AlertTriangle },
  approved: { tone: 'indigo', label: 'Approved', icon: CheckCircle2 },
  ready_for_publishing: { tone: 'sky', label: 'Ready to Publish', icon: Send },
  published: { tone: 'emerald', label: 'Published', icon: Globe },
  rejected: { tone: 'rose', label: 'Rejected', icon: XCircle },
  // payout statuses
  pending: { tone: 'amber', label: 'Pending', icon: Clock },
  paid: { tone: 'emerald', label: 'Paid', icon: CheckCircle2 },
  // user statuses
  active: { tone: 'emerald', label: 'Active', icon: CheckCircle2 },
  suspended: { tone: 'rose', label: 'Suspended', icon: XCircle },
};

/** Maps a document / payout / user status string to a coloured badge. */
export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  const meta = STATUS_MAP[status] ?? { tone: 'slate' as Tone, label: status.replace(/_/g, ' '), icon: FileText };
  return (
    <Badge tone={meta.tone} icon={meta.icon} className={cn('capitalize', className)}>
      {meta.label}
    </Badge>
  );
};
