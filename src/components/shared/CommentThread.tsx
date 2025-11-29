'use client'

import { useState } from 'react'
import { Comment, ItemType } from '@/types'
import { MessageCircleIcon, ChevronUpIcon, ChevronDownIcon, SendIcon, LoaderIcon, TrashIcon } from '@/components/icons/Icons'
import SwipeableRow from './SwipeableRow'

interface CommentThreadProps {
  comments: Comment[]
  itemType: ItemType
  itemId: string
  currentUsername: string
  onAddComment: (itemType: ItemType, itemId: string, content: string) => void
  onDeleteComment: (commentId: string, itemType: ItemType) => void
  isAddingComment?: boolean
  addingCommentItemId?: string
  isDeletingComment?: boolean
  deletingCommentId?: string
}

export default function CommentThread({
  comments,
  itemType,
  itemId,
  currentUsername,
  onAddComment,
  onDeleteComment,
  isAddingComment = false,
  addingCommentItemId,
  isDeletingComment = false,
  deletingCommentId,
}: CommentThreadProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newComment, setNewComment] = useState('')

  const isThisItemAddingComment = isAddingComment && addingCommentItemId === itemId

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim() && !isThisItemAddingComment) {
      onAddComment(itemType, itemId, newComment.trim())
      setNewComment('')
    }
  }

  const handleDelete = (commentId: string) => {
    if (confirm('Delete this comment?')) {
      onDeleteComment(commentId, itemType)
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
        <div className="mt-2 space-y-2" role="list">
          {comments.map((comment) => {
            const isOwner = comment.username === currentUsername
            const isDeleting = isDeletingComment && deletingCommentId === comment.id
            
            // For comments by other users, render without swipe functionality
            if (!isOwner) {
              return (
                <div
                  key={comment.id}
                  className="comment-row p-2 sm:p-3 rounded-lg text-sm"
                  style={{ backgroundColor: 'var(--border-light)' }}
                  role="listitem"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium" style={{ color: 'var(--primary)' }}>
                      {comment.username}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(comment.createdAt)}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
                </div>
              )
            }
            
            // For owner's comments, add swipe-to-delete and hover delete
            return (
              <SwipeableRow
                key={comment.id}
                onDelete={() => handleDelete(comment.id)}
                isDeleting={isDeleting}
                className="comment-swipeable"
              >
                <div
                  className="comment-row comment-row-owner p-2 sm:p-3 rounded-lg text-sm group relative"
                  style={{ backgroundColor: 'var(--border-light)' }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium" style={{ color: 'var(--primary)' }}>
                      {comment.username}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(comment.createdAt)}</span>
                      {/* Desktop hover delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(comment.id)
                        }}
                        disabled={isDeleting}
                        className="comment-delete-btn p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        style={{ 
                          background: 'var(--accent)',
                          color: 'white',
                        }}
                        title="Delete comment"
                        aria-label="Delete comment"
                      >
                        {isDeleting ? <LoaderIcon size={12} /> : <TrashIcon size={12} />}
                      </button>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
                </div>
              </SwipeableRow>
            )
          })}

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
              disabled={isThisItemAddingComment}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isThisItemAddingComment}
              className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {isThisItemAddingComment ? <LoaderIcon size={16} /> : <SendIcon size={16} />}
              <span className="hidden sm:inline">{isThisItemAddingComment ? 'Posting...' : 'Post'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
