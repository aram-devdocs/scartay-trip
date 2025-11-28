'use client'

import { useState, useMemo } from 'react'
import { Activity, ItemType } from '@/types'
import Card from '@/components/shared/Card'
import VoteButtons, { getVoteScore } from '@/components/shared/VoteButtons'
import CommentThread from '@/components/shared/CommentThread'
import LinkName from '@/components/shared/LinkName'
import FilterBar, { FilterValues } from '@/components/shared/FilterBar'
import { isPriceInRange, getPriceRange } from '@/utils/priceUtils'
import { MapPinIcon, BuildingIcon, ClockIcon, XCircleIcon, PencilIcon, PlusIcon, CheckIcon, XIcon, TrashIcon } from '@/components/icons/Icons'

interface ActivitiesSectionProps {
  activities: Activity[]
  currentUsername: string
  onVote: (itemType: ItemType, itemId: string, voteType: 'upvote' | 'downvote') => void
  onAddComment: (itemType: ItemType, itemId: string, content: string) => void
  onAdd: (data: Partial<Activity>) => void
  onUpdate: (data: Partial<Activity> & { id: string }) => void
  onDelete: (id: string) => void
}

const emptyActivity = { name: '', url: '', address: '', neighborhood: '', hours: '', daysClosed: '', price: '' }

export default function ActivitiesSection({
  activities,
  currentUsername,
  onVote,
  onAddComment,
  onAdd,
  onUpdate,
  onDelete,
}: ActivitiesSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Activity>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newActivity, setNewActivity] = useState(emptyActivity)

  // Filter state
  const priceRangeBounds = useMemo(() => {
    return getPriceRange(activities.map((a) => a.price))
  }, [activities])

  const [filters, setFilters] = useState<FilterValues>({
    neighborhood: '',
    cuisineTypes: [],
    priceRange: [priceRangeBounds.min, priceRangeBounds.max],
  })

  // Get unique neighborhoods from data
  const neighborhoods = useMemo(() => {
    const uniqueNeighborhoods = new Set(
      activities.map((a) => a.neighborhood).filter((n): n is string => !!n)
    )
    return Array.from(uniqueNeighborhoods).sort()
  }, [activities])

  // Filter and sort activities
  const filteredAndSortedActivities = useMemo(() => {
    return [...activities]
      .filter((activity) => {
        // Neighborhood filter
        if (filters.neighborhood && activity.neighborhood !== filters.neighborhood) {
          return false
        }
        // Price range filter
        if (!isPriceInRange(activity.price, filters.priceRange[0], filters.priceRange[1])) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        const scoreA = getVoteScore(a.votes || [])
        const scoreB = getVoteScore(b.votes || [])
        return scoreB - scoreA
      })
  }, [activities, filters])

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setEditingData(activity)
  }

  const handleSave = () => {
    if (editingId && editingData.name) {
      onUpdate({ ...editingData, id: editingId } as Activity & { id: string })
      setEditingId(null)
      setEditingData({})
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingData({})
  }

  const handleDeleteClick = (id: string) => {
    if (confirm('Delete this activity?')) {
      onDelete(id)
    }
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newActivity.name) {
      onAdd(newActivity)
      setNewActivity(emptyActivity)
      setShowAddForm(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Activities
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Things to do in NYC - sorted by votes
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
              Add Activity
            </>
          )}
        </button>
      </div>

      <FilterBar
        neighborhoods={neighborhoods}
        priceRange={priceRangeBounds}
        values={filters}
        onChange={setFilters}
        showCuisine={false}
      />

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
          <h3 className="font-bold mb-4" style={{ color: 'var(--primary)' }}>Add New Activity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name *"
              value={newActivity.name}
              onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
              required
            />
            <input
              type="url"
              placeholder="Website URL"
              value={newActivity.url}
              onChange={(e) => setNewActivity({ ...newActivity, url: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Address"
              value={newActivity.address}
              onChange={(e) => setNewActivity({ ...newActivity, address: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Neighborhood"
              value={newActivity.neighborhood}
              onChange={(e) => setNewActivity({ ...newActivity, neighborhood: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Hours"
              value={newActivity.hours}
              onChange={(e) => setNewActivity({ ...newActivity, hours: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Days Closed"
              value={newActivity.daysClosed}
              onChange={(e) => setNewActivity({ ...newActivity, daysClosed: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Price (e.g., $30 or Free)"
              value={newActivity.price}
              onChange={(e) => setNewActivity({ ...newActivity, price: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
          </div>
          <button type="submit" className="btn btn-primary mt-4">
            <PlusIcon size={16} />
            Add Activity
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4 stagger-children">
        {filteredAndSortedActivities.map((activity) => (
          <div
            key={activity.id}
            className="transition-all duration-500 ease-in-out"
            style={{ order: -getVoteScore(activity.votes || []) }}
          >
            <Card>
              {editingId === activity.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3">
                    <input
                      type="text"
                      placeholder="Name *"
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
                      placeholder="Address"
                      value={editingData.address || ''}
                      onChange={(e) => setEditingData({ ...editingData, address: e.target.value })}
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
                      placeholder="Hours"
                      value={editingData.hours || ''}
                      onChange={(e) => setEditingData({ ...editingData, hours: e.target.value })}
                      className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400"
                    />
                    <input
                      type="text"
                      placeholder="Days Closed"
                      value={editingData.daysClosed || ''}
                      onChange={(e) => setEditingData({ ...editingData, daysClosed: e.target.value })}
                      className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400"
                    />
                    <input
                      type="text"
                      placeholder="Price"
                      value={editingData.price || ''}
                      onChange={(e) => setEditingData({ ...editingData, price: e.target.value })}
                      className="px-3 py-2 border rounded focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-medium transition-all hover:scale-105 min-h-[44px]"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      <CheckIcon size={14} />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 min-h-[44px]"
                      style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
                    >
                      <XIcon size={14} />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteClick(activity.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-medium sm:ml-auto transition-all hover:scale-105 min-h-[44px]"
                      style={{ background: 'var(--accent)' }}
                    >
                      <TrashIcon size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                      <LinkName name={activity.name} url={activity.url} />
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm px-3 py-1 rounded-full font-medium"
                        style={{
                          background: activity.price === 'Free' ? 'var(--gradient-secondary)' : 'var(--gradient-accent)',
                          color: 'white',
                        }}
                      >
                        {activity.price}
                      </span>
                      <button
                        onClick={() => handleEdit(activity)}
                        className="p-2 rounded-full transition-all hover:scale-110"
                        style={{ background: 'var(--border-light)', color: 'var(--text-muted)' }}
                        title="Edit"
                      >
                        <PencilIcon size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {activity.address && (
                      <p className="flex items-center gap-2">
                        <MapPinIcon size={14} className="text-primary flex-shrink-0" />
                        <span>{activity.address}</span>
                      </p>
                    )}
                    {activity.neighborhood && (
                      <p className="flex items-center gap-2">
                        <BuildingIcon size={14} className="text-secondary flex-shrink-0" />
                        <span>{activity.neighborhood}</span>
                      </p>
                    )}
                    {activity.hours && (
                      <p className="flex items-center gap-2">
                        <ClockIcon size={14} className="text-accent flex-shrink-0" />
                        <span>{activity.hours}</span>
                      </p>
                    )}
                    {activity.daysClosed && (
                      <p className="flex items-center gap-2">
                        <XCircleIcon size={14} className="text-accent flex-shrink-0" />
                        <span>Closed: {activity.daysClosed}</span>
                      </p>
                    )}
                  </div>

                  <VoteButtons
                    votes={activity.votes || []}
                    itemType="activity"
                    itemId={activity.id}
                    currentUsername={currentUsername}
                    onVote={onVote}
                  />

                  <CommentThread
                    comments={activity.comments || []}
                    itemType="activity"
                    itemId={activity.id}
                    currentUsername={currentUsername}
                    onAddComment={onAddComment}
                  />
                </>
              )}
            </Card>
          </div>
        ))}
      </div>

      {filteredAndSortedActivities.length === 0 && activities.length > 0 && (
        <p className="text-center py-8 text-gray-400">No activities match the current filters</p>
      )}

      {activities.length === 0 && (
        <p className="text-center py-8 text-gray-400">No activities added yet</p>
      )}
    </div>
  )
}
