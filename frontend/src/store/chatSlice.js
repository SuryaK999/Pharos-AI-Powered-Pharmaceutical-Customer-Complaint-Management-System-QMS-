import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api, base } from '@/lib/api'

const emptyForm = {
  complainant_name: '', complainant_org: '', email: '', country: '',
  product_name: '', product_code: '', product_strength: '',
  batch_number: '', manufacturing_date: '', expiry_date: '',
  dosage_form: '', grade: '', complaint_type: '', classification: '',
  adverse_event: false, quantity_affected: '', date_received: '',
  description: '', source_channel: 'verbal',
}

const initialState = {
  messages: [],
  form: { ...emptyForm },
  risk: null,
  duplicates: [],
  flashKeys: [],
  sending: false,
  error: null,
}

export const sendChat = createAsyncThunk('chat/send', async ({ message, file }, { getState }) => {
  const { chat } = getState()
  const history = chat.messages.map((m) => ({ role: m.role, content: m.content }))
  if (file) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('message', message || 'Extract complaint details from this document.')
    fd.append('history', JSON.stringify(history))
    fd.append('form_state', JSON.stringify(chat.form))
    const res = await fetch(`${base}/ai/chat-upload`, { method: 'POST', body: fd })
    if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || 'Upload failed') }
    return res.json()
  }
  return api.post('/ai/chat', { message, history, form_state: chat.form })
})

const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage(s, a) { s.messages.push({ role: 'user', content: a.payload }) },
    setField(s, a) {
      s.form[a.payload.key] = a.payload.value
      s.flashKeys = s.flashKeys.filter((k) => k !== a.payload.key)
    },
    resetChat() { return { ...initialState, form: { ...emptyForm } } },
  },
  extraReducers: (b) => {
    b.addCase(sendChat.pending, (s) => { s.sending = true; s.error = null })
    b.addCase(sendChat.rejected, (s, a) => {
      s.sending = false; s.error = a.error.message
      s.messages.push({ role: 'assistant', content: `⚠️ Error: ${a.error.message}. Check your Groq API key and backend server.`, action: 'error' })
    })
    b.addCase(sendChat.fulfilled, (s, a) => {
      s.sending = false
      const d = a.payload
      s.messages.push({ role: 'assistant', content: d.reply, action: d.action })
      if (d.form_updates && Object.keys(d.form_updates).length) {
        const changed = []
        for (const [k, v] of Object.entries(d.form_updates)) {
          if (k in s.form && v != null) {
            s.form[k] = typeof v === 'boolean' ? v : String(v)
            changed.push(k)
          }
        }
        s.flashKeys = changed
      }
      if (d.risk_assessment) s.risk = d.risk_assessment
      if (d.duplicates) s.duplicates = d.duplicates
    })
  },
})

export const { addUserMessage, setField, resetChat } = slice.actions
export default slice.reducer
