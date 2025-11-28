export interface Flight {
  id: string
  travelerName: string
  price3Night: number | null
  price4Night: number | null
  inboundFlight: string | null
  outboundFlight: string | null
  airline: string | null
  notes: string | null
  votes?: Vote[]
  comments?: Comment[]
}

export interface Hotel {
  id: string
  name: string
  url: string | null
  totalPrice: number
  perPerson: number
  includes: string | null
  neighborhood: string | null
  notes: string | null
  price3NightTay: number | null
  price3NightScar: number | null
  price4NightTay: number | null
  price4NightScar: number | null
  votes?: Vote[]
  comments?: Comment[]
}

export interface Activity {
  id: string
  name: string
  url: string | null
  address: string | null
  neighborhood: string | null
  hours: string | null
  daysClosed: string | null
  price: string | null
  votes?: Vote[]
  comments?: Comment[]
}

export interface Restaurant {
  id: string
  name: string
  url: string | null
  address: string | null
  neighborhood: string | null
  hasCocktails: boolean
  cuisineType: string | null
  veganOrOmni: string | null
  hours: string | null
  daysClosed: string | null
  priceRange: string | null
  votes?: Vote[]
  comments?: Comment[]
}

export interface Vote {
  id: string
  username: string
  voteType: 'upvote' | 'downvote'
  itemType: 'flight' | 'hotel' | 'activity' | 'restaurant'
  itemId: string
  createdAt: Date
}

export interface Comment {
  id: string
  username: string
  content: string
  itemType: 'flight' | 'hotel' | 'activity' | 'restaurant'
  itemId: string
  createdAt: Date
}

export interface OnlineUser {
  id: string
  username: string
  sessionId: string
  lastSeen: Date
}

export type ItemType = 'flight' | 'hotel' | 'activity' | 'restaurant'

export interface TripData {
  flights: Flight[]
  hotels: Hotel[]
  activities: Activity[]
  restaurants: Restaurant[]
}
