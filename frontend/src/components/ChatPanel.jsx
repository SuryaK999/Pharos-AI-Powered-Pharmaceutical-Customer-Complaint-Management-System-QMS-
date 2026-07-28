import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Paperclip, Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { sendChat, addUserMessage } from '@/store/chatSlice'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'Apollo Pharmacy reported discolored capsules in Amoxicillin 500mg, batch AMX24091. About 120 cartons affected in the German market.',
  'Sorry, the batch number is BMX24602 and the affected quantity is 48 capsules.',
  'Ceftriaxone 1g injection batch CFX-24052 had visible particulate. A 68-year-old patient developed fever after administration.',
]

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
    dispatch(addUserMessage(msg || `Uploaded: ${fileName}`))
    const file = fileRef.current?.files?.[0]
    dispatch(sendChat({ message: msg, file: file || undefined }))
    setInput(''); setFileName(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-ink/8 px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-glow text-white">
          <Bot className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-sm font-bold leading-tight">Pharos Copilot</p>
          <p className="text-[10px] text-ink/45">Log, edit, or extract — just type naturally</p>
        </div>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3 pt-4">
            <div className="flex gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><Sparkles className="h-3.5 w-3.5" /></span>
              <div className="rounded-2xl rounded-tl-sm bg-bone px-3.5 py-2.5 text-[13px] leading-relaxed text-ink/75">
                Hello Surya! I'm your <strong>Pharos QMS Copilot</strong>. I can:<br />
                ① <strong>Log</strong> — describe a complaint and I'll fill the form<br />
                ② <strong>Edit</strong> — say "change batch to BMX24602"<br />
                ③ <strong>Extract</strong> — upload a PDF/email via the 📎 button<br /><br />
                Try an example below or type your own.
              </div>
            </div>
            <div className="space-y-1.5 pl-9">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="block w-full rounded-lg border border-brand/20 bg-brand-soft/50 px-3 py-2 text-left text-[11px] leading-snug text-ink/65 transition-all hover:border-brand/50 hover:bg-brand-soft hover:text-ink">
                  {s.length > 95 ? s.slice(0, 95) + '…' : s}
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
            <div className={cn('max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
              m.role === 'user' ? 'rounded-tr-sm bg-brand text-white' : 'rounded-tl-sm bg-bone text-ink/80')}>
              {m.content}
              {m.action && m.action !== 'general' && m.action !== 'error' && (
                <span className={cn('mt-1.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                  m.role === 'assistant' ? 'bg-brand/10 text-brand' : 'bg-white/20 text-white')}>
                  {m.action === 'log' ? '✓ Logged' : m.action === 'edit' ? '✎ Updated' : '📄 Extracted'}
                </span>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><Bot className="h-3.5 w-3.5" /></span>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-bone px-4 py-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
              <span className="text-xs text-ink/50">Copilot is analyzing…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-ink/8 p-3">
        {fileName && (
          <p className="mb-2 flex items-center gap-1.5 rounded-lg bg-brand-soft px-2.5 py-1.5 text-[11px] font-medium text-brand-dark">
            <Paperclip className="h-3 w-3" /> {fileName}
            <button onClick={() => { setFileName(null); if (fileRef.current) fileRef.current.value = '' }}
              className="ml-auto text-brand/50 hover:text-brand">✕</button>
          </p>
        )}
        <div className="flex items-end gap-2">
          <button onClick={() => fileRef.current?.click()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink/15 text-ink/40 transition-all hover:border-brand/50 hover:text-brand"
            title="Attach PDF / EML / TXT">
            <Paperclip className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.eml,.txt,.md" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) setFileName(e.target.files[0].name) }} />
          <textarea rows={1} value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder='Describe a complaint, or "change batch to BMX24602"…'
            className="max-h-28 min-h-[36px] flex-1 resize-none rounded-lg border border-ink/15 bg-white px-3 py-2 text-[13px] shadow-sm placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-brand/30" />
          <Button size="icon" onClick={() => send()} disabled={sending || (!input.trim() && !fileName)} className="h-9 w-9 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
