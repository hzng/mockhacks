import type { PropsWithChildren } from 'react'

type BadgeProps = PropsWithChildren<{ tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info' }>

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
