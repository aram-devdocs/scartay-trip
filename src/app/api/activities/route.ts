import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        votes: true,
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, url, address, neighborhood, hours, daysClosed, price } = data
    const activity = await prisma.activity.create({
      data: {
        name,
        url: url || '',
        address: address || '',
        neighborhood: neighborhood || '',
        hours: hours || '',
        daysClosed: daysClosed || '',
        price: price || '',
      },
      include: {
        votes: true,
        comments: true,
      },
    })
    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, name, url, address, neighborhood, hours, daysClosed, price } = data
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        name,
        url,
        address,
        neighborhood,
        hours,
        daysClosed,
        price,
      },
      include: {
        votes: true,
        comments: true,
      },
    })
    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    await prisma.activity.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
  }
}
