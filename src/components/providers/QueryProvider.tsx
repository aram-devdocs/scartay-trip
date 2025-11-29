'use client'

import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { useState, useMemo } from 'react'

// Create a noop persister for SSR
const noopPersister = {
  persistClient: async () => {},
  restoreClient: async () => undefined,
  removeClient: async () => {},
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache configuration
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days - keep cached data for offline use
            staleTime: 0, // Always consider data stale so we fetch fresh when online
            
            // Network behavior
            refetchOnWindowFocus: true, // Refresh when user returns to tab
            refetchOnReconnect: true, // Refresh when coming back online
            refetchOnMount: true, // Always fetch fresh data on mount when online
            
            // Retry configuration - don't retry when offline
            retry: (failureCount) => {
              // Don't retry if we're offline
              if (typeof navigator !== 'undefined' && !navigator.onLine) {
                return false
              }
              // Otherwise retry up to 2 times
              return failureCount < 2
            },
            
            // Network mode: use cached data when offline, fetch when online
            networkMode: 'offlineFirst',
          },
          mutations: {
            // Mutations should only work when online
            networkMode: 'online',
            retry: false,
          },
        },
      })
  )

  // Create persister only on client side using useMemo
  const persister = useMemo(() => {
    if (typeof window === 'undefined') {
      return noopPersister
    }
    return createSyncStoragePersister({
      storage: window.localStorage,
      key: 'TRIP_QUERY_CACHE',
    })
  }, [])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist successful queries
            return query.state.status === 'success'
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
