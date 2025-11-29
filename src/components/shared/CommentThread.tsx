'use client'

import { useState, useRef, useEffect } from 'react'
import { Comment, ItemType } from '@/types'
import { MessageCircleIcon, ChevronUpIcon, ChevronDownIcon, SendIcon, LoaderIcon, TrashIcon, PencilIcon, CheckIcon, XIcon } from '@/components/icons/Icons'
import SwipeableRow from './SwipeableRow'

interface CommentThreadProps {
  comments: Comment[]
  itemType: ItemType
  itemId: string
  currentUsername: string
  onAddComment: (itemType: ItemType, itemId: string, content: string) => void
  onDeleteComment: (commentId: string, itemType: ItemType) => void
  onEditComment: (commentId: string, itemType: ItemType, content: string) => void
  isAddingComment?: boolean
  addingCommentItemId?: string
  isDeletingComment?: boolean
  deletingCommentId?: string
  isEditingComment?: boolean
  editingCommentId?: string
}

export default function CommentThread({
  comments,
  itemType,
  itemId,
  currentUsername,
  onAddComment,
  onDeleteComment,
  onEditComment,
  isAddingComment = false,
  addingCommentItemId,
  isDeletingComment = false,
  deletingCommentId,
  isEditingComment = false,
  editingCommentId,
}: CommentThreadProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  const isThisItemAddingComment = isAddingComment && addingCommentItemId === itemId

  // Focus edit input when entering edit mode
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

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

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleSaveEdit = (commentId: string) => {
    if (editContent.trim() && editContent.trim() !== '') {
      onEditComment(commentId, itemType, editContent.trim())
      setEditingId(null)
      setEditContent('')
    }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent, commentId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit(commentId)
    } else if (e.key === 'Escape') {
      handleCancelEdit()
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
            const isEditing = isEditingComment && editingCommentId === comment.id
            const isInEditMode = editingId === comment.id
            
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

            // If this comment is being edited inline, show the edit form
            if (isInEditMode) {
              return (
                <div
                  key={comment.id}
                  className="comment-row p-2 sm:p-3 rounded-lg text-sm"
                  style={{ backgroundColor: 'var(--border-light)' }}
                  role="listitem"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium" style={{ color: 'var(--primary)' }}>
                      {comment.username}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Editing...</span>
                  </div>
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, comment.id)}
                    className="comment-edit-input"
                    placeholder="Edit your comment..."
                    disabled={isEditing}
                  />
                  <div className="comment-edit-actions">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={!editContent.trim() || isEditing}
                      className="comment-edit-btn comment-edit-btn-save"
                    >
                      {isEditing ? <LoaderIcon size={14} /> : <CheckIcon size={14} />}
                      {isEditing ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isEditing}
                      className="comment-edit-btn comment-edit-btn-cancel"
                    >
                      <XIcon size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              )
            }
            
            // For owner's comments, add swipe actions (edit + delete) and hover buttons
            return (
              <SwipeableRow
                key={comment.id}
                actions={[
                  {
                    type: 'edit',
                    onAction: () => handleStartEdit(comment),
                    isLoading: false,
                    disabled: isDeleting,
                  },
                  {
                    type: 'delete',
                    onAction: () => handleDelete(comment.id),
                    isLoading: isDeleting,
                    disabled: false,
                  },
                ]}
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
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(comment.createdAt)}</span>
                      {/* Desktop hover action buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartEdit(comment)
                        }}
                        disabled={isDeleting}
                        className="comment-action-btn p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        style={{ 
                          background: 'var(--secondary)',
                          color: 'white',
                        }}
                        title="Edit comment"
                        aria-label="Edit comment"
                      >
                        <PencilIcon size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(comment.id)
                        }}
                        disabled={isDeleting}
                        className="comment-action-btn p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
