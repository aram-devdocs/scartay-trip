'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Flight, Hotel, Activity, Restaurant, ItemType, Vote, Comment } from '@/types'

// Query keys
export const tripKeys = {
  all: ['trip'] as const,
  flights: () => [...tripKeys.all, 'flights'] as const,
  hotels: () => [...tripKeys.all, 'hotels'] as const,
  activities: () => [...tripKeys.all, 'activities'] as const,
  restaurants: () => [...tripKeys.all, 'restaurants'] as const,
}

// Types for items with votes and comments
type TripItem = Flight | Hotel | Activity | Restaurant

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

// Vote mutation with optimistic updates
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
    onMutate: async ({ username, itemType, itemId, voteType }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: getQueryKey(itemType) })

      // Snapshot current data
      const previousData = queryClient.getQueryData<TripItem[]>(getQueryKey(itemType))

      // Optimistically update the cache
      queryClient.setQueryData<TripItem[]>(getQueryKey(itemType), (old) => {
        if (!old) return old
        return old.map((item) => {
          if (item.id !== itemId) return item

          const votes = item.votes || []
          const existingVote = votes.find((v) => v.username === username)

          let newVotes: Vote[]

          if (existingVote) {
            if (existingVote.voteType === voteType) {
              // Remove vote (toggle off)
              newVotes = votes.filter((v) => v.username !== username)
            } else {
              // Change vote type
              newVotes = votes.map((v) =>
                v.username === username ? { ...v, voteType } : v
              )
            }
          } else {
            // Add new vote
            const newVote: Vote = {
              id: `temp-${Date.now()}`,
              username,
              voteType,
              itemType,
              itemId,
              createdAt: new Date(),
            }
            newVotes = [...votes, newVote]
          }

          return { ...item, votes: newVotes }
        })
      })

      return { previousData }
    },
    onError: (_error, { itemType }, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(getQueryKey(itemType), context.previousData)
      }
    },
    onSettled: (_data, _error, { itemType }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}

// Comment mutation with optimistic updates
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
    onMutate: async ({ username, content, itemType, itemId }) => {
      await queryClient.cancelQueries({ queryKey: getQueryKey(itemType) })

      const previousData = queryClient.getQueryData<TripItem[]>(getQueryKey(itemType))

      // Optimistically add the comment
      queryClient.setQueryData<TripItem[]>(getQueryKey(itemType), (old) => {
        if (!old) return old
        return old.map((item) => {
          if (item.id !== itemId) return item

          const newComment: Comment = {
            id: `temp-${Date.now()}`,
            username,
            content,
            itemType,
            itemId,
            createdAt: new Date(),
          }

          return {
            ...item,
            comments: [...(item.comments || []), newComment],
          }
        })
      })

      return { previousData }
    },
    onError: (_error, { itemType }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getQueryKey(itemType), context.previousData)
      }
    },
    onSettled: (_data, _error, { itemType }) => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}

// Delete comment mutation with optimistic updates
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
    onMutate: async ({ commentId, itemType }) => {
      await queryClient.cancelQueries({ queryKey: getQueryKey(itemType) })

      const previousData = queryClient.getQueryData<TripItem[]>(getQueryKey(itemType))

      // Optimistically remove the comment
      queryClient.setQueryData<TripItem[]>(getQueryKey(itemType), (old) => {
        if (!old) return old
        return old.map((item) => {
          if (!item.comments?.some((c) => c.id === commentId)) return item
          return {
            ...item,
            comments: item.comments.filter((c) => c.id !== commentId),
          }
        })
      })

      return { previousData }
    },
    onError: (_error, { itemType }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getQueryKey(itemType), context.previousData)
      }
    },
    onSettled: (_data, _error, { itemType }) => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}

// Edit comment mutation with optimistic updates
export function useEditCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      commentId,
      username,
      content,
    }: {
      commentId: string
      username: string
      content: string
      itemType: ItemType
    }) => {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId, username, content }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to edit comment')
      }
      return res.json()
    },
    onMutate: async ({ commentId, content, itemType }) => {
      await queryClient.cancelQueries({ queryKey: getQueryKey(itemType) })

      const previousData = queryClient.getQueryData<TripItem[]>(getQueryKey(itemType))

      // Optimistically update the comment
      queryClient.setQueryData<TripItem[]>(getQueryKey(itemType), (old) => {
        if (!old) return old
        return old.map((item) => {
          if (!item.comments?.some((c) => c.id === commentId)) return item
          return {
            ...item,
            comments: item.comments.map((c) =>
              c.id === commentId ? { ...c, content } : c
            ),
          }
        })
      })

      return { previousData }
    },
    onError: (_error, { itemType }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getQueryKey(itemType), context.previousData)
      }
    },
    onSettled: (_data, _error, { itemType }) => {
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

// Add mutation with optimistic updates
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
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: getQueryKey(itemType) })

      const previousData = queryClient.getQueryData<TripItem[]>(getQueryKey(itemType))

      // Create optimistic item with temp ID
      const optimisticItem = {
        ...data,
        id: `temp-${Date.now()}`,
        votes: [],
        comments: [],
      } as TripItem

      // Optimistically add to list
      queryClient.setQueryData<TripItem[]>(getQueryKey(itemType), (old) => {
        return [...(old || []), optimisticItem]
      })

      return { previousData }
    },
    onError: (_error, _data, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getQueryKey(itemType), context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}

// Update mutation with optimistic updates
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
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: getQueryKey(itemType) })

      const previousData = queryClient.getQueryData<TripItem[]>(getQueryKey(itemType))

      // Optimistically update the item
      queryClient.setQueryData<TripItem[]>(getQueryKey(itemType), (old) => {
        if (!old) return old
        return old.map((item) =>
          item.id === data.id
            ? { ...item, ...data }
            : item
        )
      })

      return { previousData }
    },
    onError: (_error, _data, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getQueryKey(itemType), context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}

// Delete mutation with optimistic updates
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: getQueryKey(itemType) })

      const previousData = queryClient.getQueryData<TripItem[]>(getQueryKey(itemType))

      // Optimistically remove the item
      queryClient.setQueryData<TripItem[]>(getQueryKey(itemType), (old) => {
        if (!old) return old
        return old.filter((item) => item.id !== id)
      })

      return { previousData }
    },
    onError: (_error, _data, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getQueryKey(itemType), context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(itemType) })
    },
  })
}
