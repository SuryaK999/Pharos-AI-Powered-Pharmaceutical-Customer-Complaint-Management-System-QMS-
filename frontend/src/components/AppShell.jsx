import { useState, useEffect } from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, FilePlus2, ShieldCheck,
  ChevronsLeft, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SECTIONS = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Quality Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Quality Operations',
    items: [
      { to: '/complaints', label: 'Complaint Register', icon: ClipboardList },
      { to: '/complaints/new', label: 'Log Complaint', icon: FilePlus2, accent: true },
    ],
  },
]

const TITLES = {
  '/': 'Quality Operations',
  '/complaints': 'Complaint Register',
  '/complaints/new': 'Log Customer Complaint',
}

function Logo({ collapsed }) {
  return (
    <Link to="/" className={cn("group flex items-center px-5 py-6", collapsed ? "justify-center px-0" : "gap-3.5")}>
      <img 
        src="/pharos-logo.svg" 
        alt="Pharos Logo" 
        className={cn("object-contain transition-transform duration-300 group-hover:scale-105", 
          collapsed ? "h-10 w-10" : "h-[52px] w-[52px] shrink-0 drop-shadow-lg")} 
      />
      {!collapsed && (
        <span className="min-w-0 flex-1 pt-0.5 transition-all duration-300">
          <span className="block truncate font-display text-[20px] font-bold tracking-tight text-white leading-none">
            Pharos<span className="text-brand-glow">.</span>
          </span>
          <span className="block mt-1.5 text-[9.5px] font-semibold uppercase tracking-[.26em] text-white/40 leading-none">
            QMS · Complaints
          </span>
        </span>
      )}
    </Link>
  )
}

function NavItem({ item, collapsed }) {
  const { to, label, icon: Icon, end, accent } = item

  return (
    <NavLink to={to} end={end}
      className={({ isActive }) => cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
        isActive ? 'bg-white/[0.07] text-white' : 'text-white/45 hover:bg-white/[0.04] hover:text-white/85')}>
      {({ isActive }) => (
        <>
          <span className={cn('absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-brand-glow transition-all duration-300',
            isActive ? 'opacity-80' : 'opacity-0')} />
          <Icon className={cn('h-[17px] w-[17px] shrink-0 transition-colors duration-200',
            isActive ? 'text-brand-glow' : 'text-white/40 group-hover:text-white/70',
            accent && !isActive && 'text-white/40')} strokeWidth={1.9} />
          <span className={cn('flex-1 truncate transition-all duration-300', collapsed && 'lg:hidden')}>{label}</span>
          {accent && !collapsed && (
            <Sparkles className="hidden h-3 w-3 text-brand-glow/60 lg:block" />
          )}
          {collapsed && (
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#16211d] px-2.5 py-1.5 text-[11px] font-medium text-white/80 shadow-xl group-hover:block">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function AppShell({ children }) {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('pharos-sidebar') === '1')
  useEffect(() => { localStorage.setItem('pharos-sidebar', collapsed ? '1' : '0') }, [collapsed])

  const title = TITLES[pathname] || (pathname.startsWith('/complaints/') ? 'Complaint Record' : 'Pharos QMS')
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="flex min-h-screen">
      {/* ═══ SIDEBAR ═══ */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/[0.06] bg-pine transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]',
        collapsed ? 'w-[76px]' : 'w-[76px] lg:w-[264px]')}>

        {/* subtle top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand/[0.08] to-transparent" />

        {/* collapse toggle — attached to edge */}
        <button onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-[70px] z-50 hidden h-6 w-6 place-items-center rounded-full border border-ink/15 bg-white shadow-md transition-all duration-200 hover:scale-110 hover:border-brand/40 lg:grid"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <ChevronsLeft className={cn('h-3.5 w-3.5 text-ink/60 transition-transform duration-300', collapsed && 'rotate-180')} />
        </button>

        <Logo collapsed={collapsed} />

        {/* nav */}
        <nav className="relative flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-2">
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <p className={cn('mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[.22em] text-white/25 transition-all duration-300',
                collapsed && 'lg:opacity-0 lg:h-0 lg:mb-0 lg:overflow-hidden')}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => <NavItem key={item.label || item.to} item={item} collapsed={collapsed} />)}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className={cn('flex min-h-screen flex-1 flex-col transition-[margin] duration-300 ease-[cubic-bezier(.4,0,.2,1)]',
        collapsed ? 'ml-[76px]' : 'ml-[76px] lg:ml-[264px]')}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink/[0.07] bg-bone/85 px-6 backdrop-blur-md lg:px-8">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.22em] text-brand">Pharos Quality Suite</p>
            <h1 className="font-display text-[17px] font-bold leading-tight tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-ink/10 bg-white px-3 py-1 font-mono text-[11px] text-ink/55 sm:block">{today}</span>
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 md:flex">
              <ShieldCheck className="h-3 w-3" /> ICH Q9 · 21 CFR 211.198
            </span>
          </div>
        </header>
        <main className="dotgrid flex-1 bg-gradient-to-b from-white/50 to-transparent px-6 py-7 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
