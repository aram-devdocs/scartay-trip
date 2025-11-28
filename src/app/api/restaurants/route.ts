import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        votes: true,
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    return NextResponse.json(restaurants)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, url, address, neighborhood, hasCocktails, cuisineType, veganOrOmni, hours, daysClosed, priceRange } = data
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        url: url || '',
        address: address || '',
        neighborhood: neighborhood || '',
        hasCocktails: hasCocktails ?? false,
        cuisineType: cuisineType || null,
        veganOrOmni: veganOrOmni || 'Both',
        hours: hours || '',
        daysClosed: daysClosed || '',
        priceRange: priceRange || '',
      },
      include: {
        votes: true,
        comments: true,
      },
    })
    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return NextResponse.json({ error: 'Failed to create restaurant' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, name, url, address, neighborhood, hasCocktails, cuisineType, veganOrOmni, hours, daysClosed, priceRange } = data
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name,
        url,
        address,
        neighborhood,
        hasCocktails,
        cuisineType,
        veganOrOmni,
        hours,
        daysClosed,
        priceRange,
      },
      include: {
        votes: true,
        comments: true,
      },
    })
    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    await prisma.restaurant.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return NextResponse.json({ error: 'Failed to delete restaurant' }, { status: 500 })
  }
}
