import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Paperclip, Send, Bot, User, FilePlus2, Pencil, FileUp,
  Sparkles, ArrowRight, ShieldCheck, Zap,
} from 'lucide-react'
import { sendChat, addUserMessage } from '@/store/chatSlice'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

const CAPS = [
  { icon: FilePlus2, title: 'Log a complaint', desc: 'Describe it in plain language — I populate the form & risk assessment',
    prompt: 'Apollo Pharmacy reported discolored capsules in Amoxicillin 500mg, batch AMX24091. About 120 cartons affected in the German market.' },
  { icon: Pencil, title: 'Edit any field', desc: 'Say "change batch to BMX24602" — I update only that, everything else stays',
    prompt: 'Sorry, the batch number is BMX24602 and the affected quantity is 48 capsules.' },
  { icon: FileUp, title: 'Extract from a document', desc: 'Attach a complaint PDF or email via the paperclip below', prompt: null },
]

const Rich = ({ text }) => (
  <>
    {String(text).split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
        : <span key={i}>{p}</span>)}
  </>
)

export default function ChatPanel() {
  const dispatch = useDispatch()
  const { messages, sending } = useSelector((s) => s.chat)
  const [input, setInput] = useState('')
  const [fileName, setFileName] = useState(null)
  const fileRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, sending])

  const send = (text) => {
    const msg = text || input.trim()
    if (!msg && !fileName) return
    dispatch(addUserMessage(msg || `Attached: ${fileName}`))
    const file = fileRef.current?.files?.[0]
    dispatch(sendChat({ message: msg, file: file || undefined }))
    setInput(''); setFileName(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const autoResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 132) + 'px'
  }

  return (
    <div className="flex h-full flex-col">
      {/* ═══ HEADER ═══ */}
      <div className="relative shrink-0 border-b border-ink/[0.07] bg-white/70 px-5 py-4 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand/[0.06] via-transparent to-brand-glow/[0.06]" />
        <div className="relative flex items-center gap-3.5">
          <div className="relative">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-glow shadow-glow">
              <Bot className="h-5 w-5 text-white" strokeWidth={2} />
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-bold leading-tight tracking-tight">Pharos Copilot</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink/50">
              <ShieldCheck className="h-3 w-3 text-brand" /> Quality AI Assistant · ICH Q9 aligned
            </p>
          </div>
          <span className="hidden items-center gap-1 rounded-full border border-brand/20 bg-brand-soft px-2.5 py-1 font-mono text-[9px] font-semibold text-brand-dark sm:flex">
            <Zap className="h-2.5 w-2.5" /> gemma2-9b-it
          </span>
        </div>
      </div>

      {/* ═══ MESSAGES ═══ */}
      <div className="chat-ambient flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-2xl space-y-5">
          {messages.length === 0 && (
            <div className="space-y-6 pt-2">
              <div className="msg-in flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-glow text-white shadow-glow">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="rounded-2xl rounded-tl-md border border-ink/[0.06] bg-white px-5 py-4 shadow-card">
                  <p className="text-[13.5px] leading-relaxed text-ink/80">
                    Hello, I'm your <strong className="font-semibold text-brand-dark">Pharos Copilot</strong>.
                    Describe a customer complaint and I'll populate the form, classify the risk, and
                    recommend next steps — instantly.
                  </p>
                  <p className="mt-2 text-[12px] text-ink/45">How can I help with quality today?</p>
                </div>
              </div>

              <div className="space-y-2.5 pl-11">
                {CAPS.map((c, i) => (
                  <button key={i} onClick={() => c.prompt && send(c.prompt)}
                    className={cn('group flex w-full items-center gap-4 rounded-xl border border-ink/[0.07] bg-white/90 p-4 text-left shadow-card backdrop-blur-sm transition-all duration-200',
                      c.prompt ? 'hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lift' : 'cursor-default')}
                    style={{ animation: `fadeUp .5s ${150 + i * 90}ms both` }}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition-all duration-200 group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
                      <c.icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-ink">{c.title}</span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-ink/50">{c.desc}</span>
                    </span>
                    {c.prompt && <ArrowRight className="h-4 w-4 shrink-0 text-ink/20 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={cn('msg-in flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
              <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-xl',
                m.role === 'user' ? 'bg-ink text-white' : 'bg-gradient-to-br from-brand to-brand-glow text-white shadow-glow')}>
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>
              <div className="max-w-[82%] space-y-1.5">
                <div className={cn('rounded-2xl px-5 py-3.5 text-[13.5px] leading-relaxed',
                  m.role === 'user'
                    ? 'rounded-tr-md bg-gradient-to-br from-brand to-brand-dark text-white shadow-lift'
                    : 'rounded-tl-md border border-ink/[0.06] bg-white text-ink/80 shadow-card')}>
                  <Rich text={m.content} />
                </div>
                {m.action && m.action !== 'general' && m.action !== 'error' && (
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider',
                    m.action === 'log' ? 'bg-emerald-50 text-emerald-700' :
                    m.action === 'edit' ? 'bg-amber-50 text-amber-700' : 'bg-brand-soft text-brand-dark')}>
                    {m.action === 'log' ? '✓ Complaint logged' : m.action === 'edit' ? '✎ Fields updated' : '📄 Document extracted'}
                  </span>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="msg-in flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-glow text-white shadow-glow">
                <Bot className="h-4 w-4" />
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-ink/[0.06] bg-white px-5 py-4 shadow-card">
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: '0.15s' }} />
                <span className="typing-dot" style={{ animationDelay: '0.3s' }} />
                <span className="ml-2 text-[11px] text-ink/40">analyzing…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ═══ INPUT ═══ */}
      <div className="shrink-0 border-t border-ink/[0.07] bg-white/80 px-5 pb-4 pt-3.5 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl">
          {fileName && (
            <p className="mb-2.5 flex items-center gap-2 rounded-xl border border-brand/25 bg-brand-soft px-3.5 py-2 text-[11.5px] font-medium text-brand-dark">
              <Paperclip className="h-3.5 w-3.5" /> {fileName}
              <button onClick={() => { setFileName(null); if (fileRef.current) fileRef.current.value = '' }}
                className="ml-auto rounded-full px-1.5 text-brand/50 transition-colors hover:bg-brand/10 hover:text-brand">✕</button>
            </p>
          )}
          <div className="flex items-end gap-2 rounded-2xl border border-ink/[0.1] bg-white p-2 shadow-card transition-all duration-200 focus-within:border-brand/50 focus-within:shadow-glow">
            <button onClick={() => fileRef.current?.click()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink/40 transition-all duration-200 hover:bg-brand-soft hover:text-brand"
              title="Attach PDF / EML / TXT">
              <Paperclip className="h-[18px] w-[18px]" />
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.eml,.txt,.md" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) setFileName(e.target.files[0].name) }} />
            <textarea rows={1} value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(e) }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder='Describe a complaint, or "change batch to BMX24602"…'
              className="max-h-[132px] min-h-[36px] flex-1 resize-none bg-transparent px-1.5 py-2 text-[13.5px] placeholder:text-ink/30 focus:outline-none" />
            <Button size="icon" onClick={() => send()} disabled={sending || (!input.trim() && !fileName)}
              className="h-9 w-9 shrink-0 rounded-xl transition-transform duration-200 hover:scale-105">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-[9.5px] text-ink/30">
            Pharos Copilot can make mistakes · verify critical fields before submission
          </p>
        </div>
      </div>
    </div>
  )
}
