import { createSlice } from '@reduxjs/toolkit'
import { streamIntake } from '@/lib/api'

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
  executingNode: null,
  error: null,
}

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
    setSending(s, a) { s.sending = a.payload; s.error = null },
    setExecutingNode(s, a) { s.executingNode = a.payload },
    handleError(s, a) {
      s.error = a.payload
      s.messages.push({ role: 'assistant', content: `⚠️ Error: ${a.payload}. Check your Groq API key and backend server.`, action: 'error' })
    },
    handleResult(s, a) {
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
    }
  },
})

export const { addUserMessage, setField, resetChat } = slice.actions

export const sendChat = ({ message, file }) => async (dispatch, getState) => {
  const { chat } = getState()
  const history = chat.messages.map((m) => ({ role: m.role, content: m.content }))
  
  dispatch(slice.actions.setSending(true))
  dispatch(slice.actions.setExecutingNode('classify_intent'))
  
  try {
    const onEvent = (data) => {
      if (data.node) {
        dispatch(slice.actions.setExecutingNode(data.node))
      } else if (data.result) {
        dispatch(slice.actions.handleResult(data.result))
      } else if (data.error) {
        throw new Error(data.error)
      }
    }
    
    if (file) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('message', message || 'Extract complaint details from this document.')
      fd.append('history', JSON.stringify(history))
      fd.append('form_state', JSON.stringify(chat.form))
      await streamIntake('/ai/chat-upload', { file: fd }, onEvent)
    } else {
      await streamIntake('/ai/chat', { json: { message, history, form_state: chat.form } }, onEvent)
    }
  } catch (err) {
    dispatch(slice.actions.handleError(err.message))
  } finally {
    dispatch(slice.actions.setSending(false))
    dispatch(slice.actions.setExecutingNode(null))
  }
}

export default slice.reducer
