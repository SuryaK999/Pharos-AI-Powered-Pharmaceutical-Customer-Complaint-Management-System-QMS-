import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Paperclip, Send, Bot, User, FilePlus2, Pencil, FileUp, Sparkles } from 'lucide-react'
import { sendChat, addUserMessage } from '@/store/chatSlice'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

const CAPS = [
  { icon: FilePlus2, title: 'Log a complaint', desc: 'Describe it in plain language — I fill the form',
    prompt: 'Apollo Pharmacy reported discolored capsules in Amoxicillin 500mg, batch AMX24091. About 120 cartons affected in the German market.' },
  { icon: Pencil, title: 'Edit any field', desc: 'Say "change batch to BMX24602" — I update just that',
    prompt: 'Sorry, the batch number is BMX24602 and the affected quantity is 48 capsules.' },
  { icon: FileUp, title: 'Extract from a document', desc: 'Attach a PDF or email via the paperclip below', prompt: null },
]

/** Renders **bold** markers from the AI as real <strong> tags */
const Rich = ({ text }) => (
  <>
    {String(text).split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="font-semibold text-inherit">{p.slice(2, -2)}</strong>
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
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex h-full flex-col">
      {/* ── header ── */}
      <div className="relative flex items-center gap-3 border-b border-ink/[0.07] px-4 py-3.5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-r from-brand/[0.05] to-transparent" />
        <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-glow shadow-[0_4px_16px_rgba(23,160,140,.3)]">
          <Bot className="h-4.5 w-4.5 h-[18px] w-[18px] text-white" />
        </span>
        <div className="relative">
          <p className="font-display text-[14px] font-bold leading-tight tracking-tight">Pharos Copilot</p>
          <p className="flex items-center gap-1.5 text-[10.5px] text-ink/45">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Log · Edit · Extract — powered by Groq
          </p>
        </div>
        <span className="relative ml-auto rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-dark">
          AI
        </span>
      </div>

      {/* ── messages ── */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><Sparkles className="h-3.5 w-3.5" /></span>
              <div className="rounded-2xl rounded-tl-sm border border-ink/[0.06] bg-white px-4 py-3 text-[13px] leading-relaxed text-ink/75 shadow-sm">
                Hello! I'm your <strong>Pharos QMS Copilot</strong>. Tell me about a customer
                complaint and I'll populate the form and risk assessment instantly. What can I do?
              </div>
            </div>
            <div className="grid gap-2 pl-9">
              {CAPS.map((c, i) => (
                <button key={i} onClick={() => c.prompt && send(c.prompt)}
                  className={cn('group flex items-start gap-3 rounded-xl border border-ink/[0.07] bg-white p-3 text-left shadow-sm transition-all duration-200',
                    c.prompt ? 'hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lift' : 'cursor-default')}
                  style={{ animation: `fadeUp .45s ${120 + i * 80}ms both` }}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand transition-transform duration-200 group-hover:scale-110">
                    <c.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-semibold text-ink">{c.title}</span>
                    <span className="block text-[11px] leading-snug text-ink/50">{c.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn('flex gap-2.5', m.role === 'user' && 'flex-row-reverse')}>
            <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full',
              m.role === 'user' ? 'bg-ink text-white' : 'bg-brand-soft text-brand')}>
              {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </span>
            <div className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm',
              m.role === 'user'
                ? 'rounded-tr-sm bg-gradient-to-br from-brand to-brand-dark text-white'
                : 'rounded-tl-sm border border-ink/[0.06] bg-white text-ink/80')}>
              <Rich text={m.content} />
              {m.action && m.action !== 'general' && m.action !== 'error' && (
                <span className={cn('mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                  m.role === 'assistant' ? 'bg-brand-soft text-brand-dark' : 'bg-white/20 text-white')}>
                  {m.action === 'log' ? '✓ Complaint logged' : m.action === 'edit' ? '✎ Fields updated' : '📄 Document extracted'}
                </span>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><Bot className="h-3.5 w-3.5" /></span>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-ink/[0.06] bg-white px-4 py-3.5 shadow-sm">
              <span className="typing-dot" />
              <span className="typing-dot" style={{ animationDelay: '0.15s' }} />
              <span className="typing-dot" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── input ── */}
      <div className="border-t border-ink/[0.07] bg-white/60 p-3">
        {fileName && (
          <p className="mb-2 flex items-center gap-2 rounded-lg border border-brand/25 bg-brand-soft px-3 py-1.5 text-[11px] font-medium text-brand-dark">
            <Paperclip className="h-3 w-3" /> {fileName}
            <button onClick={() => { setFileName(null); if (fileRef.current) fileRef.current.value = '' }}
              className="ml-auto rounded-full px-1 text-brand/50 transition-colors hover:bg-brand/10 hover:text-brand">✕</button>
          </p>
        )}
        <div className="flex items-end gap-2 rounded-xl border border-ink/[0.1] bg-white p-1.5 shadow-sm transition-all focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/20">
          <button onClick={() => fileRef.current?.click()}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/40 transition-all hover:bg-brand-soft hover:text-brand"
            title="Attach PDF / EML / TXT">
            <Paperclip className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.eml,.txt,.md" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) setFileName(e.target.files[0].name) }} />
          <textarea rows={1} value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(e) }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder='Describe a complaint, or "change batch to BMX24602"…'
            className="max-h-[120px] min-h-[32px] flex-1 resize-none bg-transparent px-1 py-1.5 text-[13px] placeholder:text-ink/30 focus:outline-none" />
          <Button size="icon" onClick={() => send()} disabled={sending || (!input.trim() && !fileName)}
            className="h-8 w-8 shrink-0 rounded-lg">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="mt-1.5 px-1 text-center text-[9px] text-ink/30">Pharos Copilot can make mistakes · verify critical fields before submission</p>
      </div>
    </div>
  )
}
