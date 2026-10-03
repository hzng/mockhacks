import type { SelectHTMLAttributes } from 'react'

type SelectInputProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label: string
  options: Array<{ label: string; value: string }>
  hint?: string
  error?: string
}

export function SelectInput({ error, hint, id, label, options, ...props }: SelectInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const messageId = `${inputId}-${error ? 'error' : 'hint'}`

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <select
        aria-describedby={error || hint ? messageId : undefined}
        aria-invalid={Boolean(error)}
        className="text-input select-input"
        id={inputId}
        {...props}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <span className="field-error" id={messageId}>{error}</span>}
      {!error && hint && <span className="field-hint" id={messageId}>{hint}</span>}
    </div>
  )
}
