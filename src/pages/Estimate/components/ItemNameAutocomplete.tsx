import { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'

interface ItemNameAutocompleteProps {
  id?: string
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  className?: string
}

export function ItemNameAutocomplete({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  className,
}: ItemNameAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return suggestions.slice(0, 8)
    return suggestions
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 8)
  }, [suggestions, value])

  useEffect(() => {
    setHighlight(0)
  }, [filtered.length, value])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = (item: string) => {
    onChange(item)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || filtered.length === 0) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlight((h) => (h + 1) % filtered.length)
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlight((h) => (h - 1 + filtered.length) % filtered.length)
          } else if (e.key === 'Enter' && filtered[highlight]) {
            e.preventDefault()
            pick(filtered[highlight])
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        placeholder={placeholder}
        className={cn('rounded-lg', className)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {filtered.map((item, i) => (
            <li key={item}>
              <button
                type="button"
                role="option"
                aria-selected={i === highlight}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm hover:bg-emerald-50',
                  i === highlight && 'bg-emerald-50 text-emerald-900'
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(item)
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
