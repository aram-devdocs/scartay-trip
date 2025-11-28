'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60000, // Data fresh for 60 seconds
            gcTime: 5 * 60 * 1000, // Cache for 5 minutes
            refetchOnWindowFocus: true, // Refresh when user returns to tab
            refetchInterval: false, // NO background polling
            retry: 2,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
