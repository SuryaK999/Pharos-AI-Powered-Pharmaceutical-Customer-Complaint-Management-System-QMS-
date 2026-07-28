import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search, FilePlus2 } from 'lucide-react'
import { fetchComplaints } from '@/store/complaintsSlice'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge, RiskBadge, TypeBadge } from '@/components/badges'

export default function Complaints() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, loading } = useSelector((s) => s.complaints)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [risk, setRisk] = useState('all')

  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchComplaints({
      q, status: status === 'all' ? '' : status, risk: risk === 'all' ? '' : risk,
    })), 250)
    return () => clearTimeout(t)
  }, [dispatch, q, status, risk])

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="reveal flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Complaint Register</h2>
          <p className="text-sm text-ink/55">{items.length} record{items.length === 1 ? '' : 's'} · 21 CFR 211.198 complaint files</p>
        </div>
        <Button variant="glow" onClick={() => navigate('/complaints/new')}><FilePlus2 className="h-4 w-4" /> New AI Intake</Button>
      </div>

      <Card className="reveal p-3" style={{ animationDelay: '80ms' }}>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <Input placeholder="Search number, product, batch, organization…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {['draft', 'submitted', 'under_review', 'investigation', 'capa', 'closed'].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={risk} onValueChange={setRisk}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk</SelectItem>
              {['critical', 'high', 'medium', 'low'].map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="reveal" style={{ animationDelay: '140ms' }}>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead><TableHead>Product / Batch</TableHead><TableHead>Complainant</TableHead>
                  <TableHead>Type</TableHead><TableHead>Received</TableHead><TableHead>Risk</TableHead><TableHead>Status</TableHead><TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c, i) => (
                  <TableRow key={c.id} className="reveal cursor-pointer hover:bg-brand-soft/50"
                    style={{ animationDelay: `${i * 40}ms` }} onClick={() => navigate(`/complaints/${c.id}`)}>
                    <TableCell className="font-mono text-xs font-semibold text-brand-dark">{c.complaint_number}</TableCell>
                    <TableCell>
                      <p className="text-[13px] font-medium">{c.product_name}</p>
                      <p className="font-mono text-[11px] text-ink/45">{c.batch_number} · {c.product_code}</p>
                    </TableCell>
                    <TableCell className="text-xs text-ink/65">{c.complainant_org}<p className="text-[11px] text-ink/40">{c.country}</p></TableCell>
                    <TableCell><TypeBadge type={c.complaint_type} /></TableCell>
                    <TableCell className="font-mono text-xs text-ink/55">{c.date_received}</TableCell>
                    <TableCell><RiskBadge level={c.risk_level} score={c.risk_score} /></TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell><ChevronRight className="h-4 w-4 text-ink/25" /></TableCell>
                  </TableRow>
                ))}
                {!items.length && <TableRow><TableCell colSpan={8} className="py-12 text-center text-sm text-ink/40">No complaints match the current filters.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
