'use client'

import { useSyncExternalStore } from 'react'

interface OnlineStatusState {
  isOnline: boolean
  isOffline: boolean
  lastOnlineAt: Date | null
}

function getSnapshot(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

function getServerSnapshot(): boolean {
  return true // Assume online during SSR
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

/**
 * Low-level hook for detecting browser online/offline status.
 * Uses useSyncExternalStore for proper React 18+ integration.
 */
export function useOnlineStatus(): OnlineStatusState {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return {
    isOnline,
    isOffline: !isOnline,
    // lastOnlineAt is not tracked to avoid complexity and unnecessary re-renders
    // If needed, components can track this themselves
    lastOnlineAt: null,
  }
}
