'use client'

import { useState } from 'react'
import { Comment, ItemType } from '@/types'
import { MessageCircleIcon, ChevronUpIcon, ChevronDownIcon, SendIcon } from '@/components/icons/Icons'

interface CommentThreadProps {
  comments: Comment[]
  itemType: ItemType
  itemId: string
  currentUsername: string
  onAddComment: (itemType: ItemType, itemId: string, content: string) => void
}

export default function CommentThread({
  comments,
  itemType,
  itemId,
  currentUsername,
  onAddComment,
}: CommentThreadProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newComment, setNewComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(itemType, itemId, newComment.trim())
      setNewComment('')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="mt-2 sm:mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm flex items-center gap-1.5 min-h-[44px] px-2 -mx-2 rounded-lg transition-colors hover:bg-white/5"
        style={{ color: 'var(--text-muted)' }}
      >
        <MessageCircleIcon size={16} />
        <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
        {isExpanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-2 sm:p-3 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--border-light)' }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium" style={{ color: 'var(--primary)' }}>
                  {comment.username}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(comment.createdAt)}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
            </div>
          ))}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Comment as ${currentUsername}...`}
              className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none min-h-[44px]"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--input-bg)',
                color: 'var(--text)',
              }}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <SendIcon size={16} />
              <span className="hidden sm:inline">Post</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
