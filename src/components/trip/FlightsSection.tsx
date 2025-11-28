'use client'

import { useState, useMemo } from 'react'
import { Flight, ItemType } from '@/types'
import Card from '@/components/shared/Card'
import VoteButtons, { getVoteScore } from '@/components/shared/VoteButtons'
import CommentThread from '@/components/shared/CommentThread'
import { PlaneIcon, PlaneTakeoffIcon, AlertTriangleIcon, PencilIcon, PlusIcon, CheckIcon, XIcon, TrashIcon, LoaderIcon } from '@/components/icons/Icons'

interface VotingState {
  isVoting: boolean
  votingItemId?: string
  votingType?: 'upvote' | 'downvote'
}

interface CommentingState {
  isAddingComment: boolean
  addingCommentItemId?: string
}

interface MutationState {
  isAdding: boolean
  isUpdating: boolean
  updatingId?: string
  isDeleting: boolean
  deletingId?: string
}

interface FlightsSectionProps {
  flights: Flight[]
  currentUsername: string
  onVote: (itemType: ItemType, itemId: string, voteType: 'upvote' | 'downvote') => void
  onAddComment: (itemType: ItemType, itemId: string, content: string) => void
  onAdd: (data: Partial<Flight>) => void
  onUpdate: (data: Partial<Flight> & { id: string }) => void
  onDelete: (id: string) => void
  votingState: VotingState
  commentingState: CommentingState
  mutationState: MutationState
}

const emptyFlight = {
  travelerName: '',
  airline: '',
  price3Night: 0,
  price4Night: 0,
  inboundFlight: '',
  outboundFlight: '',
  notes: '',
}

export default function FlightsSection({
  flights,
  currentUsername,
  onVote,
  onAddComment,
  onAdd,
  onUpdate,
  onDelete,
  votingState,
  commentingState,
  mutationState,
}: FlightsSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Flight>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newFlight, setNewFlight] = useState(emptyFlight)

  const sortedFlights = useMemo(() => {
    return [...flights].sort((a, b) => {
      const scoreA = getVoteScore(a.votes || [])
      const scoreB = getVoteScore(b.votes || [])
      return scoreB - scoreA
    })
  }, [flights])

  const handleEdit = (flight: Flight) => {
    setEditingId(flight.id)
    setEditingData(flight)
  }

  const handleSave = () => {
    if (editingId && editingData.travelerName) {
      onUpdate({ ...editingData, id: editingId } as Flight & { id: string })
      setEditingId(null)
      setEditingData({})
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingData({})
  }

  const handleDeleteClick = (id: string) => {
    if (confirm('Delete this flight?')) {
      onDelete(id)
    }
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newFlight.travelerName) {
      onAdd(newFlight)
      setNewFlight(emptyFlight)
      setShowAddForm(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h2
            className="text-xl sm:text-2xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Flight Options
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Dates: March 26-29 (3 nights) or March 26-30 (4 nights) - sorted by votes
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary flex items-center justify-center gap-2 min-h-[44px] self-start sm:self-auto"
        >
          {showAddForm ? (
            <>
              <XIcon size={16} />
              Cancel
            </>
          ) : (
            <>
              <PlusIcon size={16} />
              Add Flight
            </>
          )}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255,45,146,0.1) 0%, rgba(157,78,221,0.08) 100%)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 className="font-bold mb-4" style={{ color: 'var(--primary)' }}>Add New Flight</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Traveler Name *"
              value={newFlight.travelerName}
              onChange={(e) => setNewFlight({ ...newFlight, travelerName: e.target.value })}
              className="px-3 py-2 border rounded-xl min-h-[44px]"
              required
            />
            <input
              type="text"
              placeholder="Airline"
              value={newFlight.airline}
              onChange={(e) => setNewFlight({ ...newFlight, airline: e.target.value })}
              className="px-3 py-2 border rounded-xl min-h-[44px]"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price (3 nights)"
              value={newFlight.price3Night || ''}
              onChange={(e) => setNewFlight({ ...newFlight, price3Night: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-xl min-h-[44px]"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price (4 nights)"
              value={newFlight.price4Night || ''}
              onChange={(e) => setNewFlight({ ...newFlight, price4Night: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-xl min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Inbound Flight (e.g., Delta 123 @ 8am)"
              value={newFlight.inboundFlight}
              onChange={(e) => setNewFlight({ ...newFlight, inboundFlight: e.target.value })}
              className="px-3 py-2 border rounded-xl min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Outbound Flight (e.g., Delta 456 @ 6pm)"
              value={newFlight.outboundFlight}
              onChange={(e) => setNewFlight({ ...newFlight, outboundFlight: e.target.value })}
              className="px-3 py-2 border rounded-xl min-h-[44px]"
            />
            <textarea
              placeholder="Notes"
              value={newFlight.notes}
              onChange={(e) => setNewFlight({ ...newFlight, notes: e.target.value })}
              className="px-3 py-2 border rounded-xl sm:col-span-2"
              rows={2}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={mutationState.isAdding}
          >
            {mutationState.isAdding ? <LoaderIcon size={16} /> : <PlusIcon size={16} />}
            {mutationState.isAdding ? 'Adding...' : 'Add Flight'}
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4 stagger-children">
        {sortedFlights.map((flight) => (
          <div
            key={flight.id}
            className="transition-all duration-500 ease-in-out"
            style={{ order: -getVoteScore(flight.votes || []) }}
          >
            <Card>
              {editingId === flight.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3">
                    <input
                      type="text"
                      placeholder="Traveler Name *"
                      value={editingData.travelerName || ''}
                      onChange={(e) => setEditingData({ ...editingData, travelerName: e.target.value })}
                      className="px-3 py-2 border rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Airline"
                      value={editingData.airline || ''}
                      onChange={(e) => setEditingData({ ...editingData, airline: e.target.value })}
                      className="px-3 py-2 border rounded-xl"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price (3 nights)"
                        value={editingData.price3Night || ''}
                        onChange={(e) => setEditingData({ ...editingData, price3Night: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border rounded-xl"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price (4 nights)"
                        value={editingData.price4Night || ''}
                        onChange={(e) => setEditingData({ ...editingData, price4Night: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border rounded-xl"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Inbound Flight"
                      value={editingData.inboundFlight || ''}
                      onChange={(e) => setEditingData({ ...editingData, inboundFlight: e.target.value })}
                      className="px-3 py-2 border rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Outbound Flight"
                      value={editingData.outboundFlight || ''}
                      onChange={(e) => setEditingData({ ...editingData, outboundFlight: e.target.value })}
                      className="px-3 py-2 border rounded-xl"
                    />
                    <textarea
                      placeholder="Notes"
                      value={editingData.notes || ''}
                      onChange={(e) => setEditingData({ ...editingData, notes: e.target.value })}
                      className="px-3 py-2 border rounded-xl"
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSave}
                      disabled={mutationState.isUpdating && mutationState.updatingId === flight.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-medium transition-all hover:scale-105 min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      {mutationState.isUpdating && mutationState.updatingId === flight.id ? <LoaderIcon size={14} /> : <CheckIcon size={14} />}
                      {mutationState.isUpdating && mutationState.updatingId === flight.id ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={mutationState.isUpdating && mutationState.updatingId === flight.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
                    >
                      <XIcon size={14} />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteClick(flight.id)}
                      disabled={mutationState.isDeleting && mutationState.deletingId === flight.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-medium sm:ml-auto transition-all hover:scale-105 min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{ background: 'var(--accent)' }}
                    >
                      {mutationState.isDeleting && mutationState.deletingId === flight.id ? <LoaderIcon size={14} /> : <TrashIcon size={14} />}
                      {mutationState.isDeleting && mutationState.deletingId === flight.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: 'var(--primary)' }}
                    >
                      {flight.travelerName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm px-3 py-1 rounded-full font-medium"
                        style={{
                          background: 'var(--gradient-secondary)',
                          color: 'white',
                        }}
                      >
                        {flight.airline}
                      </span>
                      <button
                        onClick={() => handleEdit(flight)}
                        className="p-2 rounded-full transition-all hover:scale-110"
                        style={{ background: 'var(--border-light)', color: 'var(--text-muted)' }}
                        title="Edit"
                      >
                        <PencilIcon size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div
                      className="p-2 sm:p-3 rounded-xl"
                      style={{ background: 'var(--border-light)' }}
                    >
                      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        3 nights (flight + hotel)
                      </div>
                      <div
                        className="text-lg sm:text-xl font-bold"
                        style={{ color: 'var(--accent)' }}
                      >
                        ${flight.price3Night}
                      </div>
                    </div>
                    <div
                      className="p-2 sm:p-3 rounded-xl"
                      style={{ background: 'var(--border-light)' }}
                    >
                      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        4 nights (flight + hotel)
                      </div>
                      <div
                        className="text-lg sm:text-xl font-bold"
                        style={{ color: 'var(--accent)' }}
                      >
                        ${flight.price4Night}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p
                      className="flex items-center gap-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <PlaneIcon size={16} className="text-secondary" />
                      <span>{flight.inboundFlight}</span>
                    </p>
                    <p
                      className="flex items-center gap-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <PlaneTakeoffIcon size={16} className="text-secondary" />
                      <span>{flight.outboundFlight}</span>
                    </p>
                  </div>

                  {flight.notes && (
                    <p
                      className="mt-3 text-sm flex items-start gap-2 p-2 rounded-lg"
                      style={{
                        background: 'rgba(255, 107, 74, 0.1)',
                        color: 'var(--accent-dark)',
                      }}
                    >
                      <AlertTriangleIcon size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{flight.notes}</span>
                    </p>
                  )}

                  <VoteButtons
                    votes={flight.votes || []}
                    itemType="flight"
                    itemId={flight.id}
                    currentUsername={currentUsername}
                    onVote={onVote}
                    isVoting={votingState.isVoting}
                    votingItemId={votingState.votingItemId}
                    votingType={votingState.votingType}
                  />

                  <CommentThread
                    comments={flight.comments || []}
                    itemType="flight"
                    itemId={flight.id}
                    currentUsername={currentUsername}
                    onAddComment={onAddComment}
                    isAddingComment={commentingState.isAddingComment}
                    addingCommentItemId={commentingState.addingCommentItemId}
                  />
                </>
              )}
            </Card>
          </div>
        ))}
      </div>

      {flights.length === 0 && (
        <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          No flights added yet
        </p>
      )}
    </div>
  )
}
