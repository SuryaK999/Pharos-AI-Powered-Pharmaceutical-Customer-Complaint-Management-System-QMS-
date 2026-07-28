import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cn } from '@/lib/utils'

const Separator = React.forwardRef(({ className, orientation = 'horizontal', ...props }, ref) => (
  <SeparatorPrimitive.Root ref={ref}
    className={cn('shrink-0 bg-ink/10', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
    orientation={orientation} {...props} />
))
Separator.displayName = 'Separator'
export { Separator }
