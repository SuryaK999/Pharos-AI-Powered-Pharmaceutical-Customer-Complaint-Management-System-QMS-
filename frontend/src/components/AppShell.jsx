import { NavLink, useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, FilePlus2, Activity, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Quality Dashboard', icon: LayoutDashboard, end: true },
  { to: '/complaints', label: 'Complaint Register', icon: ClipboardList },
  { to: '/complaints/new', label: 'Log Complaint', icon: FilePlus2 },
]

const TITLES = {
  '/': 'Quality Operations',
  '/complaints': 'Complaint Register',
  '/complaints/new': 'Log Customer Complaint',
}

export default function AppShell({ children }) {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || (pathname.startsWith('/complaints/') ? 'Complaint Record' : 'Pharos QMS')
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[76px] flex-col border-r border-white/5 bg-pine lg:w-60">
        <Link to="/" className="flex items-center gap-3 px-4 py-5 lg:px-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900/80 p-1.5 shadow-[0_0_24px_rgba(14,165,233,.4)] ring-1 ring-white/20">
            <img src="/pharos-logo.svg" alt="Pharos Logo" className="h-7 w-7" />
          </span>
          <span className="hidden lg:block">
            <span className="block font-display text-lg font-bold tracking-tight text-white">PHAROS<span className="text-brand-glow"> ⭐</span></span>
            <span className="block text-[10px] font-medium tracking-[.05em] text-white/50">Every complaint is a beacon.</span>
          </span>
        </Link>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/90')}>
              {({ isActive }) => (
                <>
                  <span className={cn('absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-glow transition-all duration-300', isActive ? 'opacity-100' : 'opacity-0')} />
                  <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110', isActive && 'text-brand-glow')} />
                  <span className="hidden lg:inline">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden px-4 pb-5 lg:block">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-semibold text-white/80">AI Engine Online</span>
            </div>
            <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-white/40">Groq · gemma2-9b-it<br />llama-3.3-70b-versatile</p>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30"><ShieldCheck className="h-3 w-3" /> ICH Q9 · 21 CFR 211.198 · EU GMP Ch.8</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="ml-[76px] flex min-h-screen flex-1 flex-col lg:ml-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink/8 bg-bone/85 px-6 backdrop-blur-md lg:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-brand">Pharos Quality Suite</p>
            <h1 className="font-display text-lg font-bold leading-tight tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-ink/10 bg-white px-3 py-1 font-mono text-[11px] text-ink/60 sm:block">{today}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-bold text-white ring-2 ring-brand/25">QA</span>
          </div>
        </header>
        <main className="dotgrid flex-1 bg-gradient-to-b from-white/60 to-transparent px-6 py-7 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
