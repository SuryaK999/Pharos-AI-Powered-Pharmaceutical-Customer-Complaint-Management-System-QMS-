import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, FilePlus2, Flame, Inbox } from 'lucide-react'
import { fetchStats } from '@/store/complaintsSlice'
import { useCountUp } from '@/hooks/useCountUp'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge, RiskBadge, TypeBadge, RISK_META } from '@/components/badges'

const STATUS_ORDER = ['draft', 'submitted', 'under_review', 'investigation', 'capa', 'closed']
const STATUS_COLOR = { draft: '#94a3b8', submitted: '#0284c7', under_review: '#d97706', investigation: '#0e7490', capa: '#0e5e52', closed: '#059669' }

function Kpi({ label, value, suffix = '', tone = 'text-ink', delay = 0 }) {
  const v = useCountUp(value)
  return (
    <div className="reveal" style={{ animationDelay: `${delay}ms` }}>
      <p className={`font-display text-3xl font-bold tracking-tight ${tone}`}>{v}{suffix}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.14em] text-ink/45">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { stats, loading } = useSelector((s) => s.complaints)

  useEffect(() => { dispatch(fetchStats()) }, [dispatch])

  if (loading && !stats) return <div className="space-y-4"><Skeleton className="h-44" /><Skeleton className="h-64" /></div>
  if (!stats) return null

  const maxWeek = Math.max(1, ...stats.weekly.map((w) => w.count))
  const riskTotal = Object.values(stats.by_risk).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* header row */}
      <div className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Complaint Intake Pulse</h2>
          <p className="text-sm text-ink/55">Live quality signal across API & FDF product portfolio · last 8 weeks</p>
        </div>
        <Button variant="glow" onClick={() => navigate('/complaints/new')}>
          <FilePlus2 className="h-4 w-4" /> Log Complaint with AI
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {/* Intake pulse + KPIs */}
        <Card className="reveal xl:col-span-2" style={{ animationDelay: '80ms' }}>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div><CardTitle>Weekly Intake Volume</CardTitle><CardDescription>New complaints received per ISO week</CardDescription></div>
            <div className="grid grid-cols-4 gap-6 pl-6">
              <Kpi label="Total" value={stats.total} delay={100} />
              <Kpi label="Open" value={stats.open} tone="text-sky-700" delay={180} />
              <Kpi label="Critical open" value={stats.open_critical} tone="text-red-600" delay={260} />
              <Kpi label="Avg complete" value={stats.avg_completeness} suffix="%" tone="text-brand" delay={340} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-36 items-end gap-2.5">
              {stats.weekly.map((w, i) => (
                <div key={w.label} className="group flex flex-1 flex-col items-center gap-1.5">
                  <span className="font-mono text-[10px] font-semibold text-ink/0 transition-all group-hover:text-ink/60">{w.count}</span>
                  <div className="bar-grow w-full rounded-t-md bg-gradient-to-t from-brand to-brand-glow transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${Math.max(6, (w.count / maxWeek) * 100)}%`, animationDelay: `${i * 70}ms` }} />
                  <span className="font-mono text-[10px] text-ink/40">{w.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk distribution + critical alerts */}
        <Card className="reveal" style={{ animationDelay: '160ms' }}>
          <CardHeader><CardTitle>Risk Distribution</CardTitle><CardDescription>AI-classified · ICH Q9 matrix</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-3.5 w-full overflow-hidden rounded-full">
              {['critical', 'high', 'medium', 'low'].map((lvl) => (
                <div key={lvl} className="h-full transition-all duration-700"
                  style={{ width: `${((stats.by_risk[lvl] || 0) / riskTotal) * 100}%`, background: RISK_META[lvl].tone }} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['critical', 'high', 'medium', 'low'].map((lvl) => (
                <div key={lvl} className="flex items-center justify-between rounded-lg bg-bone px-2.5 py-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold capitalize text-ink/70">
                    <span className="h-2 w-2 rounded-full" style={{ background: RISK_META[lvl].tone }} />{lvl}
                  </span>
                  <span className="font-mono text-xs font-bold">{stats.by_risk[lvl] || 0}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-ink/45">
                <Flame className="h-3.5 w-3.5 text-red-500" /> Priority Alerts
              </p>
              <ul className="space-y-1.5">
                {stats.critical_alerts.slice(0, 3).map((c) => (
                  <li key={c.id}>
                    <Link to={`/complaints/${c.id}`}
                      className="group flex items-center justify-between gap-2 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2 transition-all hover:border-red-300 hover:shadow-sm">
                      <span className="min-w-0">
                        <span className="block font-mono text-[11px] font-semibold text-red-800">{c.complaint_number}</span>
                        <span className="block truncate text-[11px] text-ink/55">{c.product_name}</span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-red-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </li>
                ))}
                {!stats.critical_alerts.length && <li className="text-xs text-ink/40">No high/critical open complaints 🎉</li>}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status pipeline */}
      <Card className="reveal" style={{ animationDelay: '240ms' }}>
        <CardHeader><CardTitle>QMS Workflow Pipeline</CardTitle><CardDescription>Complaints by lifecycle stage (EU GMP Ch.8)</CardDescription></CardHeader>
        <CardContent>
          <div className="flex h-9 w-full overflow-hidden rounded-lg">
            {STATUS_ORDER.map((st) => {
              const n = stats.by_status[st] || 0
              if (!n) return null
              return (
                <div key={st} className="group relative h-full transition-all duration-500 hover:brightness-110"
                  style={{ width: `${(n / (stats.total || 1)) * 100}%`, background: STATUS_COLOR[st] }}>
                  <span className="absolute inset-0 grid place-items-center font-mono text-[11px] font-bold text-white/95">{n}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
            {STATUS_ORDER.map((st) => (
              <span key={st} className="flex items-center gap-1.5 text-[11px] capitalize text-ink/55">
                <span className="h-2 w-2 rounded-sm" style={{ background: STATUS_COLOR[st] }} />{st.replace('_', ' ')} · {stats.by_status[st] || 0}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent complaints */}
      <Card className="reveal" style={{ animationDelay: '320ms' }}>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div><CardTitle>Recent Complaints</CardTitle><CardDescription>Latest AI-intake records</CardDescription></div>
          <Link to="/complaints" className="flex items-center gap-1 text-xs font-semibold text-brand transition-all hover:gap-2">
            View register <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Number</TableHead><TableHead>Product / Batch</TableHead><TableHead>Complainant</TableHead><TableHead>Type</TableHead><TableHead>Risk</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {stats.recent.map((c) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-brand-soft/50" onClick={() => navigate(`/complaints/${c.id}`)}>
                  <TableCell className="font-mono text-xs font-semibold text-brand-dark">{c.complaint_number}</TableCell>
                  <TableCell>
                    <p className="text-[13px] font-medium">{c.product_name}</p>
                    <p className="font-mono text-[11px] text-ink/45">{c.batch_number}</p>
                  </TableCell>
                  <TableCell className="text-xs text-ink/65">{c.complainant_org}<p className="text-[11px] text-ink/40">{c.country}</p></TableCell>
                  <TableCell><TypeBadge type={c.complaint_type} /></TableCell>
                  <TableCell><RiskBadge level={c.risk_level} score={c.risk_score} /></TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                </TableRow>
              ))}
              {!stats.recent.length && (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-ink/40"><Inbox className="mx-auto mb-2 h-6 w-6" />No complaints yet — log the first one with AI intake.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
