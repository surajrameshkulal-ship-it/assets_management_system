import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
        success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        danger: 'bg-red-500/20 text-red-300 border border-red-500/30',
        neutral: 'bg-white/10 text-surface-200 border border-white/10',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export function statusBadge(status: string) {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'default'> = {
    available: 'success',
    assigned: 'default',
    maintenance: 'warning',
    retired: 'neutral',
    active: 'success',
    expiring: 'warning',
    expired: 'danger',
    compliance_risk: 'danger',
    open: 'warning',
    in_progress: 'default',
    resolved: 'success',
    closed: 'neutral',
    low: 'neutral',
    medium: 'default',
    high: 'warning',
    critical: 'danger',
  }
  return map[status] || 'neutral'
}
