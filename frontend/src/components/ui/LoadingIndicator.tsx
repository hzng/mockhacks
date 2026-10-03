export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <span aria-label={label} className="spinner" role="status" />
}

export function Skeleton({ className = '', shape = 'text' }: { className?: string; shape?: 'text' | 'circle' | 'block' }) {
  return <span aria-hidden="true" className={`skeleton skeleton-${shape} ${className}`.trim()} />
}
