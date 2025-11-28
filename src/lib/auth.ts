import { cookies } from 'next/headers'
import { createHash } from 'crypto'
import { prisma } from './prisma'

const SESSION_COOKIE = 'scartay_session'

export function hashPin(pin: string): string {
  const salt = process.env.AUTH_PIN_SALT || 'default-dev-salt'
  return createHash('sha256').update(pin + salt).digest('hex')
}

export interface SessionData {
  userId: string
  name: string
}

export async function createSession(userId: string, name: string): Promise<string> {
  const sessionData: SessionData = { userId, name }
  const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64')
  return sessionToken
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    return sessionData as SessionData
  } catch {
    return null
  }
}

export async function getUser(): Promise<{ id: string; name: string } | null> {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true },
  })

  return user
}

export async function validateCredentials(name: string, pin: string): Promise<{ id: string; name: string } | null> {
  const hashedPin = hashPin(pin)

  const user = await prisma.user.findFirst({
    where: {
      name,
      pin: hashedPin,
    },
    select: { id: true, name: true },
  })

  return user
}
