'use client'

import { PlaneIcon, BuildingIcon, StarIcon, DollarSignIcon } from '@/components/icons/Icons'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'flights', label: 'Flights', shortLabel: 'Flights', icon: PlaneIcon },
  { id: 'hotels', label: 'Hotels', shortLabel: 'Hotels', icon: BuildingIcon },
  { id: 'activities', label: 'Activities', shortLabel: 'Activities', icon: StarIcon },
  { id: 'food', label: 'Food & Drinks', shortLabel: 'Food', icon: DollarSignIcon },
]

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav
      className="overflow-x-auto py-2 sm:py-3"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center justify-center gap-1 sm:gap-2
                  px-3 py-2 sm:px-5 sm:py-2.5
                  rounded-full font-semibold text-xs sm:text-sm
                  transition-all duration-200 whitespace-nowrap
                  min-h-[44px] min-w-[44px]
                  ${isActive ? 'scale-[1.02]' : 'hover:scale-[1.02]'}
                `}
                style={{
                  background: isActive ? 'var(--gradient-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                }}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
