'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TrashIcon, LoaderIcon, ChevronLeftIcon } from '@/components/icons/Icons'

interface SwipeableRowProps {
  children: React.ReactNode
  onDelete: () => void
  isDeleting?: boolean
  disabled?: boolean
  className?: string
}

const SWIPE_THRESHOLD = 80 // Pixels to swipe before delete action is available
const REVEAL_WIDTH = 72 // Width of the delete button area

export default function SwipeableRow({
  children,
  onDelete,
  isDeleting = false,
  disabled = false,
  className = '',
}: SwipeableRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [translateX, setTranslateX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const currentX = useRef(0)
  const isHorizontalSwipe = useRef<boolean | null>(null)

  // Detect touch device
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkTouch()
    window.addEventListener('resize', checkTouch)
    return () => window.removeEventListener('resize', checkTouch)
  }, [])

  // Handle clicks outside to close revealed state
  useEffect(() => {
    if (!isRevealed) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setIsRevealed(false)
        setTranslateX(0)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isRevealed])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isDeleting) return
    
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    currentX.current = e.touches[0].clientX
    isHorizontalSwipe.current = null
    setIsSwiping(true)
  }, [disabled, isDeleting])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping || disabled || isDeleting) return

    const touchX = e.touches[0].clientX
    const touchY = e.touches[0].clientY
    currentX.current = touchX

    const diffX = touchX - startX.current
    const diffY = touchY - startY.current

    // Determine swipe direction on first significant movement
    if (isHorizontalSwipe.current === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY)
    }

    // Only handle horizontal swipes
    if (isHorizontalSwipe.current === false) {
      setIsSwiping(false)
      return
    }

    if (isHorizontalSwipe.current === true) {
      // Prevent vertical scrolling when swiping horizontally
      e.preventDefault?.()
    }

    // Calculate new position
    const baseOffset = isRevealed ? -REVEAL_WIDTH : 0
    let newTranslateX = baseOffset + diffX

    // Apply resistance at edges
    if (newTranslateX > 0) {
      // Swiping right past origin - strong resistance
      newTranslateX = newTranslateX * 0.2
    } else if (newTranslateX < -REVEAL_WIDTH * 1.5) {
      // Swiping past reveal width - resistance
      const overflow = Math.abs(newTranslateX) - REVEAL_WIDTH * 1.5
      newTranslateX = -REVEAL_WIDTH * 1.5 - overflow * 0.3
    }

    setTranslateX(newTranslateX)
  }, [isSwiping, disabled, isDeleting, isRevealed])

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return

    const diffX = currentX.current - startX.current
    const velocity = Math.abs(diffX)
    
    // Determine final state based on position and velocity
    const currentPos = translateX
    const shouldReveal = currentPos < -SWIPE_THRESHOLD || (currentPos < -40 && velocity > 50)
    const shouldClose = currentPos > -40 || (isRevealed && diffX > 30)

    if (shouldClose) {
      setIsRevealed(false)
      setTranslateX(0)
    } else if (shouldReveal) {
      setIsRevealed(true)
      setTranslateX(-REVEAL_WIDTH)
    } else {
      // Snap to current state
      setTranslateX(isRevealed ? -REVEAL_WIDTH : 0)
    }

    setIsSwiping(false)
    isHorizontalSwipe.current = null
  }, [isSwiping, translateX, isRevealed])

  const handleDelete = () => {
    if (!disabled && !isDeleting) {
      onDelete()
    }
  }

  // Handle keyboard delete
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!disabled && !isDeleting) {
        e.preventDefault()
        if (confirm('Delete this comment?')) {
          onDelete()
        }
      }
    } else if (e.key === 'Escape' && isRevealed) {
      setIsRevealed(false)
      setTranslateX(0)
    }
  }

  return (
    <div
      ref={rowRef}
      className={`swipeable-row ${className}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="listitem"
    >
      {/* Delete action background */}
      <div 
        className="swipeable-action-container"
        style={{
          opacity: Math.min(Math.abs(translateX) / 40, 1),
        }}
      >
        <button
          onClick={handleDelete}
          disabled={isDeleting || disabled}
          className="swipeable-delete-btn"
          aria-label="Delete"
          tabIndex={isRevealed ? 0 : -1}
        >
          {isDeleting ? (
            <LoaderIcon size={20} />
          ) : (
            <>
              <TrashIcon size={20} />
              <span className="swipeable-delete-text">Delete</span>
            </>
          )}
        </button>
      </div>

      {/* Swipeable content */}
      <div
        className="swipeable-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {children}
        
        {/* Swipe indicator for mobile */}
        {isTouchDevice && !disabled && (
          <div 
            className="swipe-indicator"
            style={{
              opacity: isRevealed ? 0 : 0.5,
            }}
          >
            <ChevronLeftIcon size={14} />
          </div>
        )}
      </div>
    </div>
  )
}
