import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        votes: true,
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { perPerson: 'asc' },
    })
    return NextResponse.json(hotels)
  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, url, totalPrice, perPerson, includes, neighborhood, notes, price3NightTay, price3NightScar, price4NightTay, price4NightScar } = data
    const hotel = await prisma.hotel.create({
      data: {
        name,
        url: url || '',
        totalPrice: totalPrice || 0,
        perPerson: perPerson || 0,
        includes: includes || '',
        neighborhood: neighborhood || '',
        notes: notes || '',
        price3NightTay: price3NightTay || 0,
        price3NightScar: price3NightScar || 0,
        price4NightTay: price4NightTay || 0,
        price4NightScar: price4NightScar || 0,
      },
      include: {
        votes: true,
        comments: true,
      },
    })
    return NextResponse.json(hotel)
  } catch (error) {
    console.error('Error creating hotel:', error)
    return NextResponse.json({ error: 'Failed to create hotel' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, name, url, totalPrice, perPerson, includes, neighborhood, notes, price3NightTay, price3NightScar, price4NightTay, price4NightScar } = data
    const hotel = await prisma.hotel.update({
      where: { id },
      data: {
        name,
        url,
        totalPrice,
        perPerson,
        includes,
        neighborhood,
        notes,
        price3NightTay,
        price3NightScar,
        price4NightTay,
        price4NightScar,
      },
      include: {
        votes: true,
        comments: true,
      },
    })
    return NextResponse.json(hotel)
  } catch (error) {
    console.error('Error updating hotel:', error)
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    await prisma.hotel.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting hotel:', error)
    return NextResponse.json({ error: 'Failed to delete hotel' }, { status: 500 })
  }
}
