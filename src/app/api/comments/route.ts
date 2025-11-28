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

// Delete a comment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const username = searchParams.get('username')

    if (!id) {
      return NextResponse.json({ error: 'Missing comment id' }, { status: 400 })
    }

    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 })
    }

    // First, verify the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.username !== username) {
      return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 })
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, itemType: comment.itemType })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
