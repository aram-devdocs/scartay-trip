'use client'

import { useState } from 'react'

interface LoginModalProps {
  onLogin: (name: string, pin: string) => Promise<{ success: boolean; error?: string }>
}

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [selectedName, setSelectedName] = useState<string>('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedName || pin.length !== 4) return

    setError('')
    setIsLoading(true)

    const result = await onLogin(selectedName, pin)

    if (!result.success) {
      setError(result.error || 'Login failed')
      setPin('')
    }

    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'var(--background)' }}>
      <div className="rounded-2xl shadow-xl p-4 sm:p-8 max-w-md w-full" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2" style={{ color: 'var(--primary)' }}>
          Welcome to the NYC Girls Trip!
        </h2>
        <p className="text-center mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
          Select your name and enter your PIN
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 sm:gap-4 mb-4">
            <button
              type="button"
              onClick={() => setSelectedName('Taylor')}
              className="flex-1 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all border-2 min-h-[48px]"
              style={{
                color: 'var(--text)',
                borderColor: selectedName === 'Taylor' ? 'var(--primary)' : 'var(--border)',
                background: selectedName === 'Taylor' ? 'var(--primary-muted)' : 'transparent',
              }}
            >
              Taylor
            </button>
            <button
              type="button"
              onClick={() => setSelectedName('Scarlett')}
              className="flex-1 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all border-2 min-h-[48px]"
              style={{
                color: 'var(--text)',
                borderColor: selectedName === 'Scarlett' ? 'var(--primary)' : 'var(--border)',
                background: selectedName === 'Scarlett' ? 'var(--primary-muted)' : 'transparent',
              }}
            >
              Scarlett
            </button>
          </div>

          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              setPin(value)
              setError('')
            }}
            placeholder="Enter 4-digit PIN"
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-lg text-center tracking-widest min-h-[48px]"
            style={{
              background: 'var(--input-bg)',
              color: 'var(--text)',
              borderColor: error ? '#ef4444' : 'var(--accent)',
            }}
            disabled={!selectedName}
          />

          {error && (
            <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!selectedName || pin.length !== 4 || isLoading}
            className="w-full mt-4 py-3 rounded-lg font-semibold text-base sm:text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            style={{
              background: selectedName && pin.length === 4 ? 'var(--primary)' : 'var(--border)',
              color: 'var(--text)',
            }}
          >
            {isLoading ? 'Logging in...' : "Let's Plan!"}
          </button>
        </form>
      </div>
    </div>
  )
}
