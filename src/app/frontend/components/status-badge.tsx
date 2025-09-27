import { useMemo } from 'react'
import { Badge } from './ui/badge'

interface StatusBadgeProps {
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const className = useMemo(() => {
    const baseClass = 'status-badge-futuristic'
    const statusClasses = {
      DRAFT: 'status-badge-draft',
      PUBLISHED: 'status-badge-published',
      CANCELLED: 'status-badge-cancelled'
    }
    return `${baseClass} ${statusClasses[status]}`
  }, [status])

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  )
}

