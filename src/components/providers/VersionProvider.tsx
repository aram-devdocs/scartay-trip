'use client'

import { ReactNode } from 'react'
import { useVersionCheck } from '@/hooks/useVersionCheck'

interface VersionProviderProps {
  children: ReactNode
  /** Interval in ms to check for updates (default: 30 seconds) */
  checkInterval?: number
  /** Whether version checking is enabled (default: true) */
  enabled?: boolean
}

/**
 * Provider component that automatically checks for app version updates.
 * When a new version is detected, the page will automatically reload
 * to ensure users get the latest version.
 * 
 * This is particularly useful for PWAs where users might keep the app
 * open for extended periods without refreshing.
 * 
 * Safety features:
 * - Prevents reload loops (won't reload more than once per 10 seconds)
 * - Stores version in localStorage to persist across sessions
 * - Only reloads when online and version check succeeds
 * - Checks on visibility change (when PWA comes to foreground)
 * - Checks on window focus
 * - Periodic background checks
 */
export function VersionProvider({ 
  children, 
  checkInterval = 30000,
  enabled = true 
}: VersionProviderProps) {
  // The hook handles all the version checking logic
  useVersionCheck({
    checkInterval,
    enabled,
    checkOnVisibilityChange: true,
    checkOnFocus: true,
  })

  // This provider doesn't add any context, it just runs the version check
  // as a side effect. The children are rendered unchanged.
  return <>{children}</>
}
