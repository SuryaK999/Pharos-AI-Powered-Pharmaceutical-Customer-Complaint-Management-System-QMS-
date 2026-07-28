import { cn } from '@/lib/utils'
const Skeleton = ({ className, ...props }) => (
  <div className={cn('shimmer rounded-lg', className)} {...props} />
)
export { Skeleton }
