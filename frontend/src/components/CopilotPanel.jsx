import { AlertTriangle, CheckCircle2, Copy, FileSearch, GitBranch, ListChecks, Sparkles, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import RiskGauge from './RiskGauge'
import { Link } from 'react-router-dom'

const Section = ({ icon: Icon, title, desc, children, className = '' }) => (
  <Card className={className}>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-soft text-brand"><Icon className="h-4 w-4" /></span>
        {title}
      </CardTitle>
      {desc && <CardDescription>{desc}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)

/** AI Copilot — renders risk, completeness, duplicates, root cause, CAPA & summary.
 *  Works from live intake state OR a persisted complaint record. */
export default function CopilotPanel({ risk, completeness, duplicates, rootCause, capa, summary, compact = false }) {
  const rc = rootCause && !rootCause.error ? rootCause : null
  const cp = capa && !capa.error ? capa : null
  return (
    <div className={compact ? 'space-y-4' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>
      {/* Risk Assessment */}
      <Section icon={AlertTriangle} title="AI Risk Assessment" desc="ICH Q9 · Severity × Probability" className={compact ? '' : 'reveal'}>
        {risk && !risk.error ? (
          <>
            <RiskGauge severity={risk.severity} probability={risk.probability} score={risk.score} level={risk.risk_level} size={compact ? 150 : 170} />
            <p className="mt-3 rounded-lg bg-bone p-3 text-xs leading-relaxed text-ink/70">{risk.rationale}</p>
          </>
        ) : <p className="text-xs text-ink/45">Awaiting assessment…</p>}
      </Section>

      {/* Completeness */}
      <Section icon={ListChecks} title="Completeness Checker" desc="Required QMS complaint fields" className={compact ? '' : 'reveal'}>
        {completeness ? (
          <>
            <div className="flex items-end justify-between">
              <p className="font-display text-3xl font-bold tracking-tight">{completeness.score}%</p>
              <Badge variant={completeness.score === 100 ? 'success' : completeness.score >= 75 ? 'warning' : 'danger'}>
                {completeness.score === 100 ? 'Complete' : 'Gaps found'}
              </Badge>
            </div>
            <Progress value={completeness.score} className="mt-2"
              tone={completeness.score === 100 ? 'bg-emerald-500' : completeness.score >= 75 ? 'bg-amber-500' : 'bg-red-500'} />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(completeness.missing_fields || []).length
                ? completeness.missing_fields.map((f) => <Badge key={f} variant="danger" className="font-mono normal-case">{f}</Badge>)
                : <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> All mandatory fields captured</span>}
            </div>
          </>
        ) : <p className="text-xs text-ink/45">Awaiting check…</p>}
      </Section>

      {/* Duplicates */}
      <Section icon={Copy} title="Duplicate Detection" desc="Historical register scan" className={compact ? '' : 'reveal'}>
        {duplicates ? (
          duplicates.length ? (
            <ul className="space-y-2">
              {duplicates.map((d) => (
                <li key={d.id}>
                  <Link to={`/complaints/${d.id}`}
                    className="group flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 transition-all hover:border-amber-400 hover:shadow-sm">
                    <span className="min-w-0">
                      <span className="block font-mono text-xs font-semibold text-amber-800 group-hover:underline">{d.complaint_number}</span>
                      <span className="block truncate text-[11px] text-ink/55">{d.product_name} · {d.batch_number}</span>
                    </span>
                    <Badge variant="warning">{d.similarity}% match</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="flex items-center gap-1.5 text-xs text-emerald-600"><CheckCircle2 className="h-4 w-4" /> No similar complaints in the register.</p>
        ) : <p className="text-xs text-ink/45">Scanning register…</p>}
      </Section>

      {/* Root cause */}
      <Section icon={GitBranch} title="Root Cause Recommendation" desc="Ishikawa category · 5 Whys" className={compact ? '' : 'reveal'}>
        {rc ? (
          <>
            <Badge variant="soft" className="capitalize">{rc.ishikawa_category}</Badge>
            <ul className="mt-2.5 space-y-1.5">
              {(rc.probable_causes || []).map((c, i) => (
                <li key={i} className="flex gap-2 text-xs leading-snug text-ink/75"><span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{c}</li>
              ))}
            </ul>
            <Separator className="my-3" />
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">5 Whys chain</p>
            <ol className="space-y-1">
              {(rc.five_whys || []).map((w, i) => (
                <li key={i} className="rounded-md bg-bone px-2.5 py-1.5 text-[11px] leading-snug text-ink/70"><span className="font-mono font-semibold text-brand">W{i + 1}</span> · {w}</li>
              ))}
            </ol>
          </>
        ) : <p className="text-xs text-ink/45">Awaiting analysis…</p>}
      </Section>

      {/* CAPA */}
      <Section icon={Wrench} title="CAPA Recommendation" desc="Corrective & Preventive Action" className={compact ? '' : 'reveal'}>
        {cp ? (
          <div className="space-y-3">
            {[['Immediate', cp.immediate_actions, 'bg-red-500'], ['Corrective', cp.corrective_actions, 'bg-amber-500'], ['Preventive', cp.preventive_actions, 'bg-emerald-500']].map(([t, arr, dot]) => (
              <div key={t}>
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-ink/45">
                  <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{t}
                </p>
                <ul className="space-y-1">
                  {(arr || []).map((a, i) => <li key={i} className="text-xs leading-snug text-ink/75">— {a}</li>)}
                </ul>
              </div>
            ))}
            {cp.regulatory_consideration && (
              <p className="rounded-lg border border-sky-200 bg-sky-50 p-2.5 text-[11px] leading-relaxed text-sky-800">{cp.regulatory_consideration}</p>
            )}
          </div>
        ) : <p className="text-xs text-ink/45">Awaiting recommendation…</p>}
      </Section>

      {/* Summary */}
      <Section icon={Sparkles} title="Complaint Summary" desc="Executive brief · auto-generated" className={compact ? '' : 'reveal'}>
        {summary
          ? <p className="rounded-lg border-l-[3px] border-brand bg-bone p-3 text-[13px] leading-relaxed text-ink/80">{summary}</p>
          : <p className="text-xs text-ink/45">Drafting summary…</p>}
        {!compact && (
          <p className="mt-3 flex items-center gap-1.5 text-[10px] text-ink/35"><FileSearch className="h-3 w-3" /> Generated by Groq · gemma2-9b-it</p>
        )}
      </Section>
    </div>
  )
}
