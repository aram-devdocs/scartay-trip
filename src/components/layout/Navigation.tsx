'use client'

import { PlaneIcon, BuildingIcon, StarIcon, DollarSignIcon } from '@/components/icons/Icons'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'flights', label: 'Flights', icon: PlaneIcon },
  { id: 'hotels', label: 'Hotels', icon: BuildingIcon },
  { id: 'activities', label: 'Activities', icon: StarIcon },
  { id: 'food', label: 'Food & Drinks', icon: DollarSignIcon },
]

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav
      className="overflow-x-auto py-3"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm
                  transition-all duration-200 whitespace-nowrap
                  ${isActive ? 'scale-[1.02]' : 'hover:scale-[1.02]'}
                `}
                style={{
                  background: isActive ? 'var(--gradient-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
