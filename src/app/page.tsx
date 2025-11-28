'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import { usePresence } from '@/hooks/usePresence'
import {
  useTripData,
  useVoteMutation,
  useCommentMutation,
  useAddMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '@/hooks/useTripData'
import { Flight, Hotel, Activity, Restaurant, ItemType } from '@/types'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import LoginModal from '@/components/shared/LoginModal'
import FlightsSection from '@/components/trip/FlightsSection'
import HotelsSection from '@/components/trip/HotelsSection'
import ActivitiesSection from '@/components/trip/ActivitiesSection'
import RestaurantsSection from '@/components/trip/RestaurantsSection'

type CrudItemType = 'flight' | 'hotel' | 'activity' | 'restaurant'

function getItemLabel(itemType: CrudItemType) {
  switch (itemType) {
    case 'flight':
      return 'Flight'
    case 'hotel':
      return 'Hotel'
    case 'activity':
      return 'Activity'
    case 'restaurant':
      return 'Restaurant'
  }
}

export default function Home() {
  const { user, isLoading: userLoading, login } = useUser()
  const { onlineUsers } = usePresence(user?.name || null, user?.id || null)

  const [activeTab, setActiveTab] = useState('flights')

  // Use TanStack Query for data fetching - no more polling!
  const { flights, hotels, activities, restaurants, isLoading: dataLoading } = useTripData()

  // Mutations
  const voteMutation = useVoteMutation()
  const commentMutation = useCommentMutation()

  const addFlightMutation = useAddMutation('flight')
  const addHotelMutation = useAddMutation('hotel')
  const addActivityMutation = useAddMutation('activity')
  const addRestaurantMutation = useAddMutation('restaurant')

  const updateFlightMutation = useUpdateMutation('flight')
  const updateHotelMutation = useUpdateMutation('hotel')
  const updateActivityMutation = useUpdateMutation('activity')
  const updateRestaurantMutation = useUpdateMutation('restaurant')

  const deleteFlightMutation = useDeleteMutation('flight')
  const deleteHotelMutation = useDeleteMutation('hotel')
  const deleteActivityMutation = useDeleteMutation('activity')
  const deleteRestaurantMutation = useDeleteMutation('restaurant')

  const handleVote = (itemType: ItemType, itemId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return
    voteMutation.mutate({ username: user.name, itemType, itemId, voteType })
  }

  const handleAddComment = (itemType: ItemType, itemId: string, content: string) => {
    if (!user) return
    commentMutation.mutate({ username: user.name, content, itemType, itemId })
  }

  const handleAdd = (itemType: CrudItemType, data: Partial<Flight | Hotel | Activity | Restaurant>) => {
    const mutation =
      itemType === 'flight'
        ? addFlightMutation
        : itemType === 'hotel'
          ? addHotelMutation
          : itemType === 'activity'
            ? addActivityMutation
            : addRestaurantMutation

    mutation.mutate(data, {
      onSuccess: () => toast.success(`${getItemLabel(itemType)} added!`),
      onError: () => toast.error(`Failed to add ${getItemLabel(itemType).toLowerCase()}`),
    })
  }

  const handleUpdate = (
    itemType: CrudItemType,
    data: Partial<Flight | Hotel | Activity | Restaurant> & { id: string }
  ) => {
    const mutation =
      itemType === 'flight'
        ? updateFlightMutation
        : itemType === 'hotel'
          ? updateHotelMutation
          : itemType === 'activity'
            ? updateActivityMutation
            : updateRestaurantMutation

    mutation.mutate(data, {
      onSuccess: () => toast.success(`${getItemLabel(itemType)} updated!`),
      onError: () => toast.error(`Failed to update ${getItemLabel(itemType).toLowerCase()}`),
    })
  }

  const handleDelete = (itemType: CrudItemType, id: string) => {
    const mutation =
      itemType === 'flight'
        ? deleteFlightMutation
        : itemType === 'hotel'
          ? deleteHotelMutation
          : itemType === 'activity'
            ? deleteActivityMutation
            : deleteRestaurantMutation

    mutation.mutate(id, {
      onSuccess: () => toast.success(`${getItemLabel(itemType)} deleted!`),
      onError: () => toast.error(`Failed to delete ${getItemLabel(itemType).toLowerCase()}`),
    })
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-xl font-medium animate-pulse" style={{ color: 'var(--primary)' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginModal onLogin={login} />
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header onlineUsers={onlineUsers} currentUsername={user.name} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {dataLoading && (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            Loading trip data...
          </div>
        )}

        {!dataLoading && activeTab === 'flights' && (
          <FlightsSection
            flights={flights}
            currentUsername={user.name}
            onVote={handleVote}
            onAddComment={handleAddComment}
            onAdd={(data) => handleAdd('flight', data)}
            onUpdate={(data) => handleUpdate('flight', data)}
            onDelete={(id) => handleDelete('flight', id)}
          />
        )}
        {!dataLoading && activeTab === 'hotels' && (
          <HotelsSection
            hotels={hotels}
            currentUsername={user.name}
            onVote={handleVote}
            onAddComment={handleAddComment}
            onAdd={(data) => handleAdd('hotel', data)}
            onUpdate={(data) => handleUpdate('hotel', data)}
            onDelete={(id) => handleDelete('hotel', id)}
          />
        )}
        {!dataLoading && activeTab === 'activities' && (
          <ActivitiesSection
            activities={activities}
            currentUsername={user.name}
            onVote={handleVote}
            onAddComment={handleAddComment}
            onAdd={(data) => handleAdd('activity', data)}
            onUpdate={(data) => handleUpdate('activity', data)}
            onDelete={(id) => handleDelete('activity', id)}
          />
        )}
        {!dataLoading && activeTab === 'food' && (
          <RestaurantsSection
            restaurants={restaurants}
            currentUsername={user.name}
            onVote={handleVote}
            onAddComment={handleAddComment}
            onAdd={(data) => handleAdd('restaurant', data)}
            onUpdate={(data) => handleUpdate('restaurant', data)}
            onDelete={(id) => handleDelete('restaurant', id)}
          />
        )}
      </main>

      <footer
        className="border-t py-4 text-center text-sm"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        XOXO, Scarlett & Taylor | NYC March 2025
      </footer>
    </div>
  )
}
