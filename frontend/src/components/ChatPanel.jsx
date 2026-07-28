import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Paperclip, Send, Bot, User, FilePlus2, Pencil, FileUp, Sparkles, Mail, Stethoscope, Phone } from 'lucide-react'
import { sendChat, addUserMessage } from '@/store/chatSlice'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

const SAMPLE_META = {
  'sample_complaint.eml': { title: 'Process urgent email', desc: 'Distributor complaint regarding blister seals', icon: Mail },
  'distributor_report.eml': { title: 'Temperature excursion email', desc: 'Logistics report of clouded insulin vials', icon: Mail },
  'clinical_feedback.txt': { title: 'Log clinical feedback', desc: 'Adverse event report from a doctor', icon: Stethoscope },
  'customer_call.txt': { title: 'Parse call transcript', desc: 'Support desk call about damaged packaging', icon: Phone }
}

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
  const [samples, setSamples] = useState([])
  const fileRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, sending])

  useEffect(() => {
    api.get('/samples').then(setSamples).catch(console.error)
  }, [])

  const send = (text) => {
    const msg = text || input.trim()
    if (!msg && !fileName) return
    dispatch(addUserMessage(msg || `Attached: ${fileName}`))
    const file = fileRef.current?.files?.[0]
    dispatch(sendChat({ message: msg, file: file || undefined }))
    setInput(''); setFileName(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  return (
    <div className="flex h-full flex-col bg-white">
      {/* ── header (minimalist) ── */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-brand">
            <Bot className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink">Pharos Copilot</h2>
            <p className="text-xs text-ink/50">Powered by Groq AI</p>
          </div>
        </div>
      </div>

      {/* ── messages area ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col pb-8 pt-4">
          
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center pt-2 text-center">
              <div className="mb-4 h-56 w-56 transition-transform duration-700 ease-in-out hover:scale-105">
                <img 
                  src="/chatbot.svg" 
                  alt="AI Assistant" 
                  className="h-full w-full object-contain animate-[idleFloat_4s_ease-in-out_infinite] opacity-95 drop-shadow-xl" 
                />
              </div>
              <h3 className="mb-2 text-[24px] font-semibold tracking-tight text-ink">How can I help you today?</h3>
              <p className="max-w-sm text-[14px] leading-relaxed text-ink/50">
                Instantly populate the complaint form, edit specific fields, or extract details from documents.
              </p>
              
              <div className="mt-8 grid w-full max-w-[560px] gap-3 sm:grid-cols-2">
                {samples.map((s, i) => {
                  const meta = SAMPLE_META[s.filename] || { title: `Process ${s.filename}`, desc: 'Extract data from this file', icon: Sparkles }
                  const Icon = meta.icon
                  return (
                    <button key={s.filename} onClick={() => setInput(`Please extract the complaint details from this text:\n\n${s.content}`)}
                      className="group flex items-start gap-3 rounded-xl border border-ink/10 bg-white p-4 text-left shadow-sm transition-all hover:border-brand/30 hover:bg-brand/5"
                      style={{ animation: `fadeUp .4s ${i * 100 + 200}ms both` }}>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand transition-transform group-hover:scale-110">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13.5px] font-semibold text-ink group-hover:text-brand">{meta.title}</span>
                        <span className="text-[12px] text-ink/60 line-clamp-1">{meta.desc}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex w-full', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                {m.role === 'assistant' && (
                  <span className="mr-4 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/5 bg-brand/5 text-brand">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
                
                <div className={cn('relative flex flex-col', m.role === 'user' ? 'max-w-[80%] items-end' : 'max-w-[85%] items-start')}>
                  <div className={cn('px-5 py-3 text-[14.5px] leading-relaxed',
                    m.role === 'user'
                      ? 'rounded-3xl rounded-tr-sm bg-bone text-ink shadow-sm'
                      : 'text-ink')}>
                    <Rich text={m.content} />
                  </div>

                  {m.action && m.action !== 'general' && m.action !== 'error' && (
                    <span className="mt-1.5 ml-2 inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
                      {m.action === 'log' ? '✓ Complaint Auto-filled' : m.action === 'edit' ? '✎ Form Updated' : '📄 Document Extracted'}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex w-full justify-start">
                <span className="mr-4 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/5 bg-brand/5 text-brand">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="flex h-11 items-center gap-1.5 px-2">
                  <span className="typing-dot" />
                  <span className="typing-dot" style={{ animationDelay: '0.15s' }} />
                  <span className="typing-dot" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>
      </div>

      {/* ── input area ── */}
      <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-2">
        {fileName && (
          <div className="mb-3 ml-2 flex items-center gap-2 w-max rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs font-medium text-brand">
            <Paperclip className="h-3.5 w-3.5" /> {fileName}
            <button onClick={() => { setFileName(null); if (fileRef.current) fileRef.current.value = '' }}
              className="ml-1 rounded-full p-0.5 text-brand/50 hover:bg-brand/10 hover:text-brand">✕</button>
          </div>
        )}
        
        <div className="relative flex w-full items-end gap-2 rounded-[24px] border border-ink/15 bg-white p-2 shadow-sm transition-all focus-within:border-brand/40 focus-within:ring-4 focus-within:ring-brand/10 hover:border-ink/25">
          <button onClick={() => fileRef.current?.click()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink/40 transition-colors hover:bg-bone hover:text-ink/80"
            title="Attach PDF / EML / TXT">
            <Paperclip className="h-5 w-5" />
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.eml,.txt,.md" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) setFileName(e.target.files[0].name) }} />
          
          <textarea ref={inputRef} rows={1} value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Message Pharos Copilot..."
            className="max-h-[200px] min-h-[40px] w-full resize-none bg-transparent py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-ink/40 focus:outline-none scrollbar-thin" 
          />
          
          <Button size="icon" onClick={() => send()} disabled={sending || (!input.trim() && !fileName)}
            className={cn("h-10 w-10 shrink-0 rounded-full transition-all duration-300", 
              input.trim() || fileName ? "bg-ink text-white hover:bg-ink/80" : "bg-bone text-ink/30")}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="mt-3 text-center text-[10px] text-ink/40">
          Pharos Copilot can make mistakes. Consider verifying critical information.
        </p>
      </div>
    </div>
  )
}
