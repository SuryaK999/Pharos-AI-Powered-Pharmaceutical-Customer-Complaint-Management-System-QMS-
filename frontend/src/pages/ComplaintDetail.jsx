import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, CalendarDays, History, MapPin, Package, User } from 'lucide-react'
import { fetchComplaint, updateComplaint, analyzeComplaint, clearCurrent } from '@/store/complaintsSlice'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge, RiskBadge, TypeBadge } from '@/components/badges'
import CopilotPanel from '@/components/CopilotPanel'
import { useState } from 'react'

const WORKFLOW = ['draft', 'submitted', 'under_review', 'investigation', 'capa', 'closed']

const Item = ({ label, value, mono }) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-ink/40">{label}</p>
    <p className={`mt-0.5 text-[13px] font-medium text-ink/85 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
  </div>
)

export default function ComplaintDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { current: c, loading } = useSelector((s) => s.complaints)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => { dispatch(fetchComplaint(id)); return () => dispatch(clearCurrent()) }, [dispatch, id])

  if (loading && !c) return <div className="mx-auto max-w-7xl space-y-4"><Skeleton className="h-24" /><Skeleton className="h-96" /></div>
  if (!c) return null

  const advance = async (status) => {
    const res = await dispatch(updateComplaint({ id, status }))
    if (res.meta.requestStatus === 'fulfilled') toast.success(`Status → ${status.replace('_', ' ')}`)
    else toast.error('Update failed')
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    const res = await dispatch(analyzeComplaint(id))
    if (res.meta.requestStatus === 'fulfilled') toast.success('AI Analysis complete')
    else toast.error('AI Analysis failed')
    setIsAnalyzing(false)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Link to="/complaints" className="reveal inline-flex items-center gap-1.5 text-xs font-semibold text-ink/50 transition-colors hover:text-brand">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to register
      </Link>

      {/* header */}
      <Card className="reveal overflow-hidden" style={{ animationDelay: '60ms' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-brand via-brand-glow to-brand" />
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-2xl font-bold tracking-tight">{c.complaint_number}</h2>
              <StatusBadge status={c.status} />
              <RiskBadge level={c.risk_level} score={c.risk_score} />
              <TypeBadge type={c.complaint_type} />
              {c.adverse_event && <Badge variant="danger" className="pulse-critical">ADVERSE EVENT</Badge>}
              {c.is_duplicate && <Badge variant="warning">POSSIBLE DUPLICATE</Badge>}
            </div>
            <p className="mt-1.5 text-sm font-medium text-ink/70">{c.product_name} <span className="font-mono text-xs text-ink/45">· {c.batch_number} · {c.product_code}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/40">Workflow</span>
            <Select value={c.status} onValueChange={advance}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{WORKFLOW.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        {/* record */}
        <div className="space-y-5 xl:col-span-2">
          <Card className="reveal" style={{ animationDelay: '120ms' }}>
            <CardHeader><CardTitle>Complaint Record</CardTitle><CardDescription>Verified intake data · EU GMP Ch.8 complaint file</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Item label="Complainant" value={c.complainant_org} /><Item label="Contact" value={c.complainant_name} /><Item label="Email" value={c.email} />
                <Item label="Country / Market" value={c.country} /><Item label="Date Received" value={c.date_received} /><Item label="Quantity Affected" value={c.quantity_affected} />
                <Item label="Dosage Form" value={c.dosage_form} /><Item label="Classification" value={c.classification} /><Item label="Source" value={`${c.source_channel}${c.source_filename ? ` · ${c.source_filename}` : ''}`} />
              </div>
              <Separator />
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-ink/40">Description</p>
                <p className="rounded-lg bg-bone p-3.5 text-[13px] leading-relaxed text-ink/80">{c.description}</p>
              </div>
              {c.summary && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-ink/40">AI Executive Summary</p>
                  <p className="rounded-lg border-l-[3px] border-brand bg-brand-soft/60 p-3.5 text-[13px] leading-relaxed text-ink/80">{c.summary}</p>
                </div>
              )}
              {c.raw_text && (
                <details className="group">
                  <summary className="cursor-pointer text-xs font-semibold text-brand transition-colors hover:text-brand-dark">Show original communication</summary>
                  <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg border border-ink/10 bg-pine p-3.5 font-mono text-[11px] leading-relaxed text-teal-100/85">{c.raw_text}</pre>
                </details>
              )}
            </CardContent>
          </Card>

          {/* activity timeline */}
          <Card className="reveal" style={{ animationDelay: '180ms' }}>
            <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-4 w-4 text-brand" /> Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l-2 border-ink/8 pl-5">
                {[...(c.activities || [])].reverse().map((a, i) => (
                  <li key={a.id} className="reveal relative" style={{ animationDelay: `${i * 60}ms` }}>
                    <span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                      a.action === 'pv_flag' || a.action === 'duplicate' ? 'bg-red-500' : a.action === 'logged' ? 'bg-brand-glow' : 'bg-brand'}`} />
                    <p className="text-[13px] font-semibold capitalize">{a.action.replace('_', ' ')} <span className="ml-1 font-normal text-ink/40">· {a.actor}</span></p>
                    <p className="text-xs leading-relaxed text-ink/60">{a.details}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-ink/35">{new Date(a.created_at).toLocaleString('en-GB')}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* copilot rail */}
        <div className="reveal" style={{ animationDelay: '160ms' }}>
          <CopilotPanel compact risk={c.risk_level ? { severity: c.risk_severity, probability: c.risk_probability, score: c.risk_score, risk_level: c.risk_level, rationale: c.risk_rationale } : null}
            completeness={c.completeness_score != null ? { score: c.completeness_score, missing_fields: c.missing_fields } : null}
            duplicates={c.duplicate_candidates} rootCause={c.root_cause} capa={c.capa} summary={c.summary} 
            onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </div>
      </div>
    </div>
  )
}
