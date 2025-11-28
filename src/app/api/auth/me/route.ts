import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user: { id: user.id, name: user.name } })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null })
  }
}
