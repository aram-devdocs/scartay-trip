'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import { usePresence } from '@/hooks/usePresence'
import { Flight, Hotel, Activity, Restaurant, ItemType } from '@/types'

type CrudItemType = 'flight' | 'hotel' | 'activity' | 'restaurant'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import LoginModal from '@/components/shared/LoginModal'
import FlightsSection from '@/components/trip/FlightsSection'
import HotelsSection from '@/components/trip/HotelsSection'
import ActivitiesSection from '@/components/trip/ActivitiesSection'
import RestaurantsSection from '@/components/trip/RestaurantsSection'

export default function Home() {
  const { user, isLoading, login } = useUser()
  const { onlineUsers } = usePresence(user?.name || null, user?.id || null)

  const [activeTab, setActiveTab] = useState('flights')
  const [flights, setFlights] = useState<Flight[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  const fetchData = useCallback(async () => {
    try {
      const [flightsRes, hotelsRes, activitiesRes, restaurantsRes] = await Promise.all([
        fetch('/api/flights'),
        fetch('/api/hotels'),
        fetch('/api/activities'),
        fetch('/api/restaurants'),
      ])

      setFlights(await flightsRes.json())
      setHotels(await hotelsRes.json())
      setActivities(await activitiesRes.json())
      setRestaurants(await restaurantsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [])

  useEffect(() => {
    // Delay initial fetch to next tick to avoid synchronous setState in effect
    const initialFetch = setTimeout(fetchData, 0)
    const interval = setInterval(fetchData, 5000) // Poll every 5 seconds for updates
    return () => {
      clearTimeout(initialFetch)
      clearInterval(interval)
    }
  }, [fetchData])

  const handleVote = async (itemType: ItemType, itemId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return

    try {
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.name,
          voteType,
          itemType,
          itemId,
        }),
      })
      fetchData()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleAddComment = async (itemType: ItemType, itemId: string, content: string) => {
    if (!user) return

    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.name,
          content,
          itemType,
          itemId,
        }),
      })
      fetchData()
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const getApiPath = (itemType: CrudItemType) => {
    switch (itemType) {
      case 'flight': return 'flights'
      case 'hotel': return 'hotels'
      case 'activity': return 'activities'
      case 'restaurant': return 'restaurants'
    }
  }

  const getItemLabel = (itemType: CrudItemType) => {
    switch (itemType) {
      case 'flight': return 'Flight'
      case 'hotel': return 'Hotel'
      case 'activity': return 'Activity'
      case 'restaurant': return 'Restaurant'
    }
  }

  const handleAdd = async (itemType: CrudItemType, data: Partial<Flight | Hotel | Activity | Restaurant>) => {
    try {
      const res = await fetch(`/api/${getApiPath(itemType)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add')
      toast.success(`${getItemLabel(itemType)} added!`)
      fetchData()
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error(`Failed to add ${getItemLabel(itemType).toLowerCase()}`)
    }
  }

  const handleUpdate = async (itemType: CrudItemType, data: Partial<Flight | Hotel | Activity | Restaurant> & { id: string }) => {
    try {
      const res = await fetch(`/api/${getApiPath(itemType)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(`${getItemLabel(itemType)} updated!`)
      fetchData()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error(`Failed to update ${getItemLabel(itemType).toLowerCase()}`)
    }
  }

  const handleDelete = async (itemType: CrudItemType, id: string) => {
    try {
      const res = await fetch(`/api/${getApiPath(itemType)}?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success(`${getItemLabel(itemType)} deleted!`)
      fetchData()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error(`Failed to delete ${getItemLabel(itemType).toLowerCase()}`)
    }
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--background)' }}
      >
        <div
          className="text-xl font-medium animate-pulse"
          style={{ color: 'var(--primary)' }}
        >
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
        {activeTab === 'flights' && (
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
        {activeTab === 'hotels' && (
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
        {activeTab === 'activities' && (
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
        {activeTab === 'food' && (
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
