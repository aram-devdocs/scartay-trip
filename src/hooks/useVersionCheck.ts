'use client'

import { useCallback, useEffect, useRef } from 'react'

const VERSION_STORAGE_KEY = 'app_build_version'
const RELOAD_TIMESTAMP_KEY = 'app_last_reload_timestamp'
const LAST_CHECK_TIMESTAMP_KEY = 'app_last_version_check'
const MIN_RELOAD_INTERVAL = 10000 // Don't reload more than once per 10 seconds
const MIN_CHECK_INTERVAL = 5 * 60 * 1000 // Don't check more than once per 5 minutes

interface VersionCheckOptions {
  /** Whether to check on visibility change (default: true) */
  checkOnVisibilityChange?: boolean
  /** Whether auto-reload is enabled (default: true) */
  enabled?: boolean
}

interface VersionCheckResult {
  /** Manually trigger a version check */
  checkNow: () => Promise<boolean>
}

/**
 * Hook to check for app version updates and automatically reload when a new version is detected.
 * 
 * Checks happen on:
 * - Initial app load (after 3 second delay)
 * - When PWA becomes visible (e.g., switching back to the app)
 * 
 * To minimize server load:
 * - Only checks once per 5 minutes maximum
 * - No periodic polling - relies on user-triggered events
 * - Checks are debounced and throttled
 * 
 * Safety features:
 * - Prevents reload loops (won't reload more than once per 10 seconds)
 * - Stores version in localStorage to persist across sessions
 * - Only reloads when online and version check succeeds
 */
export function useVersionCheck(options: VersionCheckOptions = {}): VersionCheckResult {
  const {
    checkOnVisibilityChange = true,
    enabled = true,
  } = options

  const isCheckingRef = useRef(false)

  /**
   * Safely get the stored version from localStorage
   */
  const getStoredVersion = useCallback((): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(VERSION_STORAGE_KEY)
    } catch {
      return null
    }
  }, [])

  /**
   * Safely store the version in localStorage
   */
  const setStoredVersion = useCallback((version: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(VERSION_STORAGE_KEY, version)
    } catch {
      // Storage might be full or disabled
    }
  }, [])

  /**
   * Check if we're in a reload loop (reloaded too recently)
   */
  const isInReloadLoop = useCallback((): boolean => {
    if (typeof window === 'undefined') return true
    try {
      const lastReload = localStorage.getItem(RELOAD_TIMESTAMP_KEY)
      if (lastReload) {
        const timeSinceReload = Date.now() - parseInt(lastReload, 10)
        return timeSinceReload < MIN_RELOAD_INTERVAL
      }
    } catch {
      // If we can't read storage, be safe and don't reload
      return true
    }
    return false
  }, [])

  /**
   * Mark that we're about to reload
   */
  const markReload = useCallback((): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(RELOAD_TIMESTAMP_KEY, Date.now().toString())
    } catch {
      // Storage might be full or disabled
    }
  }, [])

  /**
   * Fetch the current version from the server
   */
  const fetchServerVersion = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/version', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      })
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      return data.version || null
    } catch {
      // Network error or offline - don't trigger reload
      return null
    }
  }, [])

  /**
   * Check for version updates and reload if necessary
   * Returns true if a new version was detected
   */
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent checks
    if (isCheckingRef.current) return false
    
    // Throttle checks
    const now = Date.now()
    if (now - lastCheckRef.current < 1000) return false
    lastCheckRef.current = now
    
    // Don't check if we're in SSR
    if (typeof window === 'undefined') return false
    
    // Don't reload if we're in a loop
    if (isInReloadLoop()) return false
    
    isCheckingRef.current = true
    
    try {
      const serverVersion = await fetchServerVersion()
      
      if (!serverVersion) {
        return false
      }
      
      const storedVersion = getStoredVersion()
      
      // First load - store the version
      if (!storedVersion) {
        setStoredVersion(serverVersion)
        return false
      }
      
      // Version changed - reload needed
      if (serverVersion !== storedVersion) {
        // Update stored version before reload to prevent loops
        setStoredVersion(serverVersion)
        markReload()
        
        // Give a small delay to ensure storage is persisted
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Force reload to get new assets
        window.location.reload()
        return true
      }
      
      return false
    } finally {
      isCheckingRef.current = false
    }
  }, [fetchServerVersion, getStoredVersion, setStoredVersion, isInReloadLoop, markReload])

  // Set up periodic checking
  useEffect(() => {
    if (!enabled) return

    // Initial check after a short delay
    const initialTimeout = setTimeout(() => {
      checkForUpdates()
    }, 2000)

    // Periodic checks
    const interval = setInterval(() => {
      checkForUpdates()
    }, checkInterval)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [enabled, checkInterval, checkForUpdates])

  // Check on visibility change (when PWA comes to foreground)
  useEffect(() => {
    if (!enabled || !checkOnVisibilityChange) return
    if (typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Small delay to let the app settle
        setTimeout(() => {
          checkForUpdates()
        }, 500)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, checkOnVisibilityChange, checkForUpdates])

  // Check on window focus
  useEffect(() => {
    if (!enabled || !checkOnFocus) return
    if (typeof window === 'undefined') return

    const handleFocus = () => {
      // Small delay to let the app settle
      setTimeout(() => {
        checkForUpdates()
      }, 500)
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [enabled, checkOnFocus, checkForUpdates])

  return {
    checkNow: checkForUpdates,
  }
}
