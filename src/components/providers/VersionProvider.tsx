'use client'

import { ReactNode } from 'react'
import { useVersionCheck } from '@/hooks/useVersionCheck'

interface VersionProviderProps {
  children: ReactNode
  /** Whether version checking is enabled (default: true) */
  enabled?: boolean
}

/**
 * Provider component that automatically checks for app version updates.
 * When a new version is detected, a toast notification is shown and 
 * the page automatically reloads to get the latest version.
 * 
 * This is particularly useful for PWAs where users might keep the app
 * open for extended periods without refreshing.
 * 
 * Checks happen on:
 * - Initial app load (after 3 second delay)
 * - When PWA becomes visible (e.g., switching back to the app)
 * 
 * To minimize server load:
 * - Only checks once per 5 minutes maximum
 * - No periodic polling
 * 
 * Safety features:
 * - Prevents reload loops (won't reload more than once per 10 seconds)
 * - Shows toast notification before reloading
 */
export function VersionProvider({ 
  children, 
  enabled = true 
}: VersionProviderProps) {
  useVersionCheck({
    enabled,
    checkOnVisibilityChange: true,
  })

  return <>{children}</>
}
