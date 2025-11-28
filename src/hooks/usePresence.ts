'use client'

import { useState, useEffect, useCallback } from 'react'
import { OnlineUser } from '@/types'

const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const POLL_INTERVAL = 10000 // 10 seconds

export function usePresence(username: string | null, sessionId: string | null) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])

  const sendHeartbeat = useCallback(async () => {
    if (!username || !sessionId) return

    try {
      await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, sessionId }),
      })
    } catch (error) {
      console.error('Failed to send heartbeat:', error)
    }
  }, [username, sessionId])

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/presence')
      if (res.ok) {
        const data = await res.json()
        setOnlineUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch online users:', error)
    }
  }, [])

  useEffect(() => {
    // Delay initial calls to next tick to avoid synchronous setState in effect
    const initialHeartbeat = setTimeout(sendHeartbeat, 0)
    const initialPoll = setTimeout(fetchOnlineUsers, 0)

    // Set up heartbeat interval
    const heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

    // Set up polling interval
    const pollTimer = setInterval(fetchOnlineUsers, POLL_INTERVAL)

    return () => {
      clearTimeout(initialHeartbeat)
      clearTimeout(initialPoll)
      clearInterval(heartbeatTimer)
      clearInterval(pollTimer)
    }
  }, [sendHeartbeat, fetchOnlineUsers])

  return { onlineUsers }
}
