'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  highlighted?: boolean
}

export default function Card({ children, className = '', highlighted = false }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl p-3 sm:p-5 transition-all duration-300 ease-out
        hover:translate-y-[-4px] hover:shadow-lg
        ${highlighted ? 'ring-2 ring-primary' : ''}
        ${className}
      `}
      style={{
        background: highlighted
          ? 'linear-gradient(145deg, rgba(255,45,146,0.15) 0%, rgba(157,78,221,0.1) 100%)'
          : 'var(--gradient-card)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
      }}
    >
      {children}
    </div>
  )
}
