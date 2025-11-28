'use client'

import { OnlineUser } from '@/types'

interface OnlineUsersProps {
  users: OnlineUser[]
  currentUsername: string
}

const colors = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#009688', '#ff5722']

function getColorForUser(username: string): string {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(username: string): string {
  return username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function OnlineUsers({ users, currentUsername }: OnlineUsersProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
        Online:
      </span>
      <div className="flex -space-x-2 sm:-space-x-3">
        {users.map((user) => (
          <div
            key={user.sessionId}
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2"
            style={{
              backgroundColor: getColorForUser(user.username),
              borderColor: 'var(--background)',
            }}
            title={user.username + (user.username === currentUsername ? ' (you)' : '')}
          >
            {getInitials(user.username)}
          </div>
        ))}
      </div>
      {users.length === 0 && (
        <span className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>No one else online</span>
      )}
    </div>
  )
}
