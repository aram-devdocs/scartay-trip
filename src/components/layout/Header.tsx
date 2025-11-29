'use client'

import OnlineUsers from './OnlineUsers'
import { OnlineUser } from '@/types'
import { CalendarIcon, MapPinIcon, HeartIcon } from '@/components/icons/Icons'

interface HeaderProps {
  onlineUsers: OnlineUser[]
  currentUsername: string
  isOffline?: boolean
}

export default function Header({ onlineUsers, currentUsername, isOffline = false }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 glass"
      style={{
        background: 'rgba(13, 13, 18, 0.9)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        // Add top padding when offline banner is shown
        marginTop: isOffline ? '44px' : 0,
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <HeartIcon size={16} className="text-white sm:hidden" />
                <HeartIcon size={20} className="text-white hidden sm:block" />
              </div>
              <div className="min-w-0">
                <h1
                  className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight truncate"
                  style={{
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  XOXO, Scarlett & Taylor
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                  <span
                    className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <CalendarIcon size={12} className="text-primary sm:hidden" />
                    <CalendarIcon size={14} className="text-primary hidden sm:block" />
                    <span className="hidden xs:inline">March 26-30, 2025</span>
                    <span className="xs:hidden">Mar 26-30</span>
                  </span>
                  <span style={{ color: 'var(--border)' }}>•</span>
                  <span
                    className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium"
                    style={{ color: 'var(--secondary)' }}
                  >
                    <MapPinIcon size={12} className="sm:hidden" />
                    <MapPinIcon size={14} className="hidden sm:block" />
                    NYC
                  </span>
                </div>
              </div>
            </div>
          </div>

          <OnlineUsers users={onlineUsers} currentUsername={currentUsername} />
        </div>
      </div>
    </header>
  )
}
