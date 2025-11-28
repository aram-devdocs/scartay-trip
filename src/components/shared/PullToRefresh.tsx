'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

const THRESHOLD = 80 // Pixels to pull before triggering refresh
const MAX_PULL = 120 // Maximum pull distance

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only start pull if at top of page
    if (window.scrollY === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || isRefreshing) return

    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current

    // Only handle downward pull when at top
    if (diff > 0 && window.scrollY === 0) {
      // Use easing for a natural feel (diminishing returns as you pull further)
      const easedDistance = Math.min(diff * 0.5, MAX_PULL)
      setPullDistance(easedDistance)
      
      // Prevent default scrolling when pulling
      if (diff > 10) {
        e.preventDefault()
      }
    }
  }, [isPulling, isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(60) // Keep showing indicator while refreshing
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
    
    setIsPulling(false)
    startY.current = 0
    currentY.current = 0
  }, [isPulling, pullDistance, isRefreshing, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Use passive: false for touchmove to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const progress = Math.min(pullDistance / THRESHOLD, 1)
  const showIndicator = pullDistance > 0 || isRefreshing

  return (
    <div ref={containerRef} className="pull-to-refresh-container">
      {/* Pull indicator */}
      <div 
        className="pull-indicator"
        style={{
          transform: `translateY(${pullDistance - 60}px)`,
          opacity: showIndicator ? 1 : 0,
        }}
      >
        <div 
          className={`pull-spinner ${isRefreshing ? 'spinning' : ''}`}
          style={{
            transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
          }}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isRefreshing ? (
              // Loading spinner
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            ) : (
              // Arrow down
              <>
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </>
            )}
          </svg>
        </div>
        <span className="pull-text">
          {isRefreshing ? 'Refreshing...' : progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>

      {/* Main content with pull transform */}
      <div
        className="pull-content"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}
