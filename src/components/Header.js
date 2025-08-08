'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code, 
  Settings, 
  HelpCircle, 
  Download, 
  Upload, 
  Share2,
  Moon,
  Sun,
  Menu,
  X,
  Plus,
  Save,
  FileText,
  Copy,
  Link,
  Palette,
  Zap,
  Monitor,
  Volume2,
  Bell
} from 'lucide-react'
import { useExecutionStore } from '../stores/executionStore'

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  
  const { code, setCode, executionSpeed, setExecutionSpeed } = useExecutionStore()

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleNewProject = () => {
    setShowNewProjectModal(true)
  }

  const createNewProject = (template) => {
    const templates = {
      blank: '// New JavaScript Project\nconsole.log("Hello, World!");',
      algorithm: `// Algorithm Template
function exampleAlgorithm(input) {
  // Your algorithm here
  console.log('Processing:', input);
  return input;
}

// Test the algorithm
const result = exampleAlgorithm('test data');
console.log('Result:', result);`,
      dataStructure: `// Data Structure Template
class DataStructure {
  constructor() {
    this.data = [];
  }
  
  add(item) {
    this.data.push(item);
    console.log('Added:', item);
  }
  
  remove() {
    const item = this.data.pop();
    console.log('Removed:', item);
    return item;
  }
  
  display() {
    console.log('Current data:', this.data);
  }
}

// Test the data structure
const ds = new DataStructure();
ds.add(1);
ds.add(2);
ds.display();
ds.remove();`,
      sorting: `// Sorting Algorithm Template
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = [];
  const right = [];
  
  for (let i = 0; i < arr.length; i++) {
    if (i === Math.floor(arr.length / 2)) continue;
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  
  console.log('Sorting:', arr, 'Pivot:', pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}

// Test the sorting
const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log('Original:', numbers);
console.log('Sorted:', quickSort([...numbers]));`
    }
    
    setCode(templates[template] || templates.blank)
    setShowNewProjectModal(false)
  }

  const handleExport = () => {
    setShowExportModal(true)
  }

  const exportCode = (format) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `code-visualization-${timestamp}`
    
    if (format === 'js') {
      const blob = new Blob([code], { type: 'text/javascript' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.js`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'json') {
      const projectData = {
        code,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        metadata: {
          language: 'javascript',
          framework: 'Code Visualization Sandbox'
        }
      }
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    setShowExportModal(false)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.js,.json,.txt'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target.result
            if (file.name.endsWith('.json')) {
              const projectData = JSON.parse(content)
              setCode(projectData.code || content)
            } else {
              setCode(content)
            }
          } catch (error) {
            console.error('Error importing file:', error)
            alert('Error importing file. Please check the file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const shareCode = (method) => {
    const encodedCode = btoa(encodeURIComponent(code))
    const shareUrl = `${window.location.origin}?code=${encodedCode}`
    
    if (method === 'link') {
      navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    } else if (method === 'copy') {
      navigator.clipboard.writeText(code)
      alert('Code copied to clipboard!')
    }
    
    setShowShareModal(false)
  }

  const menuItems = [
    { icon: Plus, label: 'New Project', action: handleNewProject },
    { icon: Upload, label: 'Import Code', action: handleImport },
    { icon: Download, label: 'Export Code', action: handleExport },
    { icon: Share2, label: 'Share', action: handleShare },
    { icon: Settings, label: 'Settings', action: () => setShowSettingsModal(true) },
    { icon: HelpCircle, label: 'Help', action: () => setShowHelpModal(true) },
  ]

  return (
    <>
      <header className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-primary-500 rounded-lg"
            >
              <Code className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
                Code Visualization Sandbox
              </h1>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                Interactive code execution and visualization
              </p>
            </div>
          </div>

          {/* Navigation and Controls */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {menuItems.slice(0, 4).map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={item.action}
                    className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                    title={item.label}
                  >
                    <Icon size={18} />
                  </motion.button>
                )
              })}
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              {showMenu ? <X size={18} /> : <Menu size={18} />}
            </motion.button>

            {/* Settings Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettingsModal(true)}
              className="hidden md:block p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={18} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-t border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800"
            >
              <div className="px-6 py-4 space-y-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ x: 5 }}
                      onClick={() => {
                        item.action()
                        setShowMenu(false)
                      }}
                      className="flex items-center space-x-3 w-full p-3 text-left text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors"
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowNewProjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
              <div className="space-y-3">
                {[
                  { key: 'blank', name: 'Blank Project', desc: 'Start with an empty canvas' },
                  { key: 'algorithm', name: 'Algorithm Template', desc: 'Basic algorithm structure' },
                  { key: 'dataStructure', name: 'Data Structure', desc: 'Class-based data structure' },
                  { key: 'sorting', name: 'Sorting Algorithm', desc: 'Quick sort implementation' }
                ].map((template) => (
                  <motion.button
                    key={template.key}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => createNewProject(template.key)}
                    className="w-full p-3 text-left border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="font-medium text-secondary-900">{template.name}</div>
                    <div className="text-sm text-secondary-600">{template.desc}</div>
                  </motion.button>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 text-secondary-600 hover:text-secondary-800"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              
              <div className="space-y-6">


                {/* Appearance Settings */}
                <div>
                  <h4 className="font-medium text-secondary-900 mb-3 flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Appearance
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-700">Dark Mode</span>
                      <button
                        onClick={toggleDarkMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isDarkMode ? 'bg-primary-500' : 'bg-secondary-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isDarkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h4 className="font-medium text-secondary-900 mb-3 flex items-center">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-700">Error Notifications</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Export Code</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => exportCode('js')}
                  className="w-full p-3 text-left border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="font-medium text-secondary-900">JavaScript File (.js)</div>
                  <div className="text-sm text-secondary-600">Export as a JavaScript file</div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => exportCode('json')}
                  className="w-full p-3 text-left border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="font-medium text-secondary-900">Project File (.json)</div>
                  <div className="text-sm text-secondary-600">Export with metadata</div>
                </motion.button>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-secondary-600 hover:text-secondary-800"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Share Code</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => shareCode('link')}
                  className="w-full p-3 text-left border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors flex items-center space-x-3"
                >
                  <Link className="w-5 h-5 text-primary-500" />
                  <div>
                    <div className="font-medium text-secondary-900">Share Link</div>
                    <div className="text-sm text-secondary-600">Copy shareable URL</div>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => shareCode('copy')}
                  className="w-full p-3 text-left border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors flex items-center space-x-3"
                >
                  <Copy className="w-5 h-5 text-primary-500" />
                  <div>
                    <div className="font-medium text-secondary-900">Copy Code</div>
                    <div className="text-sm text-secondary-600">Copy to clipboard</div>
                  </div>
                </motion.button>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-secondary-600 hover:text-secondary-800"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Help & Tutorials</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">Getting Started</h4>
                  <ul className="text-sm text-secondary-600 space-y-1 ml-4">
                    <li>• Write JavaScript code in the editor</li>
                    <li>• Click Execute to run your code</li>
                    <li>• Use Step Forward for line-by-line execution</li>
                    <li>• Monitor variables and memory in real-time</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">Keyboard Shortcuts</h4>
                  <div className="text-sm text-secondary-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Execute Code</span>
                      <code className="bg-secondary-100 px-2 py-1 rounded">Ctrl + Enter</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Step Forward</span>
                      <code className="bg-secondary-100 px-2 py-1 rounded">F10</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Reset</span>
                      <code className="bg-secondary-100 px-2 py-1 rounded">Ctrl + R</code>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">Features</h4>
                  <ul className="text-sm text-secondary-600 space-y-1 ml-4">
                    <li>• Real-time code execution visualization</li>
                    <li>• Memory usage tracking</li>
                    <li>• Call stack analysis</li>
                    <li>• Performance metrics</li>
                    <li>• Export and share functionality</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}