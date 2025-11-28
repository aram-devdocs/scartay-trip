'use client'

import { useState } from 'react'

interface UsernameModalProps {
  onSubmit: (username: string) => void
}

export default function UsernameModal({ onSubmit }: UsernameModalProps) {
  const [username, setUsername] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onSubmit(username.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--satc-black)' }}>
          Welcome to the NYC Girls Trip!
        </h2>
        <p className="text-center mb-6" style={{ color: 'var(--satc-gray-dark)' }}>
          Enter your name to get started
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name (e.g., Tay or Scar)"
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-pink-500 text-lg"
            style={{ borderColor: 'var(--satc-gold)' }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full mt-4 py-3 rounded-lg text-white font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: username.trim() ? 'var(--satc-pink)' : 'var(--satc-gray)',
            }}
          >
            Let&apos;s Plan!
          </button>
        </form>
      </div>
    </div>
  )
}
