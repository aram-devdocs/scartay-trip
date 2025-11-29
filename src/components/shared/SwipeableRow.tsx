'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TrashIcon, LoaderIcon, ChevronLeftIcon, PencilIcon } from '@/components/icons/Icons'

interface SwipeAction {
  type: 'edit' | 'delete'
  onAction: () => void
  isLoading?: boolean
  disabled?: boolean
}

interface SwipeableRowProps {
  children: React.ReactNode
  actions: SwipeAction[]
  className?: string
  contentClassName?: string
}

const SWIPE_THRESHOLD = 60 // Pixels to swipe before action is available
const ACTION_WIDTH = 60 // Width of each action button

export default function SwipeableRow({
  children,
  actions,
  className = '',
  contentClassName = '',
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

  const totalActionsWidth = actions.length * ACTION_WIDTH
  const isAnyLoading = actions.some(a => a.isLoading)
  const isAnyDisabled = actions.some(a => a.disabled) || isAnyLoading

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
    if (isAnyDisabled) return
    
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    currentX.current = e.touches[0].clientX
    isHorizontalSwipe.current = null
    setIsSwiping(true)
  }, [isAnyDisabled])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping || isAnyDisabled) return

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
    const baseOffset = isRevealed ? -totalActionsWidth : 0
    let newTranslateX = baseOffset + diffX

    // Apply resistance at edges
    if (newTranslateX > 0) {
      // Swiping right past origin - strong resistance
      newTranslateX = newTranslateX * 0.2
    } else if (newTranslateX < -totalActionsWidth * 1.3) {
      // Swiping past reveal width - resistance
      const overflow = Math.abs(newTranslateX) - totalActionsWidth * 1.3
      newTranslateX = -totalActionsWidth * 1.3 - overflow * 0.3
    }

    setTranslateX(newTranslateX)
  }, [isSwiping, isAnyDisabled, isRevealed, totalActionsWidth])

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
      setTranslateX(-totalActionsWidth)
    } else {
      // Snap to current state
      setTranslateX(isRevealed ? -totalActionsWidth : 0)
    }

    setIsSwiping(false)
    isHorizontalSwipe.current = null
  }, [isSwiping, translateX, isRevealed, totalActionsWidth])

  const handleAction = (action: SwipeAction) => {
    if (!action.disabled && !action.isLoading) {
      action.onAction()
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const deleteAction = actions.find(a => a.type === 'delete')
      if (deleteAction && !deleteAction.disabled && !deleteAction.isLoading) {
        e.preventDefault()
        if (confirm('Delete this comment?')) {
          deleteAction.onAction()
        }
      }
    } else if (e.key === 'e' || e.key === 'E') {
      const editAction = actions.find(a => a.type === 'edit')
      if (editAction && !editAction.disabled && !editAction.isLoading) {
        e.preventDefault()
        editAction.onAction()
      }
    } else if (e.key === 'Escape' && isRevealed) {
      setIsRevealed(false)
      setTranslateX(0)
    }
  }

  const getActionIcon = (action: SwipeAction) => {
    if (action.isLoading) {
      return <LoaderIcon size={18} />
    }
    return action.type === 'edit' ? <PencilIcon size={18} /> : <TrashIcon size={18} />
  }

  const getActionLabel = (action: SwipeAction) => {
    if (action.isLoading) {
      return action.type === 'edit' ? 'Saving' : 'Deleting'
    }
    return action.type === 'edit' ? 'Edit' : 'Delete'
  }

  const getActionBackground = (action: SwipeAction) => {
    return action.type === 'edit' 
      ? 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%)'
      : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)'
  }

  return (
    <div
      ref={rowRef}
      className={`swipeable-row ${className}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="listitem"
      aria-label="Swipe left for actions, or press E to edit, Delete to remove"
    >
      {/* Action buttons background */}
      <div 
        className="swipeable-action-container"
        style={{
          width: `${totalActionsWidth}px`,
          opacity: Math.min(Math.abs(translateX) / 30, 1),
        }}
      >
        {actions.map((action) => (
          <button
            key={action.type}
            onClick={() => handleAction(action)}
            disabled={action.isLoading || action.disabled}
            className="swipeable-action-btn"
            style={{
              background: getActionBackground(action),
              width: `${ACTION_WIDTH}px`,
            }}
            aria-label={getActionLabel(action)}
            tabIndex={isRevealed ? 0 : -1}
          >
            {getActionIcon(action)}
            <span className="swipeable-action-text">{getActionLabel(action)}</span>
          </button>
        ))}
      </div>

      {/* Swipeable content */}
      <div
        className={`swipeable-content ${contentClassName}`}
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
        {isTouchDevice && !isAnyDisabled && (
          <div 
            className="swipe-indicator"
            style={{
              opacity: isRevealed ? 0 : 0.5,
            }}
            aria-hidden="true"
          >
            <ChevronLeftIcon size={14} />
          </div>
        )}
      </div>
    </div>
  )
}
