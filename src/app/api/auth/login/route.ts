import { NextResponse } from 'next/server'
import { validateCredentials, createSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { name, pin } = await request.json()

    if (!name || !pin) {
      return NextResponse.json({ error: 'Name and PIN are required' }, { status: 400 })
    }

    const user = await validateCredentials(name, pin)

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const sessionToken = await createSession(user.id, user.name)

    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name } })

    response.cookies.set('scartay_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
