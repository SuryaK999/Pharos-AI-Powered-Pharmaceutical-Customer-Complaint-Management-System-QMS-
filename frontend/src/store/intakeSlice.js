import { createSlice } from '@reduxjs/toolkit'
import { streamIntake } from '@/lib/api'

/** Maps LangGraph node names -> state keys */
export const NODE_KEY = {
  extract: 'extracted',
  agent_risk: 'risk',
  agent_completeness: 'completeness',
  agent_duplicates: 'duplicates',
  agent_root_cause: 'rootCause',
  agent_capa: 'capa',
  summarize: 'summary',
}

const emptyForm = {
  complainant_name: '', complainant_org: '', email: '', country: '',
  product_name: '', product_code: '', batch_number: '', dosage_form: '',
  complaint_type: '', classification: '', adverse_event: false,
  quantity_affected: '', date_received: '', description: '', source_channel: 'email',
}

const initialState = {
  phase: 'idle', // idle | running | done | error
  text: '', fileName: null,
  completed: [], error: null,
  extracted: null, risk: null, completeness: null, duplicates: null,
  rootCause: null, capa: null, summary: null,
  form: { ...emptyForm }, flashKeys: [],
}

const slice = createSlice({
  name: 'intake',
  initialState,
  reducers: {
    setText(s, a) { s.text = a.payload },
    setFileName(s, a) { s.fileName = a.payload },
    started(s) {
      Object.assign(s, { phase: 'running', completed: [], error: null, extracted: null, risk: null,
        completeness: null, duplicates: null, rootCause: null, capa: null, summary: null, flashKeys: [] })
    },
    nodeDone(s, a) {
      const { node, data } = a.payload
      s[NODE_KEY[node]] = data[node]
      if (!s.completed.includes(node)) s.completed.push(node)
      if (node === 'extract' && data.extracted && !data.extracted.error) {
        const ext = data.extracted
        const filled = Object.keys(emptyForm).filter((k) => ext[k] != null && ext[k] !== '')
        filled.forEach((k) => { s.form[k] = k === 'adverse_event' ? Boolean(ext[k]) : String(ext[k]) })
        s.flashKeys = filled
      }
    },
    failed(s, a) { s.phase = 'error'; s.error = a.payload },
    done(s) { if (s.phase === 'running') s.phase = 'done' },
    setField(s, a) {
      s.form[a.payload.key] = a.payload.value
      s.flashKeys = s.flashKeys.filter((k) => k !== a.payload.key)
    },
    reset() { return { ...initialState, form: { ...emptyForm } } },
  },
})

export const { setText, setFileName, setField, reset } = slice.actions

/** Streams the LangGraph run, dispatching per-node progress to the UI. */
export const runIntake = ({ text, file }) => async (dispatch) => {
  dispatch(slice.actions.started())
  try {
    await streamIntake(file ? '/ai/process-file' : '/ai/process-text',
      file ? { file } : { json: { text } },
      (ev) => {
        if (ev.type === 'node') dispatch(slice.actions.nodeDone({ node: ev.node, data: ev.data }))
        else if (ev.type === 'error') dispatch(slice.actions.failed(ev.message))
      })
    dispatch(slice.actions.done())
  } catch (e) {
    dispatch(slice.actions.failed(e.message || 'AI intake failed'))
  }
}

export default slice.reducer
