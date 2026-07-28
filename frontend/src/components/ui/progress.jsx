import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

const Progress = React.forwardRef(({ className, value, tone = 'bg-brand', ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-ink/8', className)} {...props}>
    <ProgressPrimitive.Indicator
      className={cn('h-full w-full flex-1 rounded-full transition-transform duration-700 ease-out', tone)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </ProgressPrimitive.Root>
))
Progress.displayName = 'Progress'
export { Progress }
