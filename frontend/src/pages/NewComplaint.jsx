import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Bot, CheckCircle2, FileUp, Mail, Sparkles, UploadCloud, Wand2 } from 'lucide-react'
import { runIntake, setText, setFileName, setField, reset } from '@/store/intakeSlice'
import { createComplaint } from '@/store/complaintsSlice'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import ExtractionProgress from '@/components/ExtractionProgress'
import CopilotPanel from '@/components/CopilotPanel'
import { cn } from '@/lib/utils'

const SAMPLE_PACKAGING = `From: Sabine Krueger <s.krueger@medpharm-distrib.de>
To: quality@aivoa-pharma.com
Subject: URGENT - Quality Complaint: Amoxicillin 500 mg Capsules, Batch AMX-24091
Date: Thu, 24 Jul 2026 09:42:11 +0200

Dear Quality Assurance Team,

We are writing to formally report a quality complaint regarding Amoxicillin 500 mg hard capsules (Product Code: AMX-500-CAP), batch AMX-24091, expiry 08/2027, distributed to the German market.

During a routine warehouse inspection on 23 July 2026 our team identified approximately 120 cartons with compromised blister seals. Several blisters show delamination with loose capsules, and some capsules present yellowish-brown discoloration suggesting moisture ingress.

The affected stock has been quarantined. Two community pharmacies reported the same defect this week. Given the potential stability impact, please advise on return, replacement and whether a batch recall is warranted.

Best regards,
Sabine Krueger
Head of Regulatory Affairs, MedPharm Distribution GmbH, Munich, Germany`

const SAMPLE_ADVERSE_EVENT = `From: Dr. Elena Rossi <e.rossi@ospedalesanluca.it>
To: quality@aivoa-pharma.com
Subject: SAFETY REPORT - Particulate in Ceftriaxone 1 g injection, batch CFX-24052
Date: Sat, 26 Jul 2026 14:05:33 +0200

Dear Pharmacovigilance and Quality Team,

I am reporting a serious product quality defect with patient involvement. On 25 July 2026, reconstituted vials of Ceftriaxone Sodium 1 g powder for injection (batch CFX-24052, expiry 05/2028) contained visible white particulate matter.

The product had unfortunately been administered to a 68-year-old female patient before detection. She developed an infusion-site reaction and fever (38.4 C), treated symptomatically, and has fully recovered.

We have quarantined 18 vials from the same batch and suspended use hospital-wide. We request an urgent investigation and expect your adverse event acknowledgement within 24 hours.

Dr. Elena Rossi, Hospital Pharmacy Unit, Ospedale San Luca, Milan, Italy`

const TYPES = ['product_quality', 'packaging', 'labeling', 'contamination', 'efficacy_potency', 'adverse_event', 'delivery_documentation', 'other']

function Field({ label, required, flash, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="ml-0.5 text-red-500">*</span>}</Label>
      <div className={cn(flash && 'field-flash rounded-lg')}>{children}</div>
    </div>
  )
}

export default function NewComplaint() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const intake = useSelector((s) => s.intake)
  const { loading } = useSelector((s) => s.complaints)
  const [tab, setTab] = useState('text')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const running = intake.phase === 'running'
  const ready = intake.phase === 'done'
  const f = intake.form

  const onFile = (file) => {
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    dispatch(setFileName(file.name))
    dispatch(runIntake({ file: fd }))
  }

  const runText = () => {
    if (!intake.text.trim()) return toast.error('Paste the complaint email or text first.')
    dispatch(runIntake({ text: intake.text }))
  }

  const submit = async () => {
    for (const k of ['product_name', 'description', 'complainant_org', 'complaint_type']) {
      if (!f[k]) return toast.error(`"${k.replace(/_/g, ' ')}" is required before submission.`)
    }
    const res = await dispatch(createComplaint({
      form: f,
      ai: {
        risk: intake.risk, completeness: intake.completeness, duplicates: intake.duplicates,
        root_cause: intake.rootCause, capa: intake.capa, summary: intake.summary,
        raw_text: intake.text || undefined, source_filename: intake.fileName || undefined,
      },
    }))
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(`Complaint ${res.payload.complaint_number} logged`, { description: 'AI Copilot assessment attached to the complaint file.' })
      dispatch(reset())
      navigate(`/complaints/${res.payload.id}`)
    } else toast.error(res.error?.message || 'Submission failed')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="grid gap-5 xl:grid-cols-12">
        {/* ── AI Intake ── */}
        <Card className="reveal xl:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-glow text-white"><Bot className="h-4 w-4" /></span>
              AI Intake Agent
            </CardTitle>
            <CardDescription>Paste a complaint email or upload a PDF/EML — the LangGraph pipeline extracts, classifies and assesses it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full">
                <TabsTrigger value="text" className="flex-1"><Mail className="h-3.5 w-3.5" /> Paste Email / Text</TabsTrigger>
                <TabsTrigger value="file" className="flex-1"><FileUp className="h-3.5 w-3.5" /> Upload Document</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-2.5">
                <Textarea rows={9} placeholder="Paste the customer complaint email or transcript here…"
                  value={intake.text} onChange={(e) => dispatch(setText(e.target.value))} disabled={running}
                  className="font-mono text-xs leading-relaxed" />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={running} onClick={() => dispatch(setText(SAMPLE_PACKAGING))}>Load sample: packaging defect</Button>
                  <Button size="sm" variant="outline" disabled={running} onClick={() => dispatch(setText(SAMPLE_ADVERSE_EVENT))}>Load sample: adverse event</Button>
                </div>
                <Button className="w-full" variant="glow" size="lg" onClick={runText} disabled={running || !intake.text.trim()}>
                  <Wand2 className="h-4 w-4" /> {running ? 'Agents working…' : 'Run AI Intake Pipeline'}
                </Button>
              </TabsContent>

              <TabsContent value="file" className="space-y-2.5">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files?.[0]) }}
                  onClick={() => !running && fileRef.current?.click()}
                  className={cn('grid cursor-pointer place-items-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300',
                    dragOver ? 'scale-[1.02] border-brand-glow bg-brand-soft' : 'border-ink/15 bg-bone hover:border-brand/50 hover:bg-brand-soft/50')}>
                  <UploadCloud className={cn('mb-2 h-8 w-8 transition-transform duration-300', dragOver ? 'scale-125 text-brand-glow' : 'text-ink/30')} />
                  <p className="text-sm font-semibold">Drop complaint PDF / EML / TXT</p>
                  <p className="mt-0.5 text-xs text-ink/45">or click to browse · parsed with pypdf + email</p>
                  <input ref={fileRef} type="file" accept=".pdf,.eml,.txt,.md" className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0])} />
                </div>
                {intake.fileName && <p className="flex items-center gap-1.5 text-xs text-ink/60"><FileUp className="h-3.5 w-3.5 text-brand" /> {intake.fileName}</p>}
              </TabsContent>
            </Tabs>

            {intake.phase === 'error' && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{intake.error}</p>
            )}

            {(running || ready) && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ink/45">LangGraph pipeline</p>
                  {ready && <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Complete</span>}
                </div>
                <ExtractionProgress completed={intake.completed} running={running} />
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Log Customer Complaint form ── */}
        <Card className="reveal xl:col-span-7" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Log Customer Complaint
              {ready && <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-dark"><Sparkles className="h-3 w-3" /> AI pre-filled — review & edit</span>}
            </CardTitle>
            <CardDescription>Fields auto-populated by the extraction agent. Verify before committing to the complaint register.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Complainant Organization" required flash={intake.flashKeys.includes('complainant_org')}>
                <Input value={f.complainant_org} onChange={(e) => dispatch(setField({ key: 'complainant_org', value: e.target.value }))} placeholder="MedPharm Distribution GmbH" />
              </Field>
              <Field label="Contact Name" flash={intake.flashKeys.includes('complainant_name')}>
                <Input value={f.complainant_name} onChange={(e) => dispatch(setField({ key: 'complainant_name', value: e.target.value }))} placeholder="Sabine Krueger" />
              </Field>
              <Field label="Email" flash={intake.flashKeys.includes('email')}>
                <Input value={f.email} onChange={(e) => dispatch(setField({ key: 'email', value: e.target.value }))} placeholder="name@company.com" />
              </Field>
              <Field label="Country / Market" required flash={intake.flashKeys.includes('country')}>
                <Input value={f.country} onChange={(e) => dispatch(setField({ key: 'country', value: e.target.value }))} placeholder="Germany" />
              </Field>

              <div className="sm:col-span-2"><Separator /></div>

              <Field label="Product Name" required flash={intake.flashKeys.includes('product_name')}>
                <Input value={f.product_name} onChange={(e) => dispatch(setField({ key: 'product_name', value: e.target.value }))} placeholder="Amoxicillin 500 mg Hard Capsules" />
              </Field>
              <Field label="Product Code" flash={intake.flashKeys.includes('product_code')}>
                <Input value={f.product_code} onChange={(e) => dispatch(setField({ key: 'product_code', value: e.target.value }))} className="font-mono" placeholder="AMX-500-CAP" />
              </Field>
              <Field label="Batch / Lot Number" flash={intake.flashKeys.includes('batch_number')}>
                <Input value={f.batch_number} onChange={(e) => dispatch(setField({ key: 'batch_number', value: e.target.value }))} className="font-mono" placeholder="AMX-24091" />
              </Field>
              <Field label="Dosage Form" flash={intake.flashKeys.includes('dosage_form')}>
                <Input value={f.dosage_form} onChange={(e) => dispatch(setField({ key: 'dosage_form', value: e.target.value }))} placeholder="Capsule (FDF)" />
              </Field>
              <Field label="Complaint Type" required flash={intake.flashKeys.includes('complaint_type')}>
                <Select value={f.complaint_type} onValueChange={(v) => dispatch(setField({ key: 'complaint_type', value: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Classification" flash={intake.flashKeys.includes('classification')}>
                <Select value={f.classification} onValueChange={(v) => dispatch(setField({ key: 'classification', value: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select classification" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical — patient safety / regulatory</SelectItem>
                    <SelectItem value="major">Major — significant quality deviation</SelectItem>
                    <SelectItem value="minor">Minor — low impact</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Quantity Affected" flash={intake.flashKeys.includes('quantity_affected')}>
                <Input value={f.quantity_affected} onChange={(e) => dispatch(setField({ key: 'quantity_affected', value: e.target.value }))} placeholder="120 cartons" />
              </Field>
              <Field label="Date Received" flash={intake.flashKeys.includes('date_received')}>
                <Input type="date" value={f.date_received} onChange={(e) => dispatch(setField({ key: 'date_received', value: e.target.value }))} />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Complaint Description" required flash={intake.flashKeys.includes('description')}>
                  <Textarea rows={4} value={f.description} onChange={(e) => dispatch(setField({ key: 'description', value: e.target.value }))}
                    placeholder="Factual summary of the defect, circumstances and affected stock…" />
                </Field>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-ink/10 bg-bone px-3 py-2.5 transition-colors hover:border-red-300 sm:col-span-2">
                <input type="checkbox" checked={f.adverse_event} className="h-4 w-4 accent-red-600"
                  onChange={(e) => dispatch(setField({ key: 'adverse_event', value: e.target.checked }))} />
                <span className="text-xs font-semibold">Adverse event / patient safety involved</span>
                <span className="ml-auto text-[10px] text-ink/40">triggers pharmacovigilance flag</span>
              </label>
            </div>

            <Separator className="my-4" />
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-ink/40">Submitting creates a numbered complaint file (CC-2026-XXXX) with the full AI Copilot assessment attached.</p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => dispatch(reset())} disabled={running || loading}>Clear</Button>
                <Button variant="glow" size="lg" onClick={submit} disabled={running || loading || !ready}>
                  {loading ? 'Committing…' : 'Submit Complaint'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── AI Copilot ── */}
      {(running || ready) && (
        <div className="reveal">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-glow text-white"><Sparkles className="h-4 w-4" /></span>
            <div>
              <h3 className="font-display text-lg font-bold tracking-tight">AI Copilot — Risk Assessment & Recommendations</h3>
              <p className="text-xs text-ink/50">Panels populate live as each LangGraph node completes.</p>
            </div>
          </div>
          <CopilotPanel risk={intake.risk} completeness={intake.completeness} duplicates={intake.duplicates}
            rootCause={intake.rootCause} capa={intake.capa} summary={intake.summary} />
        </div>
      )}
    </div>
  )
}
