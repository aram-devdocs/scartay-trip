'use client'

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

interface OfflineContextValue {
  isOnline: boolean
  isOffline: boolean
}

const OfflineContext = createContext<OfflineContextValue>({
  isOnline: true,
  isOffline: false,
})

interface OfflineProviderProps {
  children: ReactNode
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const { isOnline, isOffline } = useOnlineStatus()
  const queryClient = useQueryClient()
  
  // Track previous online state to detect transitions
  const wasOnlineRef = useRef(isOnline)
  const hasShownOfflineToastRef = useRef(false)

  // Handle online/offline transitions
  useEffect(() => {
    const wasOnline = wasOnlineRef.current
    wasOnlineRef.current = isOnline

    if (isOnline && !wasOnline) {
      // Coming back online
      const timeout = setTimeout(() => {
        queryClient.invalidateQueries()
        toast.success('Back online! Syncing latest data...')
      }, 500)
      hasShownOfflineToastRef.current = false
      return () => clearTimeout(timeout)
    } else if (isOffline && wasOnline && !hasShownOfflineToastRef.current) {
      // Going offline
      toast.warning('You\'re offline. Viewing cached data.', {
        duration: 5000,
      })
      hasShownOfflineToastRef.current = true
    }
  }, [isOnline, isOffline, queryClient])

  return (
    <OfflineContext.Provider value={{ isOnline, isOffline }}>
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline(): OfflineContextValue {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider')
  }
  return context
}
