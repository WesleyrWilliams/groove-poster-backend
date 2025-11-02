'use client'

import { useState } from 'react'
import { Play, Loader2, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import axios from 'axios'

interface UploadStatus {
  status: 'idle' | 'processing' | 'success' | 'error'
  message: string
  projectId?: string
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('')
  const [channelId, setChannelId] = useState('')
  const [language, setLanguage] = useState('en')
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const triggerWorkflow = async (mode: 'url' | 'channel') => {
    setIsLoading(true)
    setUploadStatus({
      status: 'processing',
      message: 'Starting workflow...',
    })

    try {
      const webhookUrl = `${window.location.origin}/api/n8n-webhook`

      const payload = mode === 'url' 
        ? { videoUrl, language }
        : { channelId, language }

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      setUploadStatus({
        status: 'success',
        message: mode === 'url' 
          ? `Video processing started! AI is finding viral moments and generating captions.`
          : `Channel monitoring started! AI will automatically process new videos.`,
      })
    } catch (error: any) {
      setUploadStatus({
        status: 'error',
        message: error.response?.data?.message || error.message || 'Failed to trigger workflow',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              🎉 GrooveSzn
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            AI-Powered Shorts Generator - 100% FREE
          </p>
          <p className="text-sm text-gray-500">
            Automatically create and upload viral shorts to TikTok, Instagram, YouTube Shorts, and Facebook
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Tab Selection */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button
              onClick={() => {
                setUploadStatus({ status: 'idle', message: '' })
                setVideoUrl('')
              }}
              className="px-6 py-3 font-medium text-gray-700 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-600 transition-colors"
            >
              Single Video URL
            </button>
            <button
              onClick={() => {
                setUploadStatus({ status: 'idle', message: '' })
                setChannelId('')
              }}
              className="px-6 py-3 font-medium text-gray-700 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-600 transition-colors"
            >
              Monitor YouTube Channel
            </button>
          </div>

          {/* Single Video Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <button
              onClick={() => triggerWorkflow('url')}
              disabled={!videoUrl || isLoading}
              className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Generate & Upload to All Platforms
                </>
              )}
            </button>
          </div>

          {/* Channel Monitor Form */}
          <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Channel ID
              </label>
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="UCbo-KbSjJDG6JWQ_MTZ_rNA"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Find your Channel ID at{' '}
                <a
                  href="https://commentpicker.com/youtube-channel-id.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  commentpicker.com
                </a>
              </p>
            </div>

            <button
              onClick={() => triggerWorkflow('channel')}
              disabled={!channelId || isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Channel Monitoring
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Card */}
        {uploadStatus.status !== 'idle' && (
          <div
            className={`bg-white rounded-xl shadow-lg p-6 ${
              uploadStatus.status === 'success'
                ? 'border-l-4 border-green-500'
                : uploadStatus.status === 'error'
                ? 'border-l-4 border-red-500'
                : 'border-l-4 border-blue-500'
            }`}
          >
            <div className="flex items-start gap-4">
              {uploadStatus.status === 'success' && (
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              )}
              {uploadStatus.status === 'error' && (
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              )}
              {uploadStatus.status === 'processing' && (
                <Loader2 className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1 animate-spin" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {uploadStatus.status === 'success'
                    ? 'Success!'
                    : uploadStatus.status === 'error'
                    ? 'Error'
                    : 'Processing...'}
                </h3>
                <p className="text-gray-600">{uploadStatus.message}</p>
                {uploadStatus.projectId && (
                  <p className="text-sm text-gray-500 mt-2">
                    Project ID: {uploadStatus.projectId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Platform Icons */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'TikTok', color: 'from-black to-gray-800' },
            { name: 'Instagram', color: 'from-purple-600 to-pink-600' },
            { name: 'YouTube', color: 'from-red-600 to-red-700' },
            { name: 'Facebook', color: 'from-blue-600 to-blue-700' },
          ].map((platform) => (
            <div
              key={platform.name}
              className={`bg-gradient-to-br ${platform.color} text-white p-6 rounded-xl text-center shadow-lg`}
            >
              <div className="font-bold text-lg">{platform.name}</div>
              <div className="text-sm mt-1 opacity-90">Auto Upload</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

