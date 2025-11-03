'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, RefreshCw, Settings, Video, Clock, TrendingUp, CheckCircle, AlertCircle, Trash2, Edit, Upload } from 'lucide-react'
import axios from 'axios'

const GrooveSznDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [automationActive, setAutomationActive] = useState(true)
  const [logs, setLogs] = useState([
    { id: 1, message: '🔍 Searching YouTube for viral videos...', time: '2:45 PM', type: 'search' },
    { id: 2, message: '🎬 5 viral videos found', time: '2:46 PM', type: 'success' },
    { id: 3, message: '✂️ Clipping videos...', time: '2:47 PM', type: 'processing' },
    { id: 4, message: '📝 Transcribing content...', time: '2:48 PM', type: 'processing' },
    { id: 5, message: '📤 Uploading to TikTok & YouTube...', time: '2:49 PM', type: 'upload' },
    { id: 6, message: '✅ Done. 5 videos posted successfully.', time: '2:50 PM', type: 'success' }
  ])
  const [postingInterval, setPostingInterval] = useState('1')
  const [batchSize, setBatchSize] = useState('5')
  const [platformPriority, setPlatformPriority] = useState('both')
  const [nextRunTime, setNextRunTime] = useState(3600)
  const [flowStep, setFlowStep] = useState(0)
  
  // Video processing state
  const [videoUrl, setVideoUrl] = useState('')
  const [channelId, setChannelId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const stats = {
    videosFound: 127,
    postedToday: 15,
    pendingQueue: 8,
    automationStatus: automationActive ? 'Active' : 'Paused'
  }

  const contentLibrary = [
    { id: 1, title: 'Top 10 Gaming Moments 2024', status: 'Uploaded', platform: 'Both', thumbnail: '🎮' },
    { id: 2, title: 'Viral Dance Challenge Compilation', status: 'Clipped', platform: 'TikTok', thumbnail: '💃' },
    { id: 3, title: 'Tech Tips & Tricks', status: 'Found', platform: 'YouTube', thumbnail: '💻' },
    { id: 4, title: 'Funny Pet Reactions', status: 'Uploaded', platform: 'Both', thumbnail: '🐕' },
    { id: 5, title: 'Cooking Hacks You Need', status: 'Processing', platform: 'TikTok', thumbnail: '🍳' },
    { id: 6, title: 'Fashion Trends 2024', status: 'Error', platform: 'Both', thumbnail: '👗' }
  ]

  const flowSteps = [
    { icon: '🔍', label: 'Search', color: 'bg-blue-500' },
    { icon: '✂️', label: 'Clip', color: 'bg-purple-500' },
    { icon: '📝', label: 'Transcribe', color: 'bg-green-500' },
    { icon: '📤', label: 'Post', color: 'bg-orange-500' },
    { icon: '✅', label: 'Complete', color: 'bg-teal-500' }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setNextRunTime(prev => (prev > 0 ? prev - 1 : 3600))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const flowTimer = setInterval(() => {
      setFlowStep(prev => (prev + 1) % 5)
    }, 2000)
    return () => clearInterval(flowTimer)
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs}h ${mins}m ${secs}s`
  }

  const triggerFlowNow = async () => {
    setIsProcessing(true)
    const newLog = {
      id: logs.length + 1,
      message: '🚀 Manual trigger initiated...',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'trigger'
    }
    setLogs([newLog, ...logs])

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://groove-poster-backend.vercel.app'
      
      if (videoUrl) {
        await axios.post(`${backendUrl}/api/process-video`, { videoUrl })
        const successLog = {
          id: logs.length + 2,
          message: `✅ Processing video: ${videoUrl}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'success'
        }
        setLogs([successLog, ...logs])
      } else if (channelId) {
        await axios.post(`${backendUrl}/api/process-channel`, { channelId })
        const successLog = {
          id: logs.length + 2,
          message: `✅ Processing channel: ${channelId}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'success'
        }
        setLogs([successLog, ...logs])
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const errorLog = {
        id: logs.length + 2,
        message: `❌ Error: ${errorMessage}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'error'
      }
      setLogs([errorLog, ...logs])
    } finally {
      setIsProcessing(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle }: { icon: React.ElementType, title: string, value: string | number, subtitle: string }) => (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-blue-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
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

            {/* Flow Animation */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Current Flow Progress</h3>
              <div className="flex items-center justify-between mb-4">
                {flowSteps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                          idx <= flowStep ? step.color : 'bg-gray-200'
                        } ${idx === flowStep ? 'scale-110 shadow-lg' : ''}`}
                      >
                        {step.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-600 mt-2">{step.label}</span>
                    </div>
                    {idx < flowSteps.length - 1 && (
                      <div className="flex-1 h-1 mx-2 bg-gray-200 rounded relative overflow-hidden">
                        <div
                          className={`absolute inset-0 bg-blue-500 transition-all duration-500 ${
                            idx < flowStep ? 'w-full' : 'w-0'
                          }`}
                        ></div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Live Logs */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Activity Log</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.map(log => (
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
                ))}
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
                  onClick={() => setAutomationActive(!automationActive)}
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
                    style={{ width: `${((3600 - nextRunTime) / 3600) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2">
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
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                <Upload size={20} />
                <span>Upload New Video</span>
              </button>
            </div>

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
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {video.status}
                      </span>
                      <span className="text-xs text-gray-500">{video.platform}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                        <Play size={16} className="inline mr-1" />
                        Play
                      </button>
                      <button className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Flow Monitor</h2>
            
            <div className="bg-white rounded-xl p-8 shadow-md border border-blue-100">
              <div className="space-y-8">
                {flowSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${step.color} ${idx === flowStep ? 'scale-110 shadow-lg' : ''} transition-all`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{step.label}</h3>
                      <p className="text-sm text-gray-500">
                        {idx === 0 && 'Searching YouTube for viral content...'}
                        {idx === 1 && 'Clipping 5 short highlights...'}
                        {idx === 2 && 'Transcribing and generating captions...'}
                        {idx === 3 && 'Uploading to TikTok and YouTube Shorts...'}
                        {idx === 4 && 'Posting completed successfully!'}
                      </p>
                    </div>
                    {idx === flowStep && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                        <span className="text-sm font-medium text-blue-600">In Progress</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Real-Time Notifications</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.slice().reverse().map(log => (
                  <div key={log.id} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <span className="font-medium">{log.time}</span> - {log.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default GrooveSznDashboard
