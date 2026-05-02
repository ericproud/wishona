import type { ReactNode } from 'react'

type Props = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyStateCard({ icon, title, description, action, className }: Props) {
  return (
    <div className={`bg-card border border-border rounded-lg px-6 py-12 text-center ${className ?? ''}`}>
      {icon && (
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
