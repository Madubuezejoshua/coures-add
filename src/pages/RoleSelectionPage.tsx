import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Pencil, ShieldCheck, Globe, BookOpen, ArrowRight, type LucideIcon } from 'lucide-react';
import { PUBLIC_ROLES, ROLE_META, type PublicRole } from '../lib/roles';

const ICONS: Record<PublicRole, LucideIcon> = {
  editor: Pencil,
  reviewer: ShieldCheck,
  publisher: Globe,
  user: BookOpen,
};

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-14">
        <Link to="/" className="mb-10 flex items-center justify-center gap-2.5 text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-300">
            <Sparkles className="h-5 w-5 text-ink" />
          </span>
          <span className="text-xl font-extrabold tracking-tight">DocReview</span>
        </Link>

        <div className="mx-auto mb-10 max-w-2xl text-center animate-fade-up">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Join <span className="serif-accent text-brand-600">DocReview</span>
          </h1>
          <p className="mt-3 text-slate-500">Choose how you'd like to use the platform. You can request a different role later from an administrator.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {PUBLIC_ROLES.map((role, i) => {
            const meta = ROLE_META[role];
            const Icon = ICONS[role];
            return (
              <button
                key={role}
                onClick={() => navigate(`/signup/${role}`)}
                style={{ animationDelay: `${i * 0.07}s` }}
                className="group flex animate-fade-up flex-col items-start rounded-2xl border border-cream-200 bg-white p-6 text-left shadow-card transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-hover"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 transition-colors group-hover:bg-brand-300 group-hover:text-ink">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{meta.label}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-500">{meta.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
