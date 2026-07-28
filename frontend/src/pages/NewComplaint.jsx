import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertTriangle, CheckCircle2, Copy, Send, Sparkles } from 'lucide-react'
import { createComplaint } from '@/store/complaintsSlice'
import { setField, resetChat } from '@/store/chatSlice'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import RiskGauge from '@/components/RiskGauge'
import ChatPanel from '@/components/ChatPanel'
import { cn } from '@/lib/utils'

const TYPES = ['product_quality','packaging','labeling','contamination','efficacy_potency','adverse_event','delivery_documentation','other']

function F({ label, flash, children }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className={cn(flash && 'field-flash rounded-lg')}>{children}</div>
    </div>
  )
}

export default function NewComplaint() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const chat = useSelector((s) => s.chat)
  const { loading } = useSelector((s) => s.complaints)
  const f = chat.form
  const risk = chat.risk
  const hasData = Object.values(f).some((v) => v && v !== '' && v !== false)

  const submit = async () => {
    if (!f.product_name || !f.description) return toast.error('Product name and description are required.')
    const res = await dispatch(createComplaint({
      form: f,
      ai: { risk_assessment: risk, duplicates: chat.duplicates },
    }))
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(`Complaint ${res.payload.complaint_number} logged!`)
      dispatch(resetChat())
      navigate(`/complaints/${res.payload.id}`)
    } else toast.error('Submission failed')
  }

  return (
    <div className="mx-auto grid max-w-[1500px] gap-5 xl:grid-cols-12">
      {/* ═══ LEFT: Form + Risk ═══ */}
      <div className="space-y-5 xl:col-span-6">
        <Card className="reveal">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Log Customer Complaint
              {hasData && <Badge variant="soft"><Sparkles className="mr-1 h-3 w-3" /> AI-populated</Badge>}
            </CardTitle>
            <CardDescription>Populated by the Copilot via chat. Edit here or via prompts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              <F label="Complainant Org" flash={chat.flashKeys.includes('complainant_org')}>
                <Input value={f.complainant_org} onChange={(e) => dispatch(setField({ key: 'complainant_org', value: e.target.value }))} placeholder="Apollo Pharmacy" /></F>
              <F label="Contact Name" flash={chat.flashKeys.includes('complainant_name')}>
                <Input value={f.complainant_name} onChange={(e) => dispatch(setField({ key: 'complainant_name', value: e.target.value }))} /></F>
              <F label="Email" flash={chat.flashKeys.includes('email')}>
                <Input value={f.email} onChange={(e) => dispatch(setField({ key: 'email', value: e.target.value }))} /></F>
              <F label="Country" flash={chat.flashKeys.includes('country')}>
                <Input value={f.country} onChange={(e) => dispatch(setField({ key: 'country', value: e.target.value }))} /></F>
              <F label="Product Name" flash={chat.flashKeys.includes('product_name')}>
                <Input value={f.product_name} onChange={(e) => dispatch(setField({ key: 'product_name', value: e.target.value }))} placeholder="Amoxicillin Capsules" /></F>
              <F label="Product Code" flash={chat.flashKeys.includes('product_code')}>
                <Input value={f.product_code} onChange={(e) => dispatch(setField({ key: 'product_code', value: e.target.value }))} className="font-mono" /></F>
              <F label="Strength" flash={chat.flashKeys.includes('product_strength')}>
                <Input value={f.product_strength} onChange={(e) => dispatch(setField({ key: 'product_strength', value: e.target.value }))} placeholder="500 mg" /></F>
              <F label="Batch / Lot No." flash={chat.flashKeys.includes('batch_number')}>
                <Input value={f.batch_number} onChange={(e) => dispatch(setField({ key: 'batch_number', value: e.target.value }))} className="font-mono" /></F>
              <F label="Grade" flash={chat.flashKeys.includes('grade')}>
                <Input value={f.grade} onChange={(e) => dispatch(setField({ key: 'grade', value: e.target.value }))} placeholder="IP / BP / USP" /></F>
              <F label="Mfg Date" flash={chat.flashKeys.includes('manufacturing_date')}>
                <Input type="date" value={f.manufacturing_date} onChange={(e) => dispatch(setField({ key: 'manufacturing_date', value: e.target.value }))} /></F>
              <F label="Expiry Date" flash={chat.flashKeys.includes('expiry_date')}>
                <Input type="date" value={f.expiry_date} onChange={(e) => dispatch(setField({ key: 'expiry_date', value: e.target.value }))} /></F>
              <F label="Dosage Form" flash={chat.flashKeys.includes('dosage_form')}>
                <Input value={f.dosage_form} onChange={(e) => dispatch(setField({ key: 'dosage_form', value: e.target.value }))} /></F>
              <F label="Complaint Type" flash={chat.flashKeys.includes('complaint_type')}>
                <Select value={f.complaint_type} onValueChange={(v) => dispatch(setField({ key: 'complaint_type', value: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select></F>
              <F label="Classification" flash={chat.flashKeys.includes('classification')}>
                <Select value={f.classification} onValueChange={(v) => dispatch(setField({ key: 'classification', value: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="critical">Critical</SelectItem><SelectItem value="major">Major</SelectItem><SelectItem value="minor">Minor</SelectItem></SelectContent>
                </Select></F>
              <F label="Qty Affected" flash={chat.flashKeys.includes('quantity_affected')}>
                <Input value={f.quantity_affected} onChange={(e) => dispatch(setField({ key: 'quantity_affected', value: e.target.value }))} /></F>
              <F label="Date Received" flash={chat.flashKeys.includes('date_received')}>
                <Input type="date" value={f.date_received} onChange={(e) => dispatch(setField({ key: 'date_received', value: e.target.value }))} /></F>
              <F label="Source" flash={chat.flashKeys.includes('source_channel')}>
                <Select value={f.source_channel} onValueChange={(v) => dispatch(setField({ key: 'source_channel', value: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['email','phone','portal','letter','verbal','other'].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select></F>
              <div className="sm:col-span-2 lg:col-span-3">
                <F label="Description" flash={chat.flashKeys.includes('description')}>
                  <Textarea rows={3} value={f.description} onChange={(e) => dispatch(setField({ key: 'description', value: e.target.value }))} /></F>
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-ink/10 bg-bone px-3 py-2 sm:col-span-2 lg:col-span-3">
                <input type="checkbox" checked={f.adverse_event} className="h-4 w-4 accent-red-600"
                  onChange={(e) => dispatch(setField({ key: 'adverse_event', value: e.target.checked }))} />
                <span className="text-xs font-semibold">Adverse event / patient safety involved</span>
              </label>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => dispatch(resetChat())}>Clear All</Button>
              <Button variant="glow" size="lg" onClick={submit} disabled={loading || !hasData}>
                <Send className="h-4 w-4" /> Submit Complaint
              </Button>
            </div>
          </CardContent>
        </Card>

        {risk && (
          <Card className="reveal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-soft text-brand"><AlertTriangle className="h-4 w-4" /></span>
                AI Copilot Risk Assessment
                <Badge variant={risk.risk_level === 'critical' || risk.risk_level === 'high' ? 'danger' : risk.risk_level === 'medium' ? 'warning' : 'success'}
                  className={risk.risk_level === 'critical' ? 'pulse-critical ml-1' : 'ml-1'}>
                  {(risk.risk_level || '').toUpperCase()}
                </Badge>
              </CardTitle>
              <CardDescription>ICH Q9 · auto-updates with every edit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 md:grid-cols-2">
                <RiskGauge severity={risk.severity} probability={risk.probability} score={risk.score} level={risk.risk_level} size={160} />
                <div className="space-y-3">
                  <p className="rounded-lg bg-bone p-3 text-xs leading-relaxed text-ink/70">{risk.rationale}</p>
                  {(risk.recommended_actions || []).length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">Recommended Actions</p>
                      <ul className="space-y-1">
                        {risk.recommended_actions.map((a, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-ink/75"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" /> {a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              {chat.duplicates.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-ink/45"><Copy className="h-3.5 w-3.5" /> Possible Duplicates</p>
                  <div className="flex flex-wrap gap-2">
                    {chat.duplicates.map((d) => <Badge key={d.id} variant="warning" className="font-mono">{d.complaint_number} · {d.similarity}%</Badge>)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══ RIGHT: AI Chat ═══ */}
      <div className="xl:col-span-6">
        <Card className="reveal sticky top-20 flex h-[calc(100vh-120px)] flex-col overflow-hidden border-0 shadow-none ring-1 ring-ink/[0.05]" style={{ animationDelay: '100ms' }}>
          <ChatPanel />
        </Card>
      </div>
    </div>
  )
}
