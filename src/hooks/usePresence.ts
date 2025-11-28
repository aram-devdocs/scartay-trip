'use client'

import { useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { OnlineUser } from '@/types'

const HEARTBEAT_INTERVAL = 60000 // 60 seconds (increased from 30)

export const presenceKeys = {
  onlineUsers: ['presence', 'online'] as const,
}

async function fetchOnlineUsers(): Promise<OnlineUser[]> {
  const res = await fetch('/api/presence')
  if (!res.ok) throw new Error('Failed to fetch online users')
  return res.json()
}

export function usePresence(username: string | null, sessionId: string | null) {
  const queryClient = useQueryClient()

  // Use React Query for online users - fetches once on mount and on window focus
  const { data: onlineUsers = [] } = useQuery({
    queryKey: presenceKeys.onlineUsers,
    queryFn: fetchOnlineUsers,
    // No refetchInterval - on-demand only
  })

  const sendHeartbeat = useCallback(async () => {
    if (!username || !sessionId) return

    try {
      await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, sessionId }),
      })
      // Invalidate online users query after heartbeat to get fresh data
      queryClient.invalidateQueries({ queryKey: presenceKeys.onlineUsers })
    } catch (error) {
      console.error('Failed to send heartbeat:', error)
    }
  }, [username, sessionId, queryClient])

  useEffect(() => {
    if (!username || !sessionId) return

    // Send initial heartbeat
    sendHeartbeat()

    // Set up heartbeat interval (60 seconds)
    const heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

    return () => {
      clearInterval(heartbeatTimer)
    }
  }, [username, sessionId, sendHeartbeat])

  return { onlineUsers }
}
