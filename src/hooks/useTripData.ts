'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Flight, Hotel, Activity, Restaurant, ItemType } from '@/types'

// Query keys
export const tripKeys = {
  all: ['trip'] as const,
  flights: () => [...tripKeys.all, 'flights'] as const,
  hotels: () => [...tripKeys.all, 'hotels'] as const,
  activities: () => [...tripKeys.all, 'activities'] as const,
  restaurants: () => [...tripKeys.all, 'restaurants'] as const,
}

// Fetch functions
const fetchFlights = async (): Promise<Flight[]> => {
  const res = await fetch('/api/flights')
  if (!res.ok) throw new Error('Failed to fetch flights')
  return res.json()
}

const fetchHotels = async (): Promise<Hotel[]> => {
  const res = await fetch('/api/hotels')
  if (!res.ok) throw new Error('Failed to fetch hotels')
  return res.json()
}

const fetchActivities = async (): Promise<Activity[]> => {
  const res = await fetch('/api/activities')
  if (!res.ok) throw new Error('Failed to fetch activities')
  return res.json()
}

const fetchRestaurants = async (): Promise<Restaurant[]> => {
  const res = await fetch('/api/restaurants')
  if (!res.ok) throw new Error('Failed to fetch restaurants')
  return res.json()
}

// Query hooks
export function useFlights() {
  return useQuery({
    queryKey: tripKeys.flights(),
    queryFn: fetchFlights,
  })
}

export function useHotels() {
  return useQuery({
    queryKey: tripKeys.hotels(),
    queryFn: fetchHotels,
  })
}

export function useActivities() {
  return useQuery({
    queryKey: tripKeys.activities(),
    queryFn: fetchActivities,
  })
}

export function useRestaurants() {
  return useQuery({
    queryKey: tripKeys.restaurants(),
    queryFn: fetchRestaurants,
  })
}

// Combined hook for all trip data
export function useTripData() {
  const flights = useFlights()
  const hotels = useHotels()
  const activities = useActivities()
  const restaurants = useRestaurants()

  const refetchAll = async () => {
    await Promise.all([
      flights.refetch(),
      hotels.refetch(),
      activities.refetch(),
      restaurants.refetch(),
    ])
  }

  return {
    flights: flights.data ?? [],
    hotels: hotels.data ?? [],
    activities: activities.data ?? [],
    restaurants: restaurants.data ?? [],
    isLoading: flights.isLoading || hotels.isLoading || activities.isLoading || restaurants.isLoading,
    isRefetching: flights.isRefetching || hotels.isRefetching || activities.isRefetching || restaurants.isRefetching,
    error: flights.error || hotels.error || activities.error || restaurants.error,
    refetchAll,
  }
}

// Helper to get the query key for an item type
function getQueryKey(itemType: ItemType) {
  switch (itemType) {
    case 'flight':
      return tripKeys.flights()
    case 'hotel':
      return tripKeys.hotels()
    case 'activity':
      return tripKeys.activities()
    case 'restaurant':
      return tripKeys.restaurants()
  }
}

// Vote mutation
export function useVoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      username,
      itemType,
      itemId,
      voteType,
    }: {
      username: string
      itemType: ItemType
      itemId: string
      voteType: 'upvote' | 'downvote'
    }) => {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, voteType, itemType, itemId }),
      })
      if (!res.ok) throw new Error('Failed to vote')
      return res.json()
    },
    onSuccess: (_, { itemType }) => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}

// Comment mutation
export function useCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      username,
      content,
      itemType,
      itemId,
    }: {
      username: string
      content: string
      itemType: ItemType
      itemId: string
    }) => {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, content, itemType, itemId }),
      })
      if (!res.ok) throw new Error('Failed to add comment')
      return res.json()
    },
    onSuccess: (_, { itemType }) => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}

// Delete comment mutation
export function useDeleteCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      commentId,
      username,
    }: {
      commentId: string
      username: string
      itemType: ItemType
    }) => {
      const res = await fetch(`/api/comments?id=${commentId}&username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete comment')
      }
      return res.json()
    },
    onSuccess: (_, { itemType }) => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}

type CrudItemType = 'flight' | 'hotel' | 'activity' | 'restaurant'

function getApiPath(itemType: CrudItemType) {
  switch (itemType) {
    case 'flight':
      return 'flights'
    case 'hotel':
      return 'hotels'
    case 'activity':
      return 'activities'
    case 'restaurant':
      return 'restaurants'
  }
}

// Add mutation
export function useAddMutation(itemType: CrudItemType) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Flight | Hotel | Activity | Restaurant>) => {
      const res = await fetch(`/api/${getApiPath(itemType)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}

// Update mutation
export function useUpdateMutation(itemType: CrudItemType) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Flight | Hotel | Activity | Restaurant> & { id: string }) => {
      const res = await fetch(`/api/${getApiPath(itemType)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}

// Delete mutation
export function useDeleteMutation(itemType: CrudItemType) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/${getApiPath(itemType)}?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}
