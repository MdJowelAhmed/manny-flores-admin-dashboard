import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, Search, Loader2, X, Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Option {
    value: string
    label: string
}

interface InfiniteScrollSelectProps {
    label?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    /** Accumulated options list — parent appends pages here */
    options: Option[]
    loading: boolean
    hasMore: boolean
    /** Called when the user types — parent should reset its accumulated list */
    onSearch: (search: string) => void
    /** Called when the user scrolls to the bottom */
    onLoadMore: () => void
    className?: string
}

export function InfiniteScrollSelect({
    label,
    value,
    onChange,
    placeholder = 'Select an option',
    options,
    loading,
    hasMore,
    onSearch,
    onLoadMore,
    className,
}: InfiniteScrollSelectProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    // ── Store the label at selection time so the trigger always shows the
    //    correct name even after options list is cleared/reset. ──────────────
    const [selectedLabel, setSelectedLabel] = useState<string>('')

    const containerRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // If the parent clears `value` externally (e.g. form reset), clear our label too
    useEffect(() => {
        if (!value) setSelectedLabel('')
    }, [value])

    // Focus search on open; clear search on close
    useEffect(() => {
        if (open) {
            setTimeout(() => searchRef.current?.focus(), 50)
        } else {
            setSearch('')
            onSearch('')
        }
    }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

    // Debounced search → notify parent
    const handleSearchChange = (val: string) => {
        setSearch(val)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => onSearch(val), 300)
    }

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Scroll → load more
    const handleScroll = useCallback(() => {
        const el = listRef.current
        if (!el || loading || !hasMore) return
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
            onLoadMore()
        }
    }, [loading, hasMore, onLoadMore])

    const handleSelect = (opt: Option) => {
        setSelectedLabel(opt.label)   // ← capture label before options list changes
        onChange(opt.value)
        setOpen(false)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedLabel('')
        onChange('')
    }

    // What to show in the trigger
    const triggerLabel = value ? selectedLabel || options.find((o) => o.value === value)?.label || value : ''

    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}

            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    'w-full flex items-center justify-between gap-2',
                    'rounded-md border border-input bg-white px-3 py-2 text-sm',
                    'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    'transition-colors duration-150',
                    open && 'border-primary ring-2 ring-primary/30'
                )}
            >
                <span className={cn('truncate text-left', !value && 'text-muted-foreground')}>
                    {value ? triggerLabel : placeholder}
                </span>
                <span className="flex items-center gap-1 shrink-0 text-muted-foreground">
                    {value && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
                            className="hover:text-foreground rounded p-0.5 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </span>
                    )}
                    <ChevronDown
                        className={cn('w-4 h-4 transition-transform duration-200', open && 'rotate-180')}
                    />
                </span>
            </button>

            {/* Dropdown panel — stop wheel propagation so modal scroll handler doesn't hijack it */}
            {open && (
                <div
                    className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden"
                    onWheel={(e) => e.stopPropagation()}
                >
                    {/* Search bar */}
                    <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 bg-white">
                        <Search className="w-4 h-4 text-gray-400 shrink-0" />
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search employee..."
                            className="w-full text-sm outline-none placeholder:text-gray-400 bg-transparent"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => handleSearchChange('')}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Options list */}
                    <div
                        ref={listRef}
                        onScroll={handleScroll}
                        onWheel={(e) => {
                            e.stopPropagation()
                        }}
                        className="max-h-52 overflow-y-auto"
                    >
                        {options.length === 0 && !loading ? (
                            <div className="py-8 text-center text-sm text-gray-400">
                                No employees found
                            </div>
                        ) : (
                            <>
                                {options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt)}
                                        className={cn(
                                            'w-full flex items-center justify-between text-left px-3 py-2 text-sm',
                                            'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors',
                                            opt.value === value && 'bg-primary/5 text-primary font-medium'
                                        )}
                                    >
                                        {opt.label}
                                        {opt.value === value && <Check className="w-4 h-4 shrink-0" />}
                                    </button>
                                ))}

                                {loading && (
                                    <div className="flex items-center justify-center gap-2 py-3 text-xs text-gray-400">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        {options.length === 0 ? 'Loading...' : 'Loading more...'}
                                    </div>
                                )}

                                {!hasMore && options.length > 0 && !loading && (
                                    <div className="py-2 text-center text-xs text-gray-300 border-t border-gray-50">
                                        All employees loaded
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}