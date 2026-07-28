import { Badge } from './ui/badge'
import { AlertTriangle } from 'lucide-react'

const STATUS_META = {
  draft: { label: 'Draft', variant: 'outline' },
  submitted: { label: 'Submitted', variant: 'info' },
  under_review: { label: 'Under Review', variant: 'warning' },
  investigation: { label: 'Investigation', variant: 'soft' },
  capa: { label: 'CAPA', variant: 'default' },
  closed: { label: 'Closed', variant: 'success' },
}

export const RISK_META = {
  low: { label: 'LOW', variant: 'success', tone: '#059669' },
  medium: { label: 'MEDIUM', variant: 'warning', tone: '#D97706' },
  high: { label: 'HIGH', variant: 'danger', tone: '#EA580C' },
  critical: { label: 'CRITICAL', variant: 'danger', tone: '#DC2626' },
}

export function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, variant: 'outline' }
  return <Badge variant={m.variant}>{m.label}</Badge>
}

export function RiskBadge({ level, score }) {
  if (!level) return <Badge variant="outline">UNRATED</Badge>
  const m = RISK_META[level]
  return (
    <Badge variant={m.variant} className={level === 'critical' ? 'pulse-critical' : ''}>
      {level === 'critical' && <AlertTriangle className="h-3 w-3" />}
      {m.label}{score ? ` · ${score}` : ''}
    </Badge>
  )
}

export function TypeBadge({ type }) {
  const label = (type || 'other').replace(/_/g, ' ')
  return <Badge variant="outline" className="capitalize">{label}</Badge>
}
