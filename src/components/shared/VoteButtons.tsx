'use client'

import { Vote, ItemType } from '@/types'
import { ArrowUpIcon, ArrowDownIcon } from '@/components/icons/Icons'

interface VoteButtonsProps {
  votes: Vote[]
  itemType: ItemType
  itemId: string
  currentUsername: string
  onVote: (itemType: ItemType, itemId: string, voteType: 'upvote' | 'downvote') => void
}

export function getVoteScore(votes: Vote[]): number {
  const upvotes = votes.filter((v) => v.voteType === 'upvote').length
  const downvotes = votes.filter((v) => v.voteType === 'downvote').length
  return upvotes - downvotes
}

export default function VoteButtons({ votes, itemType, itemId, currentUsername, onVote }: VoteButtonsProps) {
  const upvotes = votes.filter((v) => v.voteType === 'upvote')
  const downvotes = votes.filter((v) => v.voteType === 'downvote')
  const score = upvotes.length - downvotes.length

  const userUpvote = upvotes.find((v) => v.username === currentUsername)
  const userDownvote = downvotes.find((v) => v.username === currentUsername)

  return (
    <div
      className="flex items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4"
      style={{ borderTop: '1px solid var(--border-light)' }}
    >
      <button
        onClick={() => onVote(itemType, itemId, 'upvote')}
        className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: userUpvote ? 'var(--gradient-primary)' : 'var(--border-light)',
          color: userUpvote ? 'white' : 'var(--text-muted)',
          boxShadow: userUpvote ? 'var(--shadow-sm)' : 'none',
        }}
        title="Upvote"
      >
        <ArrowUpIcon size={18} />
      </button>

      <span
        className="min-w-[2.5rem] text-center font-bold text-lg transition-all duration-300"
        style={{
          color: score > 0 ? 'var(--primary)' : score < 0 ? 'var(--accent)' : 'var(--text-muted)',
        }}
      >
        {score}
      </span>

      <button
        onClick={() => onVote(itemType, itemId, 'downvote')}
        className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: userDownvote ? 'var(--gradient-accent)' : 'var(--border-light)',
          color: userDownvote ? 'white' : 'var(--text-muted)',
          boxShadow: userDownvote ? 'var(--shadow-sm)' : 'none',
        }}
        title="Downvote"
      >
        <ArrowDownIcon size={18} />
      </button>

      {votes.length > 0 && (
        <div
          className="text-xs ml-auto font-medium hidden sm:block"
          style={{ color: 'var(--text-muted)' }}
        >
          {[...new Set(votes.map((v) => v.username))].join(', ')}
        </div>
      )}
    </div>
  )
}
