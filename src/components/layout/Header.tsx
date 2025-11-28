'use client'

import OnlineUsers from './OnlineUsers'
import { OnlineUser } from '@/types'
import { CalendarIcon, MapPinIcon } from '@/components/icons/Icons'

interface HeaderProps {
  onlineUsers: OnlineUser[]
  currentUsername: string
}

export default function Header({ onlineUsers, currentUsername }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 glass"
      style={{
        background: 'rgba(13, 13, 18, 0.9)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ background: 'var(--gradient-primary)' }}
              >
                💋
              </div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold tracking-tight"
                  style={{
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  XOXO, Scarlett & Taylor
                </h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span
                    className="flex items-center gap-1.5 text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <CalendarIcon size={14} className="text-primary" />
                    March 26-30, 2025
                  </span>
                  <span style={{ color: 'var(--border)' }}>•</span>
                  <span
                    className="flex items-center gap-1.5 text-sm font-medium"
                    style={{ color: 'var(--secondary)' }}
                  >
                    <MapPinIcon size={14} />
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
