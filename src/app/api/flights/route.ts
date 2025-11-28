import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const flights = await prisma.flight.findMany({
      include: {
        votes: true,
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    return NextResponse.json(flights)
  } catch (error) {
    console.error('Error fetching flights:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { travelerName, airline, price3Night, price4Night, inboundFlight, outboundFlight, notes } = data
    const flight = await prisma.flight.create({
      data: {
        travelerName,
        airline,
        price3Night: price3Night || 0,
        price4Night: price4Night || 0,
        inboundFlight: inboundFlight || '',
        outboundFlight: outboundFlight || '',
        notes: notes || '',
      },
      include: {
        votes: true,
        comments: true,
      },
    })
    return NextResponse.json(flight)
  } catch (error) {
    console.error('Error creating flight:', error)
    return NextResponse.json({ error: 'Failed to create flight' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, travelerName, airline, price3Night, price4Night, inboundFlight, outboundFlight, notes } = data
    const flight = await prisma.flight.update({
      where: { id },
      data: {
        travelerName,
        airline,
        price3Night,
        price4Night,
        inboundFlight,
        outboundFlight,
        notes,
      },
      include: {
        votes: true,
        comments: true,
      },
    })
    return NextResponse.json(flight)
  } catch (error) {
    console.error('Error updating flight:', error)
    return NextResponse.json({ error: 'Failed to update flight' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    await prisma.flight.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting flight:', error)
    return NextResponse.json({ error: 'Failed to delete flight' }, { status: 500 })
  }
}
