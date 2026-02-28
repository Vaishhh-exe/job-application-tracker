"use client"

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

// ─── Save Indicator ───────────────────────────────────────────────
export function SaveIndicator({ status, error }: { status: SaveStatus; error?: string }) {
  if (status === "saving") {
    return <Loader2 className="h-3 w-3 shrink-0 animate-spin text-blue-500" />
  }
  if (status === "saved") {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium">
        <Check className="h-3 w-3" />
        Saved
      </span>
    )
  }
  if (status === "error") {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[10px] text-red-500" title={error}>
        <AlertCircle className="h-3 w-3" />
      </span>
    )
  }
  return null
}

// ─── Field Row Wrapper ────────────────────────────────────────────
export function FieldRow({
  label,
  children,
  status = "idle",
  error,
}: {
  label: string
  children: React.ReactNode
  status?: SaveStatus
  error?: string
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="w-24 shrink-0 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
      <div className="w-12 pt-1.5 flex justify-end">
        <SaveIndicator status={status} error={error} />
      </div>
    </div>
  )
}

// ─── InlineTextField ──────────────────────────────────────────────
interface InlineTextFieldProps {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  type?: "text" | "url"
}

export function InlineTextField({
  value,
  onSave,
  placeholder = "Click to edit",
  type = "text",
}: InlineTextFieldProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const startEditing = () => {
    setEditValue(value)
    setEditing(true)
  }

  const handleSave = () => {
    setEditing(false)
    const trimmed = editValue.trim()
    if (trimmed !== value) {
      onSave(trimmed)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSave()
    }
    if (e.key === "Escape") {
      setEditValue(value)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        placeholder={placeholder}
      />
    )
  }

  return (
    <div
      onClick={startEditing}
      className="cursor-pointer rounded-md px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:text-white min-h-7.5 flex items-center transition-colors overflow-hidden"
    >
      {value ? (
        <span className="truncate block w-full">{value}</span>
      ) : (
        <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
      )}
    </div>
  )
}

// ─── InlineNumberField ────────────────────────────────────────────
interface InlineNumberFieldProps {
  value: number | null | undefined
  onSave: (value: number | null) => void
  placeholder?: string
  prefix?: string
}

export function InlineNumberField({
  value,
  onSave,
  placeholder = "Click to edit",
  prefix,
}: InlineNumberFieldProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const startEditing = () => {
    setEditValue(value != null ? String(value) : "")
    setEditing(true)
  }

  const handleSave = () => {
    setEditing(false)
    const trimmed = editValue.trim()
    const numValue = trimmed ? parseInt(trimmed, 10) : null
    if (numValue !== value && !(numValue === null && value === null)) {
      onSave(isNaN(numValue as number) ? null : numValue)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSave()
    }
    if (e.key === "Escape") {
      setEditValue(value != null ? String(value) : "")
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        placeholder={placeholder}
      />
    )
  }

  const displayValue = value != null ? `${prefix || ""}${value.toLocaleString()}` : null

  return (
    <div
      onClick={startEditing}
      className="cursor-pointer rounded-md px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:text-white min-h-7.5 flex items-center transition-colors"
    >
      {displayValue || <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>}
    </div>
  )
}

// ─── InlineSelectField ────────────────────────────────────────────
interface InlineSelectFieldProps<T extends string> {
  value: T
  options: { value: T; label: string }[]
  onSave: (value: T) => void
  renderValue?: (value: T) => React.ReactNode
}

export function InlineSelectField<T extends string>({
  value,
  options,
  onSave,
  renderValue,
}: InlineSelectFieldProps<T>) {
  const [editing, setEditing] = useState(false)
  const selectRef = useRef<HTMLSelectElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editing && selectRef.current) {
      selectRef.current.focus()
    }
  }, [editing])

  useEffect(() => {
    if (!editing) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setEditing(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [editing])

  const handleChange = (newValue: string) => {
    setEditing(false)
    if (newValue !== value) {
      onSave(newValue as T)
    }
  }

  if (editing) {
    return (
      <div ref={wrapperRef}>
        <select
          ref={selectRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setEditing(false)}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="cursor-pointer rounded-md px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 min-h-7.5 flex items-center transition-colors"
    >
      {renderValue ? (
        renderValue(value)
      ) : (
        <span className="dark:text-white">
          {options.find((o) => o.value === value)?.label || value}
        </span>
      )}
    </div>
  )
}

// ─── InlineTextareaField ──────────────────────────────────────────
interface InlineTextareaFieldProps {
  value: string
  onSave: (value: string) => void
  placeholder?: string
}

export function InlineTextareaField({
  value,
  onSave,
  placeholder = "Click to add notes...",
}: InlineTextareaFieldProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoResize = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.max(100, textareaRef.current.scrollHeight)}px`
    }
  }, [])

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
      autoResize()
    }
  }, [editing, autoResize])

  const startEditing = () => {
    setEditValue(value)
    setEditing(true)
  }

  const handleSave = () => {
    setEditing(false)
    if (editValue !== value) {
      onSave(editValue)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setEditValue(value)
      setEditing(false)
    }
    // Don't save on Enter — allow multiline. Save on blur only.
  }

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={editValue}
        onChange={(e) => {
          setEditValue(e.target.value)
          autoResize()
        }}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full min-h-25 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
        placeholder={placeholder}
      />
    )
  }

  return (
    <div
      onClick={startEditing}
      className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:text-white min-h-20 whitespace-pre-wrap transition-colors"
    >
      {value || <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>}
    </div>
  )
}

// ─── InlineTagsField ──────────────────────────────────────────────
interface InlineTagsFieldProps {
  value: string[]
  onSave: (value: string[]) => void
  placeholder?: string
}

export function InlineTagsField({
  value,
  onSave,
  placeholder = "Add tags (comma separated)",
}: InlineTagsFieldProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const startEditing = () => {
    setEditValue(value.join(", "))
    setEditing(true)
  }

  const handleSave = () => {
    setEditing(false)
    const newTags = editValue
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    if (JSON.stringify(newTags) !== JSON.stringify(value)) {
      onSave(newTags)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSave()
    }
    if (e.key === "Escape") {
      setEditValue(value.join(", "))
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        placeholder={placeholder}
      />
    )
  }

  return (
    <div
      onClick={startEditing}
      className="cursor-pointer rounded-md px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 min-h-7.5 flex items-center flex-wrap gap-1.5 transition-colors"
    >
      {value.length > 0 ? (
        value.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300"
          >
            {tag}
          </span>
        ))
      ) : (
        <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
      )}
    </div>
  )
}
