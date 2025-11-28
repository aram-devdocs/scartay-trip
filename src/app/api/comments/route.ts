import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get comments for an item
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const itemType = searchParams.get('itemType')
    const itemId = searchParams.get('itemId')

    if (!itemType || !itemId) {
      return NextResponse.json({ error: 'Missing itemType or itemId' }, { status: 400 })
    }

    const comments = await prisma.comment.findMany({
      where: {
        itemType,
        itemId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json([], { status: 500 })
  }
}

// Create a comment
export async function POST(request: Request) {
  try {
    const { username, content, itemType, itemId } = await request.json()

    if (!username || !content || !itemType || !itemId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const relationField = `${itemType}Id`
    const comment = await prisma.comment.create({
      data: {
        username,
        content,
        itemType,
        itemId,
        [relationField]: itemId,
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
