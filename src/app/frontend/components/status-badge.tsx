import { useMemo } from 'react'
import { Badge } from './ui/badge'

interface StatusBadgeProps {
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = useMemo(() => {
    const variants = {
      DRAFT: { variant: 'secondary' as const, color: 'text-slate-600' },
      PUBLISHED: { variant: 'default' as const, color: 'text-green-600' },
      CANCELLED: { variant: 'destructive' as const, color: 'text-red-600' }
    }
    return variants[status]
  }, [status])

  return (
    <Badge variant={config.variant} className={config.color}>
      {status}
    </Badge>
  )
}

