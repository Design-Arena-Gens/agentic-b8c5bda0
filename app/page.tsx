'use client'

import { useState } from 'react'
import { Upload, Video, Sparkles, Clock, DollarSign, Globe } from 'lucide-react'

interface VideoMetadata {
  title: string
  description: string
  tags: string[]
  hashtags: string[]
  thumbnailPrompt: string
}

interface UploadResult {
  videoId: string
  videoUrl: string
  metadata: VideoMetadata
  scheduledTime?: string
  status: string
}

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [category, setCategory] = useState('tech')
  const [language, setLanguage] = useState('en')
  const [monetization, setMonetization] = useState(true)
  const [scheduleTime, setScheduleTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/status')
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
    } catch (err) {
      setIsAuthenticated(false)
    }
  }

  useState(() => {
    checkAuth()
  })

  const handleGoogleAuth = () => {
    window.location.href = '/api/auth/google'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
      setVideoUrl('')
      setError('')
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value)
    setVideoFile(null)
    setError('')
  }

  const generateMetadata = async () => {
    if (!videoFile && !videoUrl) {
      setError('Please provide a video file or URL')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const formData = new FormData()
      if (videoFile) {
        formData.append('video', videoFile)
      } else {
        formData.append('videoUrl', videoUrl)
      }
      formData.append('category', category)
      formData.append('language', language)

      const res = await fetch('/api/generate-metadata', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Failed to generate metadata')
      }

      const data = await res.json()
      setMetadata(data.metadata)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate metadata')
    } finally {
      setGenerating(false)
    }
  }

  const handleUpload = async () => {
    if (!isAuthenticated) {
      setError('Please connect your Google account first')
      return
    }

    if (!metadata) {
      setError('Please generate metadata first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      if (videoFile) {
        formData.append('video', videoFile)
      } else {
        formData.append('videoUrl', videoUrl)
      }
      formData.append('metadata', JSON.stringify(metadata))
      formData.append('monetization', monetization.toString())
      if (scheduleTime) {
        formData.append('scheduleTime', scheduleTime)
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Failed to upload video')
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text flex items-center justify-center gap-3">
            <Video className="w-12 h-12 text-red-600" />
            YouTube Upload Agent
          </h1>
          <p className="text-gray-400 text-lg">
            Automated video uploads with AI-powered SEO optimization
          </p>
        </div>

        {!isAuthenticated && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-6 mb-8">
            <p className="text-yellow-300 mb-4 text-center">
              Connect your Google account to upload videos to YouTube
            </p>
            <button
              onClick={handleGoogleAuth}
              className="w-full bg-white text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Connect Google Account
            </button>
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="space-y-6">
            {/* Video Input */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">
                Video Source
              </label>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-red-500 transition-colors bg-gray-900/50">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <span className="text-gray-400">
                        {videoFile ? videoFile.name : 'Click to upload video file'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-center text-gray-500">OR</div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={handleUrlChange}
                  placeholder="Enter video URL"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none"
              >
                <option value="tech">Tech</option>
                <option value="vlog">Vlog</option>
                <option value="shorts">Shorts</option>
                <option value="gaming">Gaming</option>
                <option value="tutorial">Tutorial</option>
                <option value="entertainment">Entertainment</option>
                <option value="education">Education</option>
                <option value="music">Music</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
                <option value="it">Italian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
                <option value="hi">Hindi</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            {/* Monetization */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="monetization"
                checked={monetization}
                onChange={(e) => setMonetization(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-900/50 border-gray-600 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="monetization" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Enable Monetization
              </label>
            </div>

            {/* Schedule Time */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule Publish Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Generate Metadata Button */}
            <button
              onClick={generateMetadata}
              disabled={generating || (!videoFile && !videoUrl)}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {generating ? 'Generating SEO Metadata...' : 'Generate SEO Metadata'}
            </button>

            {/* Metadata Preview */}
            {metadata && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-red-500 mb-4">Generated Metadata</h3>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Title</label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{metadata.title.length} characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Description</label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Hashtags</label>
                  <div className="flex flex-wrap gap-2">
                    {metadata.hashtags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Thumbnail Prompt</label>
                  <p className="text-gray-300 text-sm bg-gray-800 p-3 rounded-lg">
                    {metadata.thumbnailPrompt}
                  </p>
                </div>
              </div>
            )}

            {/* Upload Button */}
            {metadata && (
              <button
                onClick={handleUpload}
                disabled={loading || !isAuthenticated}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                {loading ? 'Uploading to YouTube...' : 'Upload to YouTube'}
              </button>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Success Result */}
            {result && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-green-400 mb-4">✓ Upload Successful!</h3>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Video ID:</p>
                  <p className="text-white font-mono">{result.videoId}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Video URL:</p>
                  <a
                    href={result.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    {result.videoUrl}
                  </a>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Title:</p>
                  <p className="text-white">{result.metadata.title}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.metadata.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {result.scheduledTime && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Scheduled Publish:</p>
                    <p className="text-white">{new Date(result.scheduledTime).toLocaleString()}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Status:</p>
                  <p className="text-white font-semibold">{result.status}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by AI • SEO Optimized • Fully Automated</p>
        </div>
      </div>
    </main>
  )
}
