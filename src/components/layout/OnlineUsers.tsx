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
      <span className="text-sm" style={{ color: 'var(--satc-gold)' }}>
        Online:
      </span>
      <div className="flex -space-x-2">
        {users.map((user) => (
          <div
            key={user.sessionId}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
            style={{ backgroundColor: getColorForUser(user.username) }}
            title={user.username + (user.username === currentUsername ? ' (you)' : '')}
          >
            {getInitials(user.username)}
          </div>
        ))}
      </div>
      {users.length === 0 && (
        <span className="text-sm text-gray-400">No one else online</span>
      )}
    </div>
  )
}
