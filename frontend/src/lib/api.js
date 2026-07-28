const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
export { API as base }

async function handle(res) {
  if (!res.ok) {
    let msg = 'Request failed'
    try { msg = (await res.json()).detail || msg } catch {}
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return res.json()
}

export const api = {
  get: (p) => fetch(`${API}${p}`).then(handle),
  post: (p, b) => fetch(`${API}${p}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(handle),
  patch: (p, b) => fetch(`${API}${p}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(handle),
}

/** Consume the FastAPI SSE stream emitted by the LangGraph pipeline. */
export async function streamIntake(path, { json, file }, onEvent) {
  const opts = file
    ? { method: 'POST', body: file }
    : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(json) }
  const res = await fetch(`${API}${path}`, opts)
  if (!res.ok) {
    let msg = 'Intake request failed'
    try { msg = (await res.json()).detail || msg } catch {}
    throw new Error(msg)
  }
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let idx
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const raw = buf.slice(0, idx); buf = buf.slice(idx + 2)
      const line = raw.split('\n').find((l) => l.startsWith('data: '))
      if (line) onEvent(JSON.parse(line.slice(6)))
    }
  }
}
