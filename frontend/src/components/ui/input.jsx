import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type} ref={ref}
    className={cn('flex h-9 w-full rounded-lg border border-ink/15 bg-white px-3 py-1 text-sm shadow-sm transition-all placeholder:text-ink/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:border-brand/50 disabled:cursor-not-allowed disabled:opacity-50', className)}
    {...props} />
))
Input.displayName = 'Input'
export { Input }
