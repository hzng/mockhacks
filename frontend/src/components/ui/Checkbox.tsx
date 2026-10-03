import type { InputHTMLAttributes } from 'react'

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  description?: string
}

export function Checkbox({ description, id, label, ...props }: CheckboxProps) {
  const inputId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <label className="checkbox-control" htmlFor={inputId}>
      <input className="checkbox-input" id={inputId} type="checkbox" {...props} />
      <span className="checkbox-copy">
        <span className="checkbox-label">{label}</span>
        {description && <span className="field-hint">{description}</span>}
      </span>
    </label>
  )
}
