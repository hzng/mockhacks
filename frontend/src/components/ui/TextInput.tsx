import type { InputHTMLAttributes } from 'react'

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }

export function TextInput({ error, id, label, ...props }: TextInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const errorId = `${inputId}-error`
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} className="text-input" id={inputId} {...props} />
      {error && <span className="field-error" id={errorId}>{error}</span>}
    </div>
  )
}
