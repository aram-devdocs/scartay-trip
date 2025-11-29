'use client'

import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'

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
   * Safely get a value from localStorage
   */
  const getStorageItem = useCallback((key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }, [])

  /**
   * Safely set a value in localStorage
   */
  const setStorageItem = useCallback((key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch {
      // Storage might be full or disabled
    }
  }, [])

  /**
   * Check if we're in a reload loop (reloaded too recently)
   */
  const isInReloadLoop = useCallback((): boolean => {
    const lastReload = getStorageItem(RELOAD_TIMESTAMP_KEY)
    if (lastReload) {
      const timeSinceReload = Date.now() - parseInt(lastReload, 10)
      return timeSinceReload < MIN_RELOAD_INTERVAL
    }
    return false
  }, [getStorageItem])

  /**
   * Check if we've checked recently (throttle API calls)
   */
  const hasCheckedRecently = useCallback((): boolean => {
    const lastCheck = getStorageItem(LAST_CHECK_TIMESTAMP_KEY)
    if (lastCheck) {
      const timeSinceCheck = Date.now() - parseInt(lastCheck, 10)
      return timeSinceCheck < MIN_CHECK_INTERVAL
    }
    return false
  }, [getStorageItem])

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
  const checkForUpdates = useCallback(async (force = false): Promise<boolean> => {
    // Prevent concurrent checks
    if (isCheckingRef.current) return false
    
    // Don't check if we're in SSR
    if (typeof window === 'undefined') return false
    
    // Don't check if we checked recently (unless forced)
    if (!force && hasCheckedRecently()) return false
    
    // Don't reload if we're in a loop
    if (isInReloadLoop()) return false
    
    isCheckingRef.current = true
    
    try {
      // Mark that we're checking now
      setStorageItem(LAST_CHECK_TIMESTAMP_KEY, Date.now().toString())
      
      const serverVersion = await fetchServerVersion()
      
      if (!serverVersion) {
        return false
      }
      
      const storedVersion = getStorageItem(VERSION_STORAGE_KEY)
      
      // First load - store the version without reloading
      if (!storedVersion) {
        setStorageItem(VERSION_STORAGE_KEY, serverVersion)
        return false
      }
      
      // Version changed - reload needed
      if (serverVersion !== storedVersion) {
        // Update stored version before reload to prevent loops
        setStorageItem(VERSION_STORAGE_KEY, serverVersion)
        setStorageItem(RELOAD_TIMESTAMP_KEY, Date.now().toString())
        
        // Show toast to inform user
        toast.info('New version available! Refreshing...', {
          duration: 2000,
        })
        
        // Give time for toast to show and storage to persist
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Force reload to get new assets
        window.location.reload()
        return true
      }
      
      return false
    } finally {
      isCheckingRef.current = false
    }
  }, [fetchServerVersion, getStorageItem, setStorageItem, isInReloadLoop, hasCheckedRecently])

  // Initial check on mount (with delay)
  useEffect(() => {
    if (!enabled) return

    // Initial check after app settles
    const initialTimeout = setTimeout(() => {
      checkForUpdates()
    }, 3000)

    return () => {
      clearTimeout(initialTimeout)
    }
  }, [enabled, checkForUpdates])

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

  return {
    checkNow: () => checkForUpdates(true), // Force check when called manually
  }
}
