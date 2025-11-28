import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get online users (seen in last 60 seconds)
export async function GET() {
  try {
    const sixtySecondsAgo = new Date(Date.now() - 60000)

    const onlineUsers = await prisma.onlineUser.findMany({
      where: {
        lastSeen: {
          gte: sixtySecondsAgo,
        },
      },
      orderBy: {
        lastSeen: 'desc',
      },
    })

    return NextResponse.json(onlineUsers)
  } catch (error) {
    console.error('Error fetching online users:', error)
    return NextResponse.json([], { status: 500 })
  }
}

// Update presence (heartbeat)
export async function POST(request: Request) {
  try {
    const { username, sessionId } = await request.json()

    if (!username || !sessionId) {
      return NextResponse.json({ error: 'Missing username or sessionId' }, { status: 400 })
    }

    await prisma.onlineUser.upsert({
      where: { sessionId },
      update: {
        username,
        lastSeen: new Date(),
      },
      create: {
        username,
        sessionId,
        lastSeen: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating presence:', error)
    return NextResponse.json({ error: 'Failed to update presence' }, { status: 500 })
  }
}
