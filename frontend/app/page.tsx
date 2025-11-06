'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, RefreshCw, Settings, Video, Clock, TrendingUp, CheckCircle, AlertCircle, Trash2, Edit, Upload } from 'lucide-react'
import axios from 'axios'

interface LogEntry {
  id: number
  message: string
  time: string
  type: 'success' | 'processing' | 'search' | 'upload' | 'trigger' | 'error'
}

interface ContentItem {
  id: number
  title: string
  status: string
  platform: string
  thumbnail: string
  link?: string
  channel?: string
}

// AddLog utility to resolve usage of addLog across the file
const useAddLog = (setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>) => {
  // Just adds a log entry to local logs
  return (message: string, type: LogEntry['type']) => {
    setLogs(prevLogs => [
      ...prevLogs,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type
      }
    ])
  }
}

const GrooveSznDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [automationActive, setAutomationActive] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [postingInterval, setPostingInterval] = useState('1')
  const [batchSize, setBatchSize] = useState('5')
  const [platformPriority, setPlatformPriority] = useState('both')
  const [nextRunTime, setNextRunTime] = useState(3600)
  const [flowStep, setFlowStep] = useState(-1) // -1 means not running
  const [isFlowRunning, setIsFlowRunning] = useState(false)
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)
  
  // Video processing state
  const [videoUrl, setVideoUrl] = useState('')
  const [channelId, setChannelId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [clipVideoUrl, setClipVideoUrl] = useState('')
  const [isProcessingClips, setIsProcessingClips] = useState(false)
  const [uploadEnabled, setUploadEnabled] = useState(true)
  
  // Live data state
  const [stats, setStats] = useState({
    videosFound: 0,
    postedToday: 0,
    pendingQueue: 0,
    automationStatus: 'Active'
  })
  const [contentLibrary, setContentLibrary] = useState<ContentItem[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://groove-poster-backend.vercel.app'

  const flowSteps = [
    { icon: '🔍', label: 'Search', color: 'bg-blue-500' },
    { icon: '✂️', label: 'Clip', color: 'bg-purple-500' },
    { icon: '📝', label: 'Transcribe', color: 'bg-green-500' },
    { icon: '📤', label: 'Post', color: 'bg-orange-500' },
    { icon: '✅', label: 'Complete', color: 'bg-teal-500' }
  ]

  // --- ADD LOCAL addLog that just logs to the UI ---
  const addLog = useAddLog(setLogs)

  // Fetch stats on mount and periodically
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/stats`)
        setStats(response.data)
        setIsLoadingStats(false)
      } catch (error) {
        console.error('Error fetching stats:', error)
        setIsLoadingStats(false)
      }
    }
    
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [backendUrl])

  // Fetch content library on mount and when tab changes
  useEffect(() => {
    if (activeTab === 'library') {
      const fetchLibrary = async () => {
        try {
          const response = await axios.get(`${backendUrl}/api/content-library`)
          setContentLibrary(response.data)
        } catch (error) {
          console.error('Error fetching content library:', error)
        }
      }
      fetchLibrary()
      const interval = setInterval(fetchLibrary, 60000) // Refresh every minute
      return () => clearInterval(interval)
    }
  }, [activeTab, backendUrl])

  // Load automation settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('automationSettings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setAutomationActive(settings.active !== false)
        setPostingInterval(settings.postingInterval || '1')
        setBatchSize(settings.batchSize || '5')
        setPlatformPriority(settings.platformPriority || 'both')
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }
  }, [])

  // Calculate next run time based on interval
  useEffect(() => {
    const intervalHours = parseInt(postingInterval) || 1
    const intervalSeconds = intervalHours * 3600
    
    setNextRunTime(intervalSeconds)
    const timer = setInterval(() => {
      setNextRunTime(prev => {
        if (prev <= 1) {
          return intervalSeconds // Reset when countdown reaches 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [postingInterval])

  // Flow step animation (only when flow is running)
  useEffect(() => {
    if (!isFlowRunning) {
      setFlowStep(-1)
      return
    }
    
    let currentStep = 0
    const flowTimer = setInterval(() => {
      setFlowStep(currentStep)
      currentStep++
      if (currentStep >= flowSteps.length) {
        setIsFlowRunning(false)
        setFlowStep(-1)
        clearInterval(flowTimer)
      }
    }, 3000) // 3 seconds per step
    
    return () => clearInterval(flowTimer)
  }, [isFlowRunning])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs}h ${mins}m ${secs}s`
  }

  // Fetch logs from backend
  const fetchLogs = async (workflowId: string | null = null) => {
    try {
      const params = new URLSearchParams()
      if (workflowId) params.append('workflowId', workflowId)
      params.append('limit', '100')
      
      const response = await axios.get(`${backendUrl}/api/logs?${params.toString()}`)
      const fetchedLogs = response.data.logs || []
      
      // Convert backend log format to frontend format
      const formattedLogs: LogEntry[] = fetchedLogs.map((log: any) => ({
        id: log.id,
        message: log.message,
        time: log.time || new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: log.type || 'processing'
      }))
      
      setLogs(formattedLogs)
      return formattedLogs
    } catch (error) {
      console.error('Error fetching logs:', error)
      return []
    }
  }

  // Poll for logs when workflow is running
  useEffect(() => {
    if (!currentWorkflowId || !isFlowRunning) return
    
    // Fetch logs immediately
    fetchLogs(currentWorkflowId)
    
    // Poll every 2 seconds while workflow is running
    const interval = setInterval(() => {
      fetchLogs(currentWorkflowId).then((newLogs) => {
        // Update flow step based on log types
        const hasSearch = newLogs.some(log => log.type === 'search')
        const hasClip = newLogs.some(log => log.message.includes('clip') || log.message.includes('Clipping'))
        // FIX: type 'transcribe' (not valid), so detect by message instead
        const hasTranscribe =
          newLogs.some(
            log =>
              log.type === 'processing' &&
              (log.message.toLowerCase().includes('transcribe') ||
                log.message.toLowerCase().includes('transcription'))
          )
        const hasUpload = newLogs.some(log => log.type === 'upload')
        // FIX: type 'complete' not in LogEntry, so just check for 'success'
        const hasComplete =
          newLogs.some(log => log.type === 'success' && (log.message.toLowerCase().includes('complete') || log.message.toLowerCase().includes('completed')))
        
        let step = -1
        if (hasComplete) step = 4
        else if (hasUpload) step = 3
        else if (hasTranscribe) step = 2
        else if (hasClip) step = 1
        else if (hasSearch) step = 0
        
        setFlowStep(step)
        
        // Check if workflow is complete
        if (hasComplete || newLogs.some(log => log.type === 'error' && log.message.toLowerCase().includes('completed'))) {
          setIsFlowRunning(false)
        }
      })
    }, 2000)
    
    return () => clearInterval(interval)
  }, [currentWorkflowId, isFlowRunning, backendUrl])

  // Clear logs on mount and only fetch when workflow is running
  useEffect(() => {
    // Start with empty logs - clear backend logs on mount
    setLogs([])
    axios.get(`${backendUrl}/api/logs?clear=true`).catch(() => {}) // Clear backend logs silently
    
    // Only fetch logs if a workflow is running
    const interval = setInterval(() => {
      if (isFlowRunning && currentWorkflowId) {
        fetchLogs(currentWorkflowId)
      }
    }, 2000) // Poll every 2 seconds when running
    return () => clearInterval(interval)
  }, [backendUrl, isFlowRunning, currentWorkflowId])

  const triggerFlowNow = async () => {
    setIsProcessing(true)
    setIsFlowRunning(true)
    setFlowStep(0)

    try {
      if (videoUrl) {
        const response = await axios.post(`${backendUrl}/api/process-video`, { videoUrl })
        const workflowId = response.data.workflowId
        if (workflowId) {
          setCurrentWorkflowId(workflowId)
        }
      } else if (channelId) {
        const response = await axios.post(`${backendUrl}/api/process-channel`, { channelId })
        const workflowId = response.data.workflowId
        if (workflowId) {
          setCurrentWorkflowId(workflowId)
        }
      } else {
        setIsFlowRunning(false)
        setFlowStep(-1)
        alert('⚠️ Please enter a video URL or channel ID')
        return
      }
      
      // Refresh stats after processing starts
      setTimeout(async () => {
        try {
          const response = await axios.get(`${backendUrl}/api/stats`)
          setStats(response.data)
        } catch (e) {
          console.error('Error refreshing stats:', e)
        }
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setIsFlowRunning(false)
      setFlowStep(-1)
      alert(`❌ Error: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const process5ClipsAndUpload = async () => {
    if (!clipVideoUrl) {
      alert('❌ Please enter a YouTube video URL')
      return
    }

    setIsProcessingClips(true)
    setIsFlowRunning(true)
    setFlowStep(0)

    try {
      // Extract video ID from URL
      const videoIdMatch = clipVideoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      const videoId = videoIdMatch ? videoIdMatch[1] : null
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL')
      }

      // Call 5-clip processing API
      const response = await axios.post(
        `${backendUrl}/api/process-5-clips`,
        {
          videoUrl: clipVideoUrl,
          uploadToYouTube: uploadEnabled,
          watermarkPath: 'logo.png'
        },
        {
          timeout: 300000 // 5 minutes
        }
      )

      const workflowId = response.data.workflowId
      if (workflowId) {
        setCurrentWorkflowId(workflowId)
      }
      
      // Refresh stats and library periodically
      const refreshInterval = setInterval(async () => {
        try {
          const [statsRes, libRes] = await Promise.all([
            axios.get(`${backendUrl}/api/stats`),
            axios.get(`${backendUrl}/api/content-library`)
          ])
          setStats(statsRes.data)
          setContentLibrary(libRes.data)
        } catch (e) {
          console.error('Error refreshing data:', e)
        }
      }, 10000)
      
      // Clear interval after 5 minutes
      setTimeout(() => clearInterval(refreshInterval), 300000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setIsFlowRunning(false)
      setFlowStep(-1)
      alert(`❌ Error: ${errorMessage}`)
    } finally {
      setIsProcessingClips(false)
    }
  }

  const saveSettings = async () => {
    try {
      const settings = {
        active: automationActive,
        postingInterval: parseInt(postingInterval),
        batchSize: parseInt(batchSize),
        platformPriority
      }
      
      // Save to localStorage
      localStorage.setItem('automationSettings', JSON.stringify(settings))
      
      // Save to backend
      await axios.post(`${backendUrl}/api/automation-settings`, settings)
      
      alert('✅ Settings saved successfully')
    } catch (error) {
      alert(`❌ Error saving settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const deleteVideo = async (videoId: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return
    
    // In a real app, this would call an API to delete
    setContentLibrary(prev => prev.filter(v => v.id !== videoId))
  }

  const StatCard = ({ icon: Icon, title, value, subtitle }: { icon: React.ElementType, title: string, value: string | number, subtitle: string }) => (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-blue-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {isLoadingStats && title === 'Total Videos Found' ? '...' : value}
          </h3>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <Icon className="text-blue-600" size={24} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Video className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">GrooveSzn AutoPoster</h1>
                <p className="text-sm text-gray-500">Automated Content Distribution</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${automationActive ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className={`w-2 h-2 rounded-full ${automationActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${automationActive ? 'text-green-700' : 'text-red-700'}`}>
                  {automationActive ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'settings', label: 'Automation Settings', icon: Settings },
              { id: 'library', label: 'Content Library', icon: Video },
              { id: 'monitor', label: 'Flow Monitor', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Automation Overview</h2>
              <button
                onClick={triggerFlowNow}
                disabled={isProcessing}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={20} className={isProcessing ? 'animate-spin' : ''} />
                <span className="font-medium">{isProcessing ? 'Processing...' : 'Trigger Flow Now'}</span>
              </button>
            </div>

            {/* Quick Video Input */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Process</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Video URL</label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Or Channel ID</label>
                  <input
                    type="text"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="UCbo-KbSjJDG6JWQ_MTZ_rNA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Process 5 Clips & Upload */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 shadow-md border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">🎬 Process 5 Clips & Upload</h3>
                  <p className="text-sm text-gray-600">Create 5 shorts from a YouTube video with 9:16 layout + logo</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube Video URL
                  </label>
                  <input
                    type="text"
                    value={clipVideoUrl}
                    onChange={(e) => setClipVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/oBXSvS2QKxU"
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the YouTube video URL to process into 5 clips</p>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadEnabled}
                      onChange={(e) => setUploadEnabled(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Upload to YouTube Shorts</span>
                  </label>
                </div>
                <button
                  onClick={process5ClipsAndUpload}
                  disabled={isProcessingClips || !clipVideoUrl}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base flex items-center justify-center space-x-3"
                >
                  {isProcessingClips ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Processing 5 Clips...</span>
                    </>
                  ) : (
                    <>
                      <Video size={20} />
                      <span>Process 5 Clips {uploadEnabled ? '& Upload to YouTube' : ''}</span>
                    </>
                  )}
                </button>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>What happens:</strong> Creates 5 clips (30s each), processes with 9:16 vertical format, 
                    adds title box + logo watermark, {uploadEnabled ? 'and uploads all to your YouTube channel' : '(upload disabled)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Video}
                title="Total Videos Found"
                value={stats.videosFound}
                subtitle="All time"
              />
              <StatCard
                icon={TrendingUp}
                title="Posted Today"
                value={stats.postedToday}
                subtitle={`${stats.postedToday * 3} total views`}
              />
              <StatCard
                icon={Clock}
                title="Pending Queue"
                value={stats.pendingQueue}
                subtitle="Ready to post"
              />
              <StatCard
                icon={automationActive ? CheckCircle : AlertCircle}
                title="Automation Status"
                value={stats.automationStatus}
                subtitle={automationActive ? 'Running smoothly' : 'Manually paused'}
              />
            </div>

            {/* Flow Animation - Only show when workflow is running */}
            {(isFlowRunning || flowStep >= 0) && (
              <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Current Flow Progress</h3>
                <div className="flex items-center justify-between mb-4">
                  {flowSteps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                            idx <= flowStep && flowStep >= 0 ? step.color : 'bg-gray-200'
                          } ${idx === flowStep && isFlowRunning ? 'scale-110 shadow-lg animate-pulse' : ''}`}
                        >
                          {step.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-600 mt-2">{step.label}</span>
                      </div>
                      {idx < flowSteps.length - 1 && (
                        <div className="flex-1 h-1 mx-2 bg-gray-200 rounded relative overflow-hidden">
                          <div
                            className={`absolute inset-0 bg-blue-500 transition-all duration-500 ${
                              idx < flowStep && flowStep >= 0 ? 'w-full' : 'w-0'
                            }`}
                          ></div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Live Logs */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Live Activity Log</h3>
                <button
                  onClick={async () => {
                    try {
                      await axios.get(`${backendUrl}/api/logs?clear=true`)
                      setLogs([])
                    } catch (error) {
                      console.error('Error clearing logs:', error)
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear Logs
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No activity yet. Start a workflow to see logs.</p>
                ) : (
                  logs.map(log => (
                    <div
                      key={log.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {log.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
                        {log.type === 'processing' && <RefreshCw className="text-blue-500 animate-spin" size={20} />}
                        {log.type === 'search' && <TrendingUp className="text-purple-500" size={20} />}
                        {log.type === 'upload' && <Upload className="text-orange-500" size={20} />}
                        {log.type === 'trigger' && <Play className="text-blue-600" size={20} />}
                        {log.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{log.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{log.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Automation Control Center</h2>
            
            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Auto Trigger</h3>
                  <p className="text-sm text-gray-500">Enable or disable automated posting</p>
                </div>
                <button
                  onClick={() => {
                    setAutomationActive(!automationActive)
                    addLog(`Automation ${!automationActive ? 'enabled' : 'disabled'}`, 'processing')
                  }}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    automationActive ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      automationActive ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posting Interval
                  </label>
                  <select
                    value={postingInterval}
                    onChange={(e) => setPostingInterval(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Every 1 hour</option>
                    <option value="3">Every 3 hours</option>
                    <option value="6">Every 6 hours</option>
                    <option value="12">Every 12 hours</option>
                    <option value="24">Every 24 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Size
                  </label>
                  <input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Priority
                  </label>
                  <select
                    value={platformPriority}
                    onChange={(e) => setPlatformPriority(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="tiktok">TikTok Only</option>
                    <option value="youtube">YouTube Only</option>
                    <option value="both">Both Platforms</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Next Run In</span>
                  <span className="text-2xl font-bold text-blue-600">{formatTime(nextRunTime)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((parseInt(postingInterval) * 3600 - nextRunTime) / (parseInt(postingInterval) * 3600)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button 
                onClick={saveSettings}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Settings size={20} />
                <span>💾 Save Settings</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Content Library</h2>
              <button 
                onClick={() => {
                  const fetchLibrary = async () => {
                    try {
                      const response = await axios.get(`${backendUrl}/api/content-library`)
                      setContentLibrary(response.data)
                      addLog('📚 Content library refreshed', 'success')
                    } catch (error) {
                      addLog('❌ Error refreshing library', 'error')
                    }
                  }
                  fetchLibrary()
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={20} />
                <span>Refresh</span>
              </button>
            </div>

            {contentLibrary.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-md border border-blue-100 text-center">
                <Video className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No content found. Process some videos to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentLibrary.map(video => (
                  <div key={video.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-blue-100">
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-48 flex items-center justify-center text-6xl">
                      {video.thumbnail}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{video.title}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            video.status === 'Uploaded'
                              ? 'bg-green-100 text-green-700'
                              : video.status === 'Error'
                              ? 'bg-red-100 text-red-700'
                              : video.status === 'Processing'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {video.status}
                        </span>
                        <span className="text-xs text-gray-500">{video.platform}</span>
                      </div>
                      <div className="flex space-x-2">
                        {video.link && (
                          <a
                            href={video.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-center"
                          >
                            <Play size={16} className="inline mr-1" />
                            View
                          </a>
                        )}
                        <button 
                          onClick={() => deleteVideo(video.id)}
                          className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Flow Monitor</h2>
            
            <div className="bg-white rounded-xl p-8 shadow-md border border-blue-100">
              <div className="space-y-8">
                {flowSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${step.color} ${idx === flowStep && flowStep >= 0 ? 'scale-110 shadow-lg animate-pulse' : ''} transition-all`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{step.label}</h3>
                      <p className="text-sm text-gray-500">
                        {flowStep === idx && isFlowRunning ? 'In progress...' : idx <= flowStep && flowStep >= 0 ? 'Completed' : 'Waiting...'}
                      </p>
                    </div>
                    {idx === flowStep && flowStep >= 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                        <span className="text-sm font-medium text-blue-600">In Progress</span>
                      </div>
                    )}
                    {idx < flowStep && flowStep >= 0 && (
                      <CheckCircle className="text-green-500" size={24} />
                    )}
                  </div>
                ))}
              </div>
              {flowStep < 0 && !isFlowRunning && (
                <p className="text-center text-gray-500 text-sm mt-8">No active workflow. Start a workflow to see progress.</p>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Real-Time Notifications</h3>
                <button
                  onClick={async () => {
                    try {
                      await axios.get(`${backendUrl}/api/logs?clear=true`)
                      setLogs([])
                    } catch (error) {
                      console.error('Error clearing logs:', error)
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No notifications yet.</p>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <span className="font-medium">{log.time}</span> - {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default GrooveSznDashboard
