import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Toggle vote (create if not exists, delete if exists)
export async function POST(request: Request) {
  try {
    const { username, voteType, itemType, itemId } = await request.json()

    if (!username || !voteType || !itemType || !itemId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if vote exists
    const existingVote = await prisma.vote.findFirst({
      where: {
        username,
        itemType,
        itemId,
      },
    })

    if (existingVote) {
      // If same vote type, remove it (toggle off)
      if (existingVote.voteType === voteType) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        })
        return NextResponse.json({ action: 'removed' })
      }

      // If different vote type, update it
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { voteType },
      })
      return NextResponse.json({ action: 'updated' })
    }

    // Create new vote
    const relationField = `${itemType}Id`
    await prisma.vote.create({
      data: {
        username,
        voteType,
        itemType,
        itemId,
        [relationField]: itemId,
      },
    })

    return NextResponse.json({ action: 'created' })
  } catch (error) {
    console.error('Error toggling vote:', error)
    return NextResponse.json({ error: 'Failed to toggle vote' }, { status: 500 })
  }
}
