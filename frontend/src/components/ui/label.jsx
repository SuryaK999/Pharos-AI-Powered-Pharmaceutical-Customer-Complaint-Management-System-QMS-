import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref}
    className={cn('text-[11px] font-semibold uppercase tracking-[.08em] text-ink/55 peer-disabled:cursor-not-allowed peer-disabled:opacity-60', className)}
    {...props} />
))
Label.displayName = 'Label'
export { Label }
