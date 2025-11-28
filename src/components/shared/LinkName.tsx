'use client'

interface LinkNameProps {
  name: string
  url: string | null
  className?: string
}

export default function LinkName({ name, url, className = '' }: LinkNameProps) {
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`font-medium inline-flex items-center gap-1 hover:underline ${className}`}
        style={{ color: 'var(--satc-pink-dark)' }}
      >
        {name}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    )
  }

  return <span className={`font-medium ${className}`}>{name}</span>
}
