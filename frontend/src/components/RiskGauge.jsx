import { RISK_META } from './badges'

/** Animated 180° ICH Q9 risk gauge (score = severity × probability, 1–25). */
export default function RiskGauge({ severity, probability, score, level, size = 170 }) {
  const pct = Math.min(1, (score || 0) / 25)
  const R = 62, LEN = Math.PI * R
  const tone = (RISK_META[level] || { tone: '#94a3b8' }).tone
  const Pips = ({ value, label }) => (
    <div className="text-center">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="h-1.5 w-3 rounded-full transition-colors duration-500"
            style={{ background: i <= (value || 0) ? tone : 'rgba(15,31,27,.12)' }} />
        ))}
      </div>
      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[.14em] text-ink/45">{label} {value || '–'}</p>
    </div>
  )
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 26 }}>
        <svg viewBox="0 0 160 92" width={size} height={size * 0.575}>
          <path d="M 18 84 A 62 62 0 0 1 142 84" fill="none" stroke="rgba(15,31,27,.08)" strokeWidth="13" strokeLinecap="round" />
          <path d="M 18 84 A 62 62 0 0 1 142 84" fill="none" stroke={tone} strokeWidth="13" strokeLinecap="round"
            strokeDasharray={LEN} strokeDashoffset={LEN * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1), stroke .5s' }} />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <p className="font-display text-4xl font-bold leading-none tracking-tight" style={{ color: tone }}>{score ?? '–'}</p>
          <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-ink/40">Risk Priority</p>
        </div>
      </div>
      <div className="mt-3 flex w-full justify-center gap-8">
        <Pips value={severity} label="Severity" />
        <Pips value={probability} label="Probability" />
      </div>
    </div>
  )
}
