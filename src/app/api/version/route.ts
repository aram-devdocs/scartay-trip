import { NextResponse } from 'next/server'

// Build version is set at build time
// Using the build timestamp ensures a new version for every deployment
const BUILD_VERSION = process.env.BUILD_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString()

export async function GET() {
  return NextResponse.json(
    { version: BUILD_VERSION },
    {
      headers: {
        // Prevent caching so we always get the latest version
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  )
}
