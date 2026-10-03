type SwitchProps = {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
  description?: string
  className?: string
}

export function Switch({ checked, className = '', description, label, onChange }: SwitchProps) {
  return (
    <div className={`switch-control ${className}`.trim()}>
      <button
        aria-checked={checked}
        className="switch-button"
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      >
        <span className="switch-track" aria-hidden="true"><span className="switch-thumb" /></span>
        <span className="switch-copy">
          <span className="switch-label">{label}</span>
          {description && <span className="field-hint">{description}</span>}
        </span>
      </button>
    </div>
  )
}
