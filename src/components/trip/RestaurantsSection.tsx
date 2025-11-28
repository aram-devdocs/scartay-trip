'use client'

import { useState, useMemo } from 'react'
import { Restaurant, ItemType } from '@/types'
import Card from '@/components/shared/Card'
import VoteButtons, { getVoteScore } from '@/components/shared/VoteButtons'
import CommentThread from '@/components/shared/CommentThread'
import LinkName from '@/components/shared/LinkName'
import FilterBar, { FilterValues } from '@/components/shared/FilterBar'
import { isPriceInRange, getPriceRange } from '@/utils/priceUtils'
import { MapPinIcon, BuildingIcon, ClockIcon, XCircleIcon, DollarSignIcon, PencilIcon, PlusIcon, CheckIcon, XIcon, TrashIcon } from '@/components/icons/Icons'

interface RestaurantsSectionProps {
  restaurants: Restaurant[]
  currentUsername: string
  onVote: (itemType: ItemType, itemId: string, voteType: 'upvote' | 'downvote') => void
  onAddComment: (itemType: ItemType, itemId: string, content: string) => void
  onAdd: (data: Partial<Restaurant>) => void
  onUpdate: (data: Partial<Restaurant> & { id: string }) => void
  onDelete: (id: string) => void
}

const CUISINE_OPTIONS = [
  'American',
  'Bagels',
  'Bar/Lounge',
  'Breakfast/Brunch',
  'Chinese',
  'Coffee/Cafe',
  'Dessert',
  'French',
  'Indian',
  'Italian',
  'Japanese',
  'Korean',
  'Mediterranean',
  'Mexican',
  'Pizza',
  'Seafood',
  'Thai',
  'Vegan',
  'Vietnamese',
  'Other',
]

const emptyRestaurant = {
  name: '',
  url: '',
  address: '',
  neighborhood: '',
  hasCocktails: false,
  cuisineType: '',
  veganOrOmni: 'Both',
  hours: '',
  daysClosed: '',
  priceRange: '',
}

export default function RestaurantsSection({
  restaurants,
  currentUsername,
  onVote,
  onAddComment,
  onAdd,
  onUpdate,
  onDelete,
}: RestaurantsSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Restaurant>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRestaurant, setNewRestaurant] = useState(emptyRestaurant)

  // Filter state
  const priceRangeBounds = useMemo(() => {
    return getPriceRange(restaurants.map((r) => r.priceRange))
  }, [restaurants])

  const [filters, setFilters] = useState<FilterValues>({
    neighborhood: '',
    cuisineTypes: [],
    priceRange: [priceRangeBounds.min, priceRangeBounds.max],
  })

  // Get unique neighborhoods from data
  const neighborhoods = useMemo(() => {
    const uniqueNeighborhoods = new Set(
      restaurants.map((r) => r.neighborhood).filter((n): n is string => !!n)
    )
    return Array.from(uniqueNeighborhoods).sort()
  }, [restaurants])

  // Get unique cuisine types from data (only show what exists)
  const cuisineTypesInData = useMemo(() => {
    const uniqueCuisines = new Set(
      restaurants.map((r) => r.cuisineType).filter((c): c is string => !!c)
    )
    return Array.from(uniqueCuisines).sort()
  }, [restaurants])

  // Filter and sort restaurants
  const filteredAndSortedRestaurants = useMemo(() => {
    return [...restaurants]
      .filter((restaurant) => {
        // Neighborhood filter
        if (filters.neighborhood && restaurant.neighborhood !== filters.neighborhood) {
          return false
        }
        // Cuisine type filter
        if (
          filters.cuisineTypes.length > 0 &&
          !filters.cuisineTypes.includes(restaurant.cuisineType || '')
        ) {
          return false
        }
        // Price range filter
        if (!isPriceInRange(restaurant.priceRange, filters.priceRange[0], filters.priceRange[1])) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        const scoreA = getVoteScore(a.votes || [])
        const scoreB = getVoteScore(b.votes || [])
        return scoreB - scoreA
      })
  }, [restaurants, filters])

  const handleEdit = (restaurant: Restaurant) => {
    setEditingId(restaurant.id)
    setEditingData(restaurant)
  }

  const handleSave = () => {
    if (editingId && editingData.name) {
      onUpdate({ ...editingData, id: editingId } as Restaurant & { id: string })
      setEditingId(null)
      setEditingData({})
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingData({})
  }

  const handleDeleteClick = (id: string) => {
    if (confirm('Delete this restaurant?')) {
      onDelete(id)
    }
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newRestaurant.name) {
      onAdd(newRestaurant)
      setNewRestaurant(emptyRestaurant)
      setShowAddForm(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Food & Drinks
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Restaurants, bars, and places to eat - sorted by votes
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
              Add Restaurant
            </>
          )}
        </button>
      </div>

      <FilterBar
        neighborhoods={neighborhoods}
        cuisineOptions={cuisineTypesInData}
        priceRange={priceRangeBounds}
        values={filters}
        onChange={setFilters}
        showCuisine={true}
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
          <h3 className="font-bold mb-4" style={{ color: 'var(--primary)' }}>Add New Restaurant/Bar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name *"
              value={newRestaurant.name}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
              required
            />
            <input
              type="url"
              placeholder="Website URL"
              value={newRestaurant.url}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, url: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Address"
              value={newRestaurant.address}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Neighborhood"
              value={newRestaurant.neighborhood}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, neighborhood: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <select
              value={newRestaurant.cuisineType}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisineType: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            >
              <option value="">Select Cuisine Type</option>
              {CUISINE_OPTIONS.map((cuisine) => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
            <label className="flex items-center gap-3 px-3 py-2 border rounded-lg min-h-[44px] cursor-pointer">
              <input
                type="checkbox"
                checked={newRestaurant.hasCocktails}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, hasCocktails: e.target.checked })}
                className="w-5 h-5 accent-pink-500"
              />
              <span style={{ color: 'var(--text-secondary)' }}>Has Cocktails</span>
            </label>
            <select
              value={newRestaurant.veganOrOmni}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, veganOrOmni: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            >
              <option value="Vegan">Vegan</option>
              <option value="Omni">Omni</option>
              <option value="Both">Vegan Options Available</option>
            </select>
            <input
              type="text"
              placeholder="Hours"
              value={newRestaurant.hours}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, hours: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Days Closed"
              value={newRestaurant.daysClosed}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, daysClosed: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="Price Range"
              value={newRestaurant.priceRange}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, priceRange: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
          </div>
          <button type="submit" className="btn btn-primary mt-4">
            <PlusIcon size={16} />
            Add Restaurant
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4 stagger-children">
        {filteredAndSortedRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="transition-all duration-500 ease-in-out"
            style={{ order: -getVoteScore(restaurant.votes || []) }}
          >
            <Card>
              {editingId === restaurant.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={editingData.name || ''}
                      onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
                    />
                    <input
                      type="url"
                      placeholder="Website URL"
                      value={editingData.url || ''}
                      onChange={(e) => setEditingData({ ...editingData, url: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={editingData.address || ''}
                      onChange={(e) => setEditingData({ ...editingData, address: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
                    />
                    <input
                      type="text"
                      placeholder="Neighborhood"
                      value={editingData.neighborhood || ''}
                      onChange={(e) => setEditingData({ ...editingData, neighborhood: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
                    />
                    <select
                      value={editingData.cuisineType || ''}
                      onChange={(e) => setEditingData({ ...editingData, cuisineType: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
                    >
                      <option value="">Select Cuisine Type</option>
                      {CUISINE_OPTIONS.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-3 px-3 py-2 border rounded-lg min-h-[44px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingData.hasCocktails || false}
                        onChange={(e) => setEditingData({ ...editingData, hasCocktails: e.target.checked })}
                        className="w-5 h-5 accent-pink-500"
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>Has Cocktails</span>
                    </label>
                    <select
                      value={editingData.veganOrOmni || 'Both'}
                      onChange={(e) => setEditingData({ ...editingData, veganOrOmni: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
                    >
                      <option value="Vegan">Vegan</option>
                      <option value="Omni">Omni</option>
                      <option value="Both">Vegan Options Available</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Hours"
                      value={editingData.hours || ''}
                      onChange={(e) => setEditingData({ ...editingData, hours: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
                    />
                    <input
                      type="text"
                      placeholder="Days Closed"
                      value={editingData.daysClosed || ''}
                      onChange={(e) => setEditingData({ ...editingData, daysClosed: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
                    />
                    <input
                      type="text"
                      placeholder="Price Range"
                      value={editingData.priceRange || ''}
                      onChange={(e) => setEditingData({ ...editingData, priceRange: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-400 min-h-[44px]"
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
                      onClick={() => handleDeleteClick(restaurant.id)}
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
                  <div className="mb-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-lg font-bold flex-1 min-w-0" style={{ color: 'var(--primary)' }}>
                        <LinkName name={restaurant.name} url={restaurant.url} />
                      </h3>
                      <button
                        onClick={() => handleEdit(restaurant)}
                        className="p-2 rounded-full transition-all hover:scale-110 flex-shrink-0"
                        style={{ background: 'var(--border-light)', color: 'var(--text-muted)' }}
                        title="Edit"
                      >
                        <PencilIcon size={14} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {restaurant.cuisineType && (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: 'var(--gradient-primary)', color: 'white' }}
                        >
                          {restaurant.cuisineType}
                        </span>
                      )}
                      {restaurant.hasCocktails && (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: 'var(--gradient-secondary)', color: 'white' }}
                        >
                          Cocktails
                        </span>
                      )}
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
                      >
                        {restaurant.veganOrOmni}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {restaurant.address && (
                      <p className="flex items-center gap-2">
                        <MapPinIcon size={14} className="text-primary flex-shrink-0" />
                        <span>{restaurant.address}</span>
                      </p>
                    )}
                    {restaurant.neighborhood && (
                      <p className="flex items-center gap-2">
                        <BuildingIcon size={14} className="text-secondary flex-shrink-0" />
                        <span>{restaurant.neighborhood}</span>
                      </p>
                    )}
                    {restaurant.hours && (
                      <p className="flex items-center gap-2">
                        <ClockIcon size={14} className="text-accent flex-shrink-0" />
                        <span>{restaurant.hours}</span>
                      </p>
                    )}
                    {restaurant.daysClosed && restaurant.daysClosed !== 'None' && (
                      <p className="flex items-center gap-2">
                        <XCircleIcon size={14} className="text-accent flex-shrink-0" />
                        <span>Closed: {restaurant.daysClosed}</span>
                      </p>
                    )}
                    {restaurant.priceRange && (
                      <p className="flex items-center gap-2 font-medium" style={{ color: 'var(--accent)' }}>
                        <DollarSignIcon size={14} className="flex-shrink-0" />
                        <span>{restaurant.priceRange}</span>
                      </p>
                    )}
                  </div>

                  <VoteButtons
                    votes={restaurant.votes || []}
                    itemType="restaurant"
                    itemId={restaurant.id}
                    currentUsername={currentUsername}
                    onVote={onVote}
                  />

                  <CommentThread
                    comments={restaurant.comments || []}
                    itemType="restaurant"
                    itemId={restaurant.id}
                    currentUsername={currentUsername}
                    onAddComment={onAddComment}
                  />
                </>
              )}
            </Card>
          </div>
        ))}
      </div>

      {filteredAndSortedRestaurants.length === 0 && restaurants.length > 0 && (
        <p className="text-center py-8 text-gray-400">No restaurants match the current filters</p>
      )}

      {restaurants.length === 0 && (
        <p className="text-center py-8 text-gray-400">No restaurants added yet</p>
      )}
    </div>
  )
}
