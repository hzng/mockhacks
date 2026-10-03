type ProgressProps = {
  label: string
  value: number
  max?: number
  showValue?: boolean
}

export function Progress({ label, max = 100, showValue = true, value }: ProgressProps) {
  const safeValue = Math.min(Math.max(value, 0), max)
  const percentage = max > 0 ? (safeValue / max) * 100 : 0

  return (
    <div className="progress-field">
      <div className="progress-heading"><span>{label}</span>{showValue && <span>{Math.round(percentage)}%</span>}</div>
      <div
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        className="progress-track"
        role="progressbar"
      >
        <span className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
