'use client'

import { useOffline } from '@/hooks/useOffline'
import { WifiOffIcon } from '@/components/icons/Icons'

export default function OfflineBanner() {
  const { isOffline } = useOffline()

  if (!isOffline) {
    return null
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 animate-slide-down"
      style={{
        background: 'linear-gradient(135deg, #ff6b4a 0%, #ff2d92 100%)',
        boxShadow: '0 4px 20px rgba(255, 45, 146, 0.3)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
          <WifiOffIcon size={16} />
          <span>You&apos;re offline — viewing cached data</span>
        </div>
      </div>
    </div>
  )
}
