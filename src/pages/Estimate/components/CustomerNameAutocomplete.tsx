import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useGetCustomersQuery,
  formatCustomerAddress,
  type CustomerApiDoc,
} from '@/redux/api/customerApi'

export interface SelectedCustomer {
  name: string
  email: string
  address: string
}

interface CustomerNameAutocompleteProps {
  id?: string
  value: string
  onChange: (name: string) => void
  onSelect: (customer: SelectedCustomer) => void
  placeholder?: string
  className?: string
}

function toSelected(doc: CustomerApiDoc): SelectedCustomer {
  return {
    name: doc.name,
    email: doc.email,
    address: formatCustomerAddress(doc),
  }
}

export function CustomerNameAutocomplete({
  id,
  value,
  onChange,
  onSelect,
  placeholder,
  className,
}: CustomerNameAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const debouncedName = useDebounce(value, 300)

  const { data, isFetching } = useGetCustomersQuery(
    { search: debouncedName, limit: 10, page: 1 },
    { skip: debouncedName.trim().length < 1 }
  )

  const options = data?.data ?? []

  useEffect(() => {
    setHighlight(0)
  }, [options.length, value])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = (doc: CustomerApiDoc) => {
    const selected = toSelected(doc)
    onChange(selected.name)
    onSelect(selected)
    setOpen(false)
  }

  const showDropdown = open && debouncedName.trim().length > 0 && (options.length > 0 || isFetching)

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
          if (!open || options.length === 0) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlight((h) => (h + 1) % options.length)
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlight((h) => (h - 1 + options.length) % options.length)
          } else if (e.key === 'Enter' && options[highlight]) {
            e.preventDefault()
            pick(options[highlight])
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        placeholder={placeholder}
        className={cn('rounded-lg', className)}
        autoComplete="off"
      />
      {showDropdown && (
        <ul
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {isFetching && options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">...</li>
          ) : (
            options.map((doc, i) => (
              <li key={doc.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === highlight}
                  className={cn(
                    'w-full px-3 py-2 text-left hover:bg-emerald-50',
                    i === highlight && 'bg-emerald-50'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    pick(doc)
                  }}
                >
                  <span className="block text-sm font-medium text-slate-800">{doc.name}</span>
                  {doc.email && (
                    <span className="block text-xs text-slate-500 truncate">{doc.email}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
