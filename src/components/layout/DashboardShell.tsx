import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { roleLabel } from '../../lib/roles';
import { NotificationBell } from '../NotificationBell';
import { MessagesButton } from '../messaging/MessagesButton';
import { cn } from '../../lib/cn';
import type { TabItem } from '../ui';

export function DashboardShell<T extends string>({
  title,
  subtitle,
  tabs,
  active,
  onChange,
  children,
}: {
  title: string;
  subtitle?: string;
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  children: React.ReactNode;
}) {
  const { displayName, role, registrationNumber, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (displayName || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const NavItems = ({ onPick }: { onPick?: () => void }) => (
    <nav className="space-y-1">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => { onChange(t.id); onPick?.(); }}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-brand-300 text-ink' : 'text-slate-500 hover:bg-cream-200 hover:text-ink'
            )}
          >
            {Icon && <Icon className="h-[18px] w-[18px]" />}
            <span className="flex-1 text-left">{t.label}</span>
            {typeof t.count === 'number' && (
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', isActive ? 'bg-ink/10 text-ink' : 'bg-cream-200 text-slate-500')}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const Brand = () => (
    <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-300">
        <Sparkles className="h-5 w-5 text-ink" />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink">DocReview</span>
    </button>
  );

  const UserCard = () => (
    <div className="rounded-2xl border border-cream-200 bg-white p-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-bold text-brand-300">{initials}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{displayName || 'User'}</p>
          <p className="truncate text-xs text-slate-400">{roleLabel(role)}{registrationNumber ? ` · ${registrationNumber}` : ''}</p>
        </div>
      </div>
      <button onClick={handleLogout} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r border-cream-200 bg-cream-100 p-5 lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto"><NavItems /></div>
        <UserCard />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-ink/40" />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col gap-6 bg-cream-100 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-cream-200"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto"><NavItems onPick={() => setMobileOpen(false)} /></div>
            <UserCard />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-cream-200 bg-cream/80 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-cream-200 lg:hidden"><Menu className="h-5 w-5" /></button>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">{title}</h1>
              {subtitle && <p className="hidden text-xs text-slate-400 sm:block">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessagesButton />
            <NotificationBell />
          </div>
        </header>

        {/* Mobile tab strip */}
        <div className="flex gap-1 overflow-x-auto border-b border-cream-200 bg-cream-100 px-3 py-2 lg:hidden">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => onChange(t.id)} className={cn('whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium', t.id === active ? 'bg-brand-300 text-ink' : 'text-slate-500')}>
              {t.label}
            </button>
          ))}
        </div>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
