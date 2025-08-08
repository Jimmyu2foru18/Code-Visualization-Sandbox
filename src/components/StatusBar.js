'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  Cpu, 
  MemoryStick,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  X
} from 'lucide-react'
import { useExecutionStore } from '../stores/executionStore'

export default function StatusBar() {
  const [currentTime, setCurrentTime] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [isOnline, setIsOnline] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  const { 
    isExecuting, 
    executionStep, 
    variables, 
    callStack, 
    memoryUsage,
    errors,
    warnings,
    consoleOutput
  } = useExecutionStore()

  // Handle mounting and time updates
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Handle new errors and warnings
  useEffect(() => {
    if (errors.length > 0) {
      const latestError = errors[errors.length - 1]
      addNotification({
        id: `error-${latestError.id}`,
        type: 'error',
        message: latestError.message,
        timestamp: latestError.timestamp
      })
    }
  }, [errors])

  useEffect(() => {
    if (warnings.length > 0) {
      const latestWarning = warnings[warnings.length - 1]
      addNotification({
        id: `warning-${latestWarning.id}`,
        type: 'warning',
        message: latestWarning.message,
        timestamp: latestWarning.timestamp
      })
    }
  }, [warnings])

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id)
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getStatusColor = () => {
    if (errors.length > 0) return 'text-red-500'
    if (warnings.length > 0) return 'text-yellow-500'
    if (isExecuting) return 'text-blue-500'
    return 'text-green-500'
  }

  const getStatusText = () => {
    if (errors.length > 0) return 'Error'
    if (warnings.length > 0) return 'Warning'
    if (isExecuting) return 'Executing'
    return 'Ready'
  }

  const getStatusIcon = () => {
    if (errors.length > 0) return AlertCircle
    if (warnings.length > 0) return AlertCircle
    if (isExecuting) return Activity
    return CheckCircle
  }

  const formatTime = (date) => {
    if (!date || !mounted) return '--:--:--'
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatMemory = (bytes) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const StatusIcon = getStatusIcon()

  return (
    <>
      {/* Notifications */}
      <div className="fixed bottom-20 right-4 z-50 space-y-2">
        {notifications.map((notification) => {
          const Icon = notification.type === 'error' ? AlertCircle : 
                     notification.type === 'warning' ? AlertCircle : Info
          const bgColor = notification.type === 'error' ? 'bg-red-500' :
                         notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
          
          return (
            <motion.div
              key={notification.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className={`${bgColor} text-white p-3 rounded-lg shadow-lg max-w-sm flex items-start space-x-3`}
            >
              <Icon size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {notification.message}
                </p>
                <p className="text-xs opacity-75">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-white hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Status Bar */}
      <div className="bg-secondary-800 text-secondary-200 px-4 py-2 flex items-center justify-between text-sm border-t border-secondary-700">
        {/* Left Section - Status */}
        <div className="flex items-center space-x-6">
          {/* Execution Status */}
          <div className="flex items-center space-x-2">
            <StatusIcon size={16} className={getStatusColor()} />
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            {isExecuting && (
              <div className="flex items-center space-x-1">
                <span className="text-secondary-400">Step:</span>
                <span className="text-secondary-200 font-mono">{executionStep}</span>
              </div>
            )}
          </div>

          {/* Error/Warning Count */}
          {(errors.length > 0 || warnings.length > 0) && (
            <div className="flex items-center space-x-3">
              {errors.length > 0 && (
                <div className="flex items-center space-x-1 text-red-400">
                  <AlertCircle size={14} />
                  <span>{errors.length} error{errors.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              {warnings.length > 0 && (
                <div className="flex items-center space-x-1 text-yellow-400">
                  <AlertCircle size={14} />
                  <span>{warnings.length} warning{warnings.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Console Output Count */}
          {consoleOutput.length > 0 && (
            <div className="flex items-center space-x-1 text-secondary-400">
              <Info size={14} />
              <span>{consoleOutput.length} output{consoleOutput.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Center Section - Performance Metrics */}
        <div className="flex items-center space-x-6">
          {/* Variables Count */}
          <div className="flex items-center space-x-1">
            <span className="text-secondary-400">Variables:</span>
            <span className="text-secondary-200 font-mono">{Object.keys(variables).length}</span>
          </div>

          {/* Call Stack Depth */}
          <div className="flex items-center space-x-1">
            <Cpu size={14} className="text-secondary-400" />
            <span className="text-secondary-400">Stack:</span>
            <span className="text-secondary-200 font-mono">{callStack.length}</span>
          </div>

          {/* Memory Usage */}
          <div className="flex items-center space-x-1">
            <MemoryStick size={14} className="text-secondary-400" />
            <span className="text-secondary-400">Memory:</span>
            <span className="text-secondary-200 font-mono">{formatMemory(memoryUsage)}</span>
          </div>
        </div>

        {/* Right Section - System Info */}
        <div className="flex items-center space-x-6">
          {/* Connection Status */}
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <>
                <Wifi size={14} className="text-green-400" />
                <span className="text-secondary-400">Online</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-red-400" />
                <span className="text-red-400">Offline</span>
              </>
            )}
          </div>

          {/* Current Time */}
          <div className="flex items-center space-x-1">
            <Clock size={14} className="text-secondary-400" />
            <span className="text-secondary-200 font-mono">{formatTime(currentTime)}</span>
          </div>

          {/* Version Info */}
          <div className="text-secondary-400">
            v1.0.0
          </div>
        </div>
      </div>
    </>
  )
}