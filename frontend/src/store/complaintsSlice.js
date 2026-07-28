import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

export const fetchStats = createAsyncThunk('complaints/stats', () => api.get('/stats'))
export const fetchComplaints = createAsyncThunk('complaints/list', (params = {}) => {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.status) qs.set('status', params.status)
  if (params.risk) qs.set('risk', params.risk)
  return api.get(`/complaints?${qs}`)
})
export const fetchComplaint = createAsyncThunk('complaints/one', (id) => api.get(`/complaints/${id}`))
export const createComplaint = createAsyncThunk('complaints/create', (payload) => api.post('/complaints', payload))
export const updateComplaint = createAsyncThunk('complaints/update', ({ id, ...body }) => api.patch(`/complaints/${id}`, body))
export const analyzeComplaint = createAsyncThunk('complaints/analyze', (id) => api.post(`/complaints/${id}/analyze`))

const slice = createSlice({
  name: 'complaints',
  initialState: { stats: null, items: [], current: null, loading: false, error: null },
  reducers: { clearCurrent(s) { s.current = null } },
  extraReducers: (b) => {
    b.addCase(fetchStats.fulfilled, (s, a) => { s.stats = a.payload; s.loading = false })
    b.addCase(fetchComplaints.fulfilled, (s, a) => { s.items = a.payload; s.loading = false })
    b.addCase(fetchComplaint.fulfilled, (s, a) => { s.current = a.payload; s.loading = false })
    b.addCase(createComplaint.fulfilled, (s, a) => { s.current = a.payload; s.loading = false })
    b.addCase(updateComplaint.fulfilled, (s, a) => { s.current = a.payload; s.loading = false })
    b.addCase(analyzeComplaint.fulfilled, (s, a) => { s.current = a.payload; s.loading = false })
    b.addMatcher((a) => a.type.endsWith('/pending'), (s) => { s.loading = true; s.error = null })
    b.addMatcher((a) => a.type.endsWith('/rejected'), (s, a) => { s.loading = false; s.error = a.error.message })
  },
})

export const { clearCurrent } = slice.actions
export default slice.reducer
