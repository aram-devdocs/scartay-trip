'use client'

import { useState, useMemo } from 'react'
import { Hotel, ItemType } from '@/types'
import Card from '@/components/shared/Card'
import VoteButtons, { getVoteScore } from '@/components/shared/VoteButtons'
import CommentThread from '@/components/shared/CommentThread'
import LinkName from '@/components/shared/LinkName'
import { MapPinIcon, AlertTriangleIcon, PencilIcon, PlusIcon, CheckIcon, XIcon, TrashIcon, LoaderIcon } from '@/components/icons/Icons'

interface VotingState {
  isVoting: boolean
  votingItemId?: string
  votingType?: 'upvote' | 'downvote'
}

interface CommentingState {
  isAddingComment: boolean
  addingCommentItemId?: string
  isDeletingComment?: boolean
  deletingCommentId?: string
  isEditingComment?: boolean
  editingCommentId?: string
}

interface MutationState {
  isAdding: boolean
  isUpdating: boolean
  updatingId?: string
  isDeleting: boolean
  deletingId?: string
}

interface HotelsSectionProps {
  hotels: Hotel[]
  currentUsername: string
  onVote: (itemType: ItemType, itemId: string, voteType: 'upvote' | 'downvote') => void
  onAddComment: (itemType: ItemType, itemId: string, content: string) => void
  onDeleteComment: (commentId: string, itemType: ItemType) => void
  onEditComment: (commentId: string, itemType: ItemType, content: string) => void
  onAdd: (data: Partial<Hotel>) => void
  onUpdate: (data: Partial<Hotel> & { id: string }) => void
  onDelete: (id: string) => void
  votingState: VotingState
  commentingState: CommentingState
  mutationState: MutationState
  isOffline?: boolean
}

const emptyHotel = {
  name: '',
  url: '',
  totalPrice: 0,
  perPerson: 0,
  includes: '',
  neighborhood: '',
  notes: '',
  price3NightTay: 0,
  price3NightScar: 0,
  price4NightTay: 0,
  price4NightScar: 0,
}

export default function HotelsSection({
  hotels,
  currentUsername,
  onVote,
  onAddComment,
  onDeleteComment,
  onEditComment,
  onAdd,
  onUpdate,
  onDelete,
  votingState,
  commentingState,
  mutationState,
  isOffline = false,
}: HotelsSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Hotel>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newHotel, setNewHotel] = useState(emptyHotel)

  const sortedHotels = useMemo(() => {
    return [...hotels].sort((a, b) => {
      const scoreA = getVoteScore(a.votes || [])
      const scoreB = getVoteScore(b.votes || [])
      return scoreB - scoreA
    })
  }, [hotels])

  const handleEdit = (hotel: Hotel) => {
    if (isOffline) return
    setEditingId(hotel.id)
    setEditingData(hotel)
  }

  const handleSave = () => {
    if (isOffline) return
    if (editingId && editingData.name) {
      onUpdate({ ...editingData, id: editingId } as Hotel & { id: string })
      setEditingId(null)
      setEditingData({})
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingData({})
  }

  const handleDeleteClick = (id: string) => {
    if (isOffline) return
    if (confirm('Delete this hotel?')) {
      onDelete(id)
    }
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isOffline) return
    if (newHotel.name) {
      onAdd(newHotel)
      setNewHotel(emptyHotel)
      setShowAddForm(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Hotel Options
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            All prices shown are total. Individual costs shown in the breakdown. Sorted by votes.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={isOffline}
          className="btn btn-primary flex items-center justify-center gap-2 min-h-[44px] self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
          title={isOffline ? 'Adding unavailable offline' : undefined}
        >
          {showAddForm ? (
            <>
              <XIcon size={16} />
              Cancel
            </>
          ) : (
            <>
              <PlusIcon size={16} />
              Add Hotel
            </>
          )}
        </button>
      </div>

      {showAddForm && !isOffline && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255,45,146,0.1) 0%, rgba(157,78,221,0.08) 100%)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 className="font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>Add New Hotel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Hotel Name *"
              value={newHotel.name}
              onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
              required
            />
            <input
              type="url"
              placeholder="Website URL"
              value={newHotel.url}
              onChange={(e) => setNewHotel({ ...newHotel, url: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Neighborhood"
              value={newHotel.neighborhood}
              onChange={(e) => setNewHotel({ ...newHotel, neighborhood: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Includes (perks)"
              value={newHotel.includes}
              onChange={(e) => setNewHotel({ ...newHotel, includes: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Total Price"
              value={newHotel.totalPrice || ''}
              onChange={(e) => setNewHotel({ ...newHotel, totalPrice: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Per Person"
              value={newHotel.perPerson || ''}
              onChange={(e) => setNewHotel({ ...newHotel, perPerson: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="number"
              step="0.01"
              placeholder="3-Night Tay"
              value={newHotel.price3NightTay || ''}
              onChange={(e) => setNewHotel({ ...newHotel, price3NightTay: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="number"
              step="0.01"
              placeholder="3-Night Scar"
              value={newHotel.price3NightScar || ''}
              onChange={(e) => setNewHotel({ ...newHotel, price3NightScar: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="number"
              step="0.01"
              placeholder="4-Night Tay"
              value={newHotel.price4NightTay || ''}
              onChange={(e) => setNewHotel({ ...newHotel, price4NightTay: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="number"
              step="0.01"
              placeholder="4-Night Scar"
              value={newHotel.price4NightScar || ''}
              onChange={(e) => setNewHotel({ ...newHotel, price4NightScar: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <textarea
              placeholder="Notes"
              value={newHotel.notes}
              onChange={(e) => setNewHotel({ ...newHotel, notes: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 sm:col-span-2"
              rows={2}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={mutationState.isAdding}
          >
            {mutationState.isAdding ? <LoaderIcon size={16} /> : <PlusIcon size={16} />}
            {mutationState.isAdding ? 'Adding...' : 'Add Hotel'}
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {sortedHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="transition-all duration-500 ease-in-out"
            style={{ order: -getVoteScore(hotel.votes || []) }}
          >
            <Card>
              {editingId === hotel.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3">
                    <input
                      type="text"
                      placeholder="Hotel Name *"
                      value={editingData.name || ''}
                      onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                      className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400"
                    />
                    <input
                      type="url"
                      placeholder="Website URL"
                      value={editingData.url || ''}
                      onChange={(e) => setEditingData({ ...editingData, url: e.target.value })}
                      className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400"
                    />
                    <input
                      type="text"
                      placeholder="Neighborhood"
                      value={editingData.neighborhood || ''}
                      onChange={(e) => setEditingData({ ...editingData, neighborhood: e.target.value })}
                      className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400"
                    />
                    <input
                      type="text"
                      placeholder="Includes"
                      value={editingData.includes || ''}
                      onChange={(e) => setEditingData({ ...editingData, includes: e.target.value })}
                      className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Total Price"
                        value={editingData.totalPrice || ''}
                        onChange={(e) => setEditingData({ ...editingData, totalPrice: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Per Person"
                        value={editingData.perPerson || ''}
                        onChange={(e) => setEditingData({ ...editingData, perPerson: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="3-Night Tay"
                        value={editingData.price3NightTay || ''}
                        onChange={(e) => setEditingData({ ...editingData, price3NightTay: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400 text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="3-Night Scar"
                        value={editingData.price3NightScar || ''}
                        onChange={(e) => setEditingData({ ...editingData, price3NightScar: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="4-Night Tay"
                        value={editingData.price4NightTay || ''}
                        onChange={(e) => setEditingData({ ...editingData, price4NightTay: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400 text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="4-Night Scar"
                        value={editingData.price4NightScar || ''}
                        onChange={(e) => setEditingData({ ...editingData, price4NightScar: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400 text-sm"
                      />
                    </div>
                    <textarea
                      placeholder="Notes"
                      value={editingData.notes || ''}
                      onChange={(e) => setEditingData({ ...editingData, notes: e.target.value })}
                      className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400"
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSave}
                      disabled={(mutationState.isUpdating && mutationState.updatingId === hotel.id) || isOffline}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-medium transition-all hover:scale-105 min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      {mutationState.isUpdating && mutationState.updatingId === hotel.id ? <LoaderIcon size={14} /> : <CheckIcon size={14} />}
                      {mutationState.isUpdating && mutationState.updatingId === hotel.id ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={mutationState.isUpdating && mutationState.updatingId === hotel.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
                    >
                      <XIcon size={14} />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteClick(hotel.id)}
                      disabled={(mutationState.isDeleting && mutationState.deletingId === hotel.id) || isOffline}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-medium sm:ml-auto transition-all hover:scale-105 min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{ background: 'var(--accent)' }}
                    >
                      {mutationState.isDeleting && mutationState.deletingId === hotel.id ? <LoaderIcon size={14} /> : <TrashIcon size={14} />}
                      {mutationState.isDeleting && mutationState.deletingId === hotel.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                        <LinkName name={hotel.name} url={hotel.url} />
                      </h3>
                      {!isOffline && (
                        <button
                          onClick={() => handleEdit(hotel)}
                          className="p-2 rounded-full transition-all hover:scale-110"
                          style={{ background: 'var(--border-light)', color: 'var(--text-muted)' }}
                          title="Edit"
                        >
                          <PencilIcon size={14} />
                        </button>
                      )}
                    </div>
                    <span
                      className="text-sm flex items-center gap-1.5 mt-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <MapPinIcon size={14} className="text-secondary" />
                      {hotel.neighborhood}
                    </span>
                  </div>

                  <div
                    className="flex justify-between items-center mb-4 p-3 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(255,45,146,0.15) 0%, rgba(157,78,221,0.15) 100%)' }}
                  >
                    <div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--primary-dark)' }}>
                        ${hotel.totalPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Per Person</div>
                      <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                        ${hotel.perPerson.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {hotel.includes && (
                    <div
                      className="mb-4 p-3 rounded-xl text-sm"
                      style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
                    >
                      <span className="font-semibold">Includes: </span>
                      {hotel.includes}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="p-3 rounded-xl" style={{ background: 'var(--border-light)' }}>
                      <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>3 Nights</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Tay: ${hotel.price3NightTay}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Scar: ${hotel.price3NightScar}</div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--border-light)' }}>
                      <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>4 Nights</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Tay: ${hotel.price4NightTay}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Scar: ${hotel.price4NightScar}</div>
                    </div>
                  </div>

                  {hotel.notes && (
                    <p
                      className="text-sm flex items-start gap-2 mb-4 p-3 rounded-xl"
                      style={{
                        background: 'rgba(255, 107, 74, 0.1)',
                        color: 'var(--accent-dark)',
                      }}
                    >
                      <AlertTriangleIcon size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{hotel.notes}</span>
                    </p>
                  )}

                  <VoteButtons
                    votes={hotel.votes || []}
                    itemType="hotel"
                    itemId={hotel.id}
                    currentUsername={currentUsername}
                    onVote={onVote}
                    isVoting={votingState.isVoting}
                    votingItemId={votingState.votingItemId}
                    votingType={votingState.votingType}
                    isOffline={isOffline}
                  />

                  <CommentThread
                    comments={hotel.comments || []}
                    itemType="hotel"
                    itemId={hotel.id}
                    currentUsername={currentUsername}
                    onAddComment={onAddComment}
                    onDeleteComment={onDeleteComment}
                    onEditComment={onEditComment}
                    isAddingComment={commentingState.isAddingComment}
                    addingCommentItemId={commentingState.addingCommentItemId}
                    isDeletingComment={commentingState.isDeletingComment}
                    deletingCommentId={commentingState.deletingCommentId}
                    isEditingComment={commentingState.isEditingComment}
                    editingCommentId={commentingState.editingCommentId}
                    isOffline={isOffline}
                  />
                </>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
