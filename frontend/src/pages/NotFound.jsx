import { Link } from 'react-router-dom'
import { Compass, Home, Search, FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="dotgrid flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="reveal relative">
        <p className="font-display text-[120px] font-bold leading-none tracking-tighter text-brand/10 select-none sm:text-[180px]">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="grid h-20 w-20 animate-pulse place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-glow shadow-lift">
            <Compass className="h-10 w-10 text-white" strokeWidth={1.5} />
          </span>
        </div>
      </div>
      <h1 className="reveal mt-6 font-display text-2xl font-bold tracking-tight" style={{ animationDelay: '100ms' }}>
        Lost in the quality fog
      </h1>
      <p className="reveal mt-2 max-w-md text-sm leading-relaxed text-ink/55" style={{ animationDelay: '200ms' }}>
        This page doesn't exist in the complaint register. Even our best investigators
        couldn't find it — and they once tracked a missing batch across three continents.
      </p>
      <div className="reveal mt-8 flex gap-3" style={{ animationDelay: '300ms' }}>
        <Link to="/"><Button variant="glow" size="lg"><Home className="h-4 w-4" /> Dashboard</Button></Link>
        <Link to="/complaints"><Button variant="outline" size="lg"><Search className="h-4 w-4" /> Complaint Register</Button></Link>
        <Link to="/complaints/new"><Button variant="outline" size="lg"><FileQuestion className="h-4 w-4" /> Log Complaint</Button></Link>
      </div>
      <p className="reveal mt-10 font-mono text-[10px] text-ink/25" style={{ animationDelay: '400ms' }}>
        PHAROS QMS · ERROR 404 · ROUTE NOT FOUND
      </p>
    </div>
  )
}
