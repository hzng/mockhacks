import type { PropsWithChildren } from 'react'

type AlertProps = PropsWithChildren<{ tone?: 'success' | 'info' | 'warning' | 'danger'; title: string }>

export function Alert({ children, title, tone = 'success' }: AlertProps) {
  return <div className={`alert alert-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}><strong>{title}</strong><span>{children}</span></div>
}
