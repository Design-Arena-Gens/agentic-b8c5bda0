import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('google_access_token')

  return NextResponse.json({
    authenticated: !!accessToken?.value,
  })
}
