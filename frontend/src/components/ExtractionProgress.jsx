import { Check, Loader2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const PIPELINE_NODES = [
  { key: 'extract', label: 'Parse & extract entities', sub: 'Groq · gemma2-9b-it' },
  { key: 'agent_risk', label: 'ICH Q9 risk classification', sub: 'Severity × Probability matrix' },
  { key: 'agent_completeness', label: 'Completeness check', sub: 'Required QMS fields' },
  { key: 'agent_duplicates', label: 'Duplicate detection', sub: 'Batch · product · narrative match' },
  { key: 'agent_root_cause', label: 'Root cause analysis', sub: 'Groq · llama-3.3-70b · Ishikawa + 5 Whys' },
  { key: 'agent_capa', label: 'CAPA recommendation', sub: '21 CFR 211.198 / EU GMP Ch.8' },
  { key: 'summarize', label: 'Executive summary', sub: 'Copilot brief' },
]

export default function ExtractionProgress({ completed, running }) {
  const active = PIPELINE_NODES.find((n) => !completed.includes(n.key))?.key
  return (
    <ol className="space-y-1">
      {PIPELINE_NODES.map((n, i) => {
        const done = completed.includes(n.key)
        const isActive = running && n.key === active
        return (
          <li key={n.key}
            className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300',
              isActive && 'bg-brand-soft', done && 'opacity-90')}
            style={{ animation: `fadeUp .4s ${i * 60}ms both` }}>
            <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold transition-all duration-300',
              done ? 'border-brand bg-brand text-white' : isActive ? 'border-brand-glow bg-white text-brand' : 'border-ink/15 bg-white text-ink/35')}>
              {done ? <Check className="h-3.5 w-3.5" /> : isActive ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Circle className="h-2 w-2" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn('block text-[13px] font-semibold leading-tight', done || isActive ? 'text-ink' : 'text-ink/40')}>{n.label}</span>
              <span className="block truncate font-mono text-[10px] text-ink/40">{n.sub}</span>
            </span>
            {done && <span className="font-mono text-[10px] font-semibold text-brand">OK</span>}
          </li>
        )
      })}
    </ol>
  )
}
