'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  BookOpen, 
  Cpu, 
  MemoryStick,
  StepForward,
  SkipForward,
  Square,
  Gauge,
  Activity,
  Zap,
  Timer,
  BarChart3
} from 'lucide-react'
import { useExecutionStore } from '../stores/executionStore'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import StatusBar from '../components/StatusBar'

// Dynamic imports to avoid SSR issues
const CodeEditor = dynamic(() => import('../components/CodeEditor'), { ssr: false })
const VisualizationPanel = dynamic(() => import('../components/VisualizationPanel'), { ssr: false })
const MemoryVisualization = dynamic(() => import('../components/MemoryVisualization'), { ssr: false })
const CallStackVisualization = dynamic(() => import('../components/CallStackVisualization'), { ssr: false })
const PerformanceMetrics = dynamic(() => import('../components/PerformanceMetrics'), { ssr: false })

export default function Home() {
  const [activeTab, setActiveTab] = useState('visualization')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [executionMode, setExecutionMode] = useState('normal') // normal, step, fast
  
  const { 
    code,
    setCode,
    isExecuting, 
    isPaused,
    executionStep, 
    variables, 
    callStack, 
    memoryUsage,
    executionSpeed,
    setExecutionSpeed,
    executeCode, 
    pauseExecution, 
    resetExecution,
    stepForward,
    performanceMetrics
  } = useExecutionStore()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        handleExecute()
      } else if (e.key === 'F10') {
        e.preventDefault()
        if (isExecuting) stepForward()
      } else if (e.ctrlKey && e.key === 'r') {
        e.preventDefault()
        resetExecution()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExecuting])

  const handleExecute = () => {
    if (isExecuting) {
      pauseExecution()
    } else {
      executeCode(code)
    }
  }

  const handleSpeedChange = (speed) => {
    setExecutionSpeed(speed)
  }

  const tabs = [
    { id: 'visualization', label: 'Execution Flow', icon: Activity, color: 'text-blue-500' },
    { id: 'memory', label: 'Memory', icon: MemoryStick, color: 'text-green-500' },
    { id: 'callstack', label: 'Call Stack', icon: Cpu, color: 'text-purple-500' },
    { id: 'performance', label: 'Performance', icon: BarChart3, color: 'text-orange-500' },
  ]

  const speedOptions = [
    { value: 3000, label: 'Slow', icon: '🐌' },
    { value: 1000, label: 'Normal', icon: '🚶' },
    { value: 500, label: 'Fast', icon: '🏃' },
    { value: 100, label: 'Turbo', icon: '🚀' }
  ]

  return (
    <div className="flex flex-col h-screen bg-secondary-50 dark:bg-secondary-900">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Toolbar */}
          <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Execution Controls */}
              <div className="flex items-center space-x-3">
                {/* Main Execute/Pause Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExecute}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isExecuting 
                      ? 'bg-warning text-white hover:bg-yellow-600' 
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  {isExecuting ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isExecuting ? (isPaused ? 'Resume' : 'Pause') : 'Execute'}</span>
                </motion.button>
                
                {/* Reset Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetExecution}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-secondary-200 text-secondary-700 hover:bg-secondary-300 transition-colors"
                  title="Reset (Ctrl+R)"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </motion.button>
                
                {/* Step Controls */}
                <div className="flex items-center space-x-1 border-l border-secondary-200 pl-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stepForward}
                    disabled={!isExecuting}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium bg-success text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Step Forward (F10)"
                  >
                    <StepForward size={16} />
                    <span className="hidden sm:inline">Step</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!isExecuting}
                    className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Skip to Next Breakpoint"
                  >
                    <SkipForward size={16} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!isExecuting}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Stop Execution"
                  >
                    <Square size={16} />
                  </motion.button>
                </div>
                
                {/* Speed Control */}
                <div className="flex items-center space-x-2 border-l border-secondary-200 pl-3">
                  <Timer size={16} className="text-secondary-500" />
                  <select
                    value={executionSpeed}
                    onChange={(e) => handleSpeedChange(Number(e.target.value))}
                    className="text-sm border border-secondary-200 rounded px-2 py-1 bg-white"
                  >
                    {speedOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-secondary-600">
                <span>Step: {executionStep}</span>
                <span>Variables: {Object.keys(variables).length}</span>
                <span>Memory: {memoryUsage}KB</span>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className="w-1/2 border-r border-secondary-200">
              <CodeEditor 
                value={code}
                onChange={setCode}
                language="javascript"
                theme="vs-dark"
              />
            </div>
            
            {/* Visualization Panel */}
            <div className="w-1/2 flex flex-col">
              {/* Tabs */}
              <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
                <div className="flex">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-primary-500 text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                            : 'border-transparent text-secondary-600 hover:text-secondary-800 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:bg-secondary-700'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'visualization' && <VisualizationPanel />}
                {activeTab === 'memory' && <MemoryVisualization />}
                {activeTab === 'callstack' && <CallStackVisualization />}
                {activeTab === 'performance' && <PerformanceMetrics />}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <StatusBar />
    </div>
  )
}