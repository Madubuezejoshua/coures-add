import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, PenLine, ShieldCheck, Globe, BookOpen } from 'lucide-react';

const Logo = ({ dark = false }: { dark?: boolean }) => (
  <Link to="/" className="flex items-center gap-2.5">
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-300">
      <Sparkles className="h-5 w-5 text-ink" />
    </span>
    <span className={`text-lg font-extrabold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>DocReview</span>
  </Link>
);

/** Split-screen auth frame: form left, dark-green "orbit" brand panel right. */
export const AuthScreen: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ icon, title, subtitle, children, footer }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    {/* Form panel (right on desktop) */}
    <div className="flex items-center justify-center bg-cream px-4 py-12 lg:order-2">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8"><Logo /></div>

        <div className="mb-7">
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            {icon}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        {children}

        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>

    {/* Brand panel (left on desktop) */}
    <div className="relative hidden items-center justify-center overflow-hidden bg-ink lg:order-1 lg:flex">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute h-[34rem] w-[34rem] rounded-full border border-white/10" />
      <div className="absolute h-[24rem] w-[24rem] rounded-full border border-white/10" />
      <div className="absolute h-[14rem] w-[14rem] rounded-full border border-white/10" />

      <div className="relative z-10 max-w-md px-10 text-center text-white">
        <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-300">
          <Sparkles className="h-8 w-8 text-ink" />
        </span>
        <h2 className="text-4xl font-extrabold leading-tight">
          Publish better <span className="serif-accent text-brand-300">everywhere</span>
        </h2>
        <p className="mt-3 text-white/60">
          One workflow for editors, reviewers, publishers and readers — from first draft to final publication.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          {[PenLine, ShieldCheck, Globe, BookOpen].map((Icon, i) => (
            <span key={i} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Icon className="h-5 w-5" />
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);
