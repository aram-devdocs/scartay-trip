'use client'

import { useRef, useCallback, useState, useEffect, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { CheckIcon } from '@/components/icons/Icons'

export interface FilterValues {
  neighborhood: string
  cuisineTypes: string[]
  priceRange: [number, number]
}

interface FilterBarProps {
  neighborhoods: string[]
  cuisineOptions?: string[]
  priceRange: { min: number; max: number }
  values: FilterValues
  onChange: (values: FilterValues) => void
  showCuisine?: boolean
}

// Filter icon component
function FilterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

// Hook to check if we're on the client
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

// Calculate dropdown position based on button rect
function calculateDropdownPosition(buttonRect: DOMRect): { top: number; left: number } {
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  const dropdownWidth = 320
  const maxDropdownHeight = Math.min(viewportHeight - 40, 500)

  let left = buttonRect.left
  if (left + dropdownWidth > viewportWidth - 16) {
    left = viewportWidth - dropdownWidth - 16
  }
  if (left < 16) left = 16

  let top = buttonRect.bottom + 8

  if (top + maxDropdownHeight > viewportHeight - 16) {
    if (buttonRect.top - maxDropdownHeight - 8 > 16) {
      top = buttonRect.top - maxDropdownHeight - 8
    } else {
      top = Math.max(16, (viewportHeight - maxDropdownHeight) / 2)
    }
  }

  return { top, left }
}

export default function FilterBar({
  neighborhoods,
  cuisineOptions = [],
  priceRange,
  values,
  onChange,
  showCuisine = false,
}: FilterBarProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isClient = useIsClient()

  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  const hasActiveFilters =
    values.neighborhood !== '' ||
    values.cuisineTypes.length > 0 ||
    values.priceRange[0] > priceRange.min ||
    values.priceRange[1] < priceRange.max

  const activeFilterCount =
    (values.neighborhood ? 1 : 0) +
    values.cuisineTypes.length +
    (values.priceRange[0] > priceRange.min || values.priceRange[1] < priceRange.max ? 1 : 0)

  const clearFilters = () => {
    onChange({
      neighborhood: '',
      cuisineTypes: [],
      priceRange: [priceRange.min, priceRange.max],
    })
  }

  const handleCuisineToggle = (cuisine: string) => {
    const newCuisines = values.cuisineTypes.includes(cuisine)
      ? values.cuisineTypes.filter((c) => c !== cuisine)
      : [...values.cuisineTypes, cuisine]
    onChange({ ...values, cuisineTypes: newCuisines })
  }

  // Toggle open and calculate position
  const handleToggle = useCallback(() => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition(calculateDropdownPosition(rect))
    }
    setIsOpen((prev) => !prev)
  }, [isOpen])

  // Handle click outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Node
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(target) &&
      buttonRef.current &&
      !buttonRef.current.contains(target)
    ) {
      setIsOpen(false)
    }
  }, [])

  // Add/remove event listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="rounded-xl flex flex-col"
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: 'min(320px, calc(100vw - 32px))',
        maxHeight: 'min(500px, calc(100vh - 40px))',
        background: '#1a1a2e',
        border: '1px solid var(--border)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          Filters
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs px-2 py-1 rounded-full transition-all hover:scale-105"
            style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
          >
            Clear all
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Neighborhood Filter */}
        {neighborhoods.length > 0 && (
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
              Neighborhood
            </label>
            <div
              className="rounded-lg p-2 space-y-1 max-h-32 overflow-y-auto"
              style={{ background: '#0f0f1a', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => onChange({ ...values, neighborhood: '' })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left"
                style={{
                  background: !values.neighborhood ? 'var(--gradient-primary)' : 'transparent',
                  color: !values.neighborhood ? 'white' : 'var(--text-secondary)',
                }}
              >
                <span>All</span>
                {!values.neighborhood && <CheckIcon size={14} />}
              </button>
              {neighborhoods.map((n) => (
                <button
                  key={n}
                  onClick={() => onChange({ ...values, neighborhood: n })}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left"
                  style={{
                    background: values.neighborhood === n ? 'var(--gradient-primary)' : 'transparent',
                    color: values.neighborhood === n ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  <span className="truncate">{n}</span>
                  {values.neighborhood === n && <CheckIcon size={14} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cuisine Filter (only for restaurants) */}
        {showCuisine && cuisineOptions.length > 0 && (
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
              Cuisine Type {values.cuisineTypes.length > 0 && `(${values.cuisineTypes.length} selected)`}
            </label>
            <div
              className="max-h-40 overflow-y-auto rounded-lg p-2 space-y-1"
              style={{ background: '#0f0f1a', border: '1px solid var(--border)' }}
            >
              {cuisineOptions.map((cuisine) => {
                const isSelected = values.cuisineTypes.includes(cuisine)
                return (
                  <button
                    key={cuisine}
                    onClick={() => handleCuisineToggle(cuisine)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left"
                    style={{
                      background: isSelected ? 'var(--gradient-primary)' : 'transparent',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    <span>{cuisine}</span>
                    {isSelected && <CheckIcon size={14} />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Price Range Slider */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
            Price Range: {formatPriceLabel(values.priceRange[0])} - {formatPriceLabel(values.priceRange[1])}
          </label>
          <div className="px-2">
            <div className="flex items-center gap-3">
              <span className="text-xs w-8" style={{ color: 'var(--text-muted)' }}>
                {formatPriceLabel(priceRange.min)}
              </span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={values.priceRange[0]}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value)
                    if (newMin <= values.priceRange[1]) {
                      onChange({ ...values, priceRange: [newMin, values.priceRange[1]] })
                    }
                  }}
                  className="w-full accent-pink-500"
                />
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={values.priceRange[1]}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value)
                    if (newMax >= values.priceRange[0]) {
                      onChange({ ...values, priceRange: [values.priceRange[0], newMax] })
                    }
                  }}
                  className="w-full accent-pink-500 -mt-1"
                />
              </div>
              <span className="text-xs w-8 text-right" style={{ color: 'var(--text-muted)' }}>
                {formatPriceLabel(priceRange.max)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', background: '#1a1a2e' }}>
        <button
          onClick={() => setIsOpen(false)}
          className="w-full py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: 'var(--gradient-primary)' }}
        >
          Apply Filters
        </button>
      </div>
    </div>
  )

  return (
    <div className="mb-4">
      {/* Filter Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
        style={{
          background: hasActiveFilters ? 'var(--gradient-primary)' : 'var(--border-light)',
          color: hasActiveFilters ? 'white' : 'var(--text-secondary)',
        }}
      >
        <FilterIcon size={16} />
        Filters
        {activeFilterCount > 0 && (
          <span
            className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{
              background: hasActiveFilters ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
              color: 'white',
            }}
          >
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu - rendered via portal */}
      {isClient && isOpen && createPortal(dropdownContent, document.body)}
    </div>
  )
}

function formatPriceLabel(value: number): string {
  if (value === 0) return 'Free'
  if (value <= 4) return '$'.repeat(value)
  return `$${value}`
}
