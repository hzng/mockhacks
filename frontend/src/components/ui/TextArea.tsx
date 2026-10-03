import type { TextareaHTMLAttributes } from 'react'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
  error?: string
}

export function TextArea({ error, hint, id, label, ...props }: TextAreaProps) {
  const inputId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const messageId = `${inputId}-${error ? 'error' : 'hint'}`

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <textarea
        aria-describedby={error || hint ? messageId : undefined}
        aria-invalid={Boolean(error)}
        className="text-input text-area"
        id={inputId}
        {...props}
      />
      {error && <span className="field-error" id={messageId}>{error}</span>}
      {!error && hint && <span className="field-hint" id={messageId}>{hint}</span>}
    </div>
  )
}
