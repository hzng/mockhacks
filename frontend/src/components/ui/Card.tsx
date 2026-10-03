import type { HTMLAttributes, PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<HTMLAttributes<HTMLElement>>

export function Card({ children, className = '', ...props }: CardProps) {
  return <section className={`card ${className}`.trim()} {...props}>{children}</section>
}
