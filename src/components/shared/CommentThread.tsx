'use client'

import { useState } from 'react'
import { Comment, ItemType } from '@/types'

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
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm flex items-center gap-1"
        style={{ color: 'var(--satc-gray-dark)' }}
      >
        <span>💬</span>
        <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-2 rounded text-sm"
              style={{ backgroundColor: 'var(--satc-gray-light)' }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium" style={{ color: 'var(--satc-pink-dark)' }}>
                  {comment.username}
                </span>
                <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
              </div>
              <p style={{ color: 'var(--satc-gray-dark)' }}>{comment.content}</p>
            </div>
          ))}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Comment as ${currentUsername}...`}
              className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:border-pink-400"
              style={{ borderColor: 'var(--satc-gray-light)' }}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-3 py-2 rounded text-white text-sm disabled:opacity-50"
              style={{ backgroundColor: 'var(--satc-pink)' }}
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
