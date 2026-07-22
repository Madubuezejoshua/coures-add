import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, PenLine, ShieldCheck, Globe, BookOpen, Users,
  CheckCircle2, Zap, TrendingUp, BarChart3, Download, Bell,
} from 'lucide-react';

const Logo = ({ dark = false }: { dark?: boolean }) => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-300">
      <Sparkles className="h-5 w-5 text-ink" />
    </span>
    <span className={`text-lg font-extrabold tracking-tight ${dark ? 'text-ink' : 'text-white'}`}>DocReview</span>
  </div>
);

const NAV = ['Home', 'Features', 'Roles', 'Pricing'];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-cream">
      {/* ===================== HERO (dark) ===================== */}
      <section className="relative overflow-hidden bg-ink pb-72 pt-6 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-[44rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4">
          {/* nav */}
          <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
            <Logo />
            <div className="hidden items-center gap-7 text-sm text-white/70 md:flex">
              {NAV.map((n) => (
                <a key={n} href={`#${n.toLowerCase()}`} className="transition-colors hover:text-white">{n}</a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white">Login</button>
              <button onClick={() => navigate('/signup')} className="rounded-full bg-brand-300 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-brand-400">
                Get Started
              </button>
            </div>
          </nav>

          {/* hero copy */}
          <div className="mx-auto mt-16 max-w-3xl text-center animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-300/15 px-3 py-1 text-xs font-semibold text-brand-300 ring-1 ring-inset ring-brand-300/30">
              #1 document workflow platform
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
              Transform the Way You
              <br />
              <span className="serif-accent text-brand-300">Review &amp; Publish Work</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/65">
              Streamline your workflow, improve team collaboration, and meet deadlines with ease — no matter where you are.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); navigate('/signup'); }}
              className="mx-auto mt-9 flex max-w-md items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur"
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter work email"
                className="flex-1 bg-transparent px-4 text-sm text-white placeholder-white/40 focus:outline-none"
              />
              <button type="submit" className="flex items-center gap-1.5 rounded-full bg-brand-300 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-400">
                Try For Free <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* dashboard preview (overlaps into next section) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
          <DashboardPreview />
        </div>
      </section>

      {/* spacer for the overlapping preview */}
      <div className="h-56 bg-cream sm:h-64" />

      {/* ===================== FEATURES ===================== */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading kicker="Why DocReview" plain="Everything your team needs to" accent="ship great work" />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Zap, title: 'Streamlined workflow', body: 'Automate review from submission to publication.' },
            { icon: Users, title: 'Better collaboration', body: 'Clear roles and permissions for every member.' },
            { icon: ShieldCheck, title: 'Multi-role system', body: 'Editors, reviewers, publishers and readers in one place.' },
            { icon: TrendingUp, title: 'Quick & reliable', body: 'Fast processing with full activity tracking.' },
          ].map((f, i) => (
            <div key={f.title} style={{ animationDelay: `${i * 0.06}s` }} className="animate-fade-up rounded-3xl border border-cream-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== ROLES ===================== */}
      <section id="roles" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading kicker="Perfect for everyone" plain="Built for" accent="every role" />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: PenLine, title: 'Authors', body: 'Create, upload and submit manuscripts for review.' },
              { icon: ShieldCheck, title: 'Reviewers', body: 'Review, give feedback and approve submissions.' },
              { icon: Globe, title: 'Publishers', body: 'Publish approved documents after payment.' },
              { icon: BookOpen, title: 'Readers', body: 'Browse, purchase and read published work.' },
            ].map((r) => (
              <div key={r.title} className="group rounded-3xl border border-cream-200 bg-cream p-6 transition-all hover:bg-ink">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-300 text-ink">
                  <r.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink group-hover:text-white">{r.title}</h3>
                <p className="mt-1 text-sm text-slate-500 group-hover:text-white/60">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[['10k+', 'Active users'], ['50k+', 'Documents reviewed'], ['95%', 'Satisfaction rate']].map(([n, l]) => (
            <div key={l} className="rounded-3xl border border-cream-200 bg-white p-8 text-center shadow-card">
              <p className="text-4xl font-extrabold tracking-tight text-ink">{n}</p>
              <p className="mt-1 text-sm text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center text-white">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Ready to <span className="serif-accent text-brand-300">transform</span> your workflow?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/65">Join thousands of teams already streamlining their document review process.</p>
            <button onClick={() => navigate('/signup')} className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-300 px-7 py-3.5 font-semibold text-ink transition-all hover:scale-105 hover:bg-brand-400">
              Start free <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-cream-200 bg-cream">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 sm:flex-row sm:justify-between">
          <Logo dark />
          <p className="text-sm text-slate-500">© 2024 DocReview. All rights reserved.</p>
          <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-500 hover:text-ink">Admin / Sign in</button>
        </div>
      </footer>
    </div>
  );
};

const SectionHeading: React.FC<{ kicker: string; plain: string; accent: string }> = ({ kicker, plain, accent }) => (
  <div className="mx-auto max-w-2xl text-center">
    <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">{kicker}</span>
    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
      {plain} <span className="serif-accent text-brand-600">{accent}</span>
    </h2>
  </div>
);

/** Stylized light dashboard mockup that overlaps the hero (Connectly-style). */
const DashboardPreview: React.FC = () => (
  <div className="mx-auto max-w-5xl px-4">
    <div className="overflow-hidden rounded-3xl border border-cream-200 bg-cream-100 shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-cream-200 bg-white px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-rose-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-3 truncate rounded-md bg-cream px-3 py-1 text-xs text-slate-400">app.docreview.com</span>
      </div>
      <div className="grid grid-cols-[180px_1fr]">
        {/* sidebar */}
        <aside className="hidden border-r border-cream-200 bg-cream-100 p-4 sm:block">
          <Logo dark />
          <nav className="mt-6 space-y-1 text-sm">
            {['Dashboard', 'Documents', 'Reviews', 'Publishing', 'Payments'].map((n, i) => (
              <div key={n} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${i === 0 ? 'bg-brand-300 font-semibold text-ink' : 'text-slate-500'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-ink' : 'bg-slate-300'}`} /> {n}
              </div>
            ))}
          </nav>
        </aside>
        {/* main */}
        <div className="bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-ink">Hi there, Welcome back.</p>
              <p className="text-xs text-slate-400">Here's your workspace overview</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream text-slate-400"><Bell className="h-4 w-4" /></span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: BarChart3, label: 'Documents', value: '620', up: '+20%' },
              { icon: Users, label: 'Reviewers', value: '320', up: '+12%' },
              { icon: Download, label: 'Published', value: '406', up: '+8%' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-cream-200 bg-cream-100 p-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{s.label}</span><span className="font-semibold text-emerald-600">{s.up}</span>
                </div>
                <p className="mt-1 text-xl font-extrabold text-ink">{s.value}</p>
                <svg viewBox="0 0 80 24" className="mt-1 h-6 w-full text-brand-500"><polyline points="0,18 12,14 24,16 36,8 48,12 60,5 72,9 80,3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {['Project Ramadan', 'Annual Report', 'Style Guide'].map((p) => (
              <div key={p} className="flex items-center justify-between rounded-xl border border-cream-200 px-3 py-2 text-xs">
                <span className="flex items-center gap-2 font-medium text-ink"><CheckCircle2 className="h-4 w-4 text-brand-600" /> {p}</span>
                <span className="text-slate-400">Published</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
