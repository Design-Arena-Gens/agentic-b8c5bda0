import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { cookies } from 'next/headers'
import { Readable } from 'stream'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('google_access_token')?.value
    const refreshToken = cookieStore.get('google_refresh_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await request.formData()
    const metadataStr = formData.get('metadata') as string
    const monetization = formData.get('monetization') === 'true'
    const scheduleTime = formData.get('scheduleTime') as string | null
    const videoFile = formData.get('video') as File | null
    const videoUrl = formData.get('videoUrl') as string | null

    if (!metadataStr) {
      return NextResponse.json({ error: 'Metadata required' }, { status: 400 })
    }

    const metadata = JSON.parse(metadataStr)

    // Setup OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    })

    // Prepare video stream
    let videoStream: Readable

    if (videoFile) {
      // Convert File to stream
      const arrayBuffer = await videoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      videoStream = Readable.from(buffer)
    } else if (videoUrl) {
      // For demo: would need to fetch video from URL
      // In production, download the video first
      return NextResponse.json(
        { error: 'Video URL upload not yet implemented. Please upload a file.' },
        { status: 400 }
      )
    } else {
      return NextResponse.json({ error: 'Video file or URL required' }, { status: 400 })
    }

    // Determine privacy status
    let privacyStatus = 'public'
    if (scheduleTime) {
      privacyStatus = 'private' // Will be scheduled
    }

    // Build description with hashtags
    const fullDescription = `${metadata.description}\n\n${metadata.hashtags.join(' ')}`

    // Upload video
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: metadata.title,
          description: fullDescription,
          tags: metadata.tags,
          categoryId: '28', // Science & Technology (adjust based on category)
        },
        status: {
          privacyStatus: privacyStatus,
          selfDeclaredMadeForKids: false,
          embeddable: true,
          publicStatsViewable: true,
          ...(scheduleTime && { publishAt: new Date(scheduleTime).toISOString() }),
        },
      },
      media: {
        body: videoStream,
      },
    })

    const videoId = response.data.id
    const uploadedVideoUrl = `https://www.youtube.com/watch?v=${videoId}`

    return NextResponse.json({
      videoId,
      videoUrl: uploadedVideoUrl,
      metadata,
      scheduledTime: scheduleTime || null,
      status: scheduleTime ? 'Scheduled' : 'Published',
    })
  } catch (error: any) {
    console.error('Upload error:', error)

    // Handle specific errors
    if (error.response?.data?.error?.message) {
      return NextResponse.json(
        { error: error.response.data.error.message },
        { status: error.response.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to upload video. Make sure your Google account has access to YouTube.' },
      { status: 500 }
    )
  }
}
