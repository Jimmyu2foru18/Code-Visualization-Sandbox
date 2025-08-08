'use client'

import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { motion } from 'framer-motion'
import { 
  Copy, 
  Download, 
  RotateCcw, 
  Type, 
  Maximize2, 
  Minimize2,
  Search,
  Settings
} from 'lucide-react'
import { useExecutionStore } from '../stores/executionStore'

export default function CodeEditor({ 
  value, 
  onChange, 
  language = 'javascript', 
  theme = 'vs-dark',
  readOnly = false 
}) {
  const editorRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [showSettings, setShowSettings] = useState(false)
  const [wordWrap, setWordWrap] = useState('off')
  const [minimap, setMinimap] = useState(true)
  
  const { currentLine, highlightedNodes, executionStep } = useExecutionStore()

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
    
    // Configure editor
    editor.updateOptions({
      fontSize,
      wordWrap,
      minimap: { enabled: minimap },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      folding: true,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: true
    })

    // Add custom themes
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' }
      ],
      colors: {
        'editor.background': '#1e293b',
        'editor.foreground': '#e2e8f0',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#3b82f6',
        'editor.selectionBackground': '#3b82f640',
        'editor.lineHighlightBackground': '#334155',
        'editorCursor.foreground': '#3b82f6'
      }
    })

    // Set custom theme
    monaco.editor.setTheme('custom-dark')

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      console.log('Save triggered')
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
      console.log('Run triggered')
    })
  }

  // Highlight current execution line
  useEffect(() => {
    if (editorRef.current && currentLine) {
      const editor = editorRef.current
      const model = editor.getModel()
      
      if (model) {
        // Clear previous decorations
        const oldDecorations = model.getAllDecorations()
          .filter(d => d.options.className === 'execution-line')
          .map(d => d.id)
        
        // Add new decoration
        const newDecorations = [{
          range: new monaco.Range(currentLine, 1, currentLine, 1),
          options: {
            isWholeLine: true,
            className: 'execution-line',
            glyphMarginClassName: 'execution-glyph',
            linesDecorationsClassName: 'execution-line-decoration'
          }
        }]
        
        model.deltaDecorations(oldDecorations, newDecorations)
        
        // Scroll to line
        editor.revealLineInCenter(currentLine)
      }
    }
  }, [currentLine])

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
  }

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'code.js'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run()
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const adjustFontSize = (delta) => {
    const newSize = Math.max(10, Math.min(24, fontSize + delta))
    setFontSize(newSize)
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize })
    }
  }

  const toggleWordWrap = () => {
    const newWrap = wordWrap === 'off' ? 'on' : 'off'
    setWordWrap(newWrap)
    if (editorRef.current) {
      editorRef.current.updateOptions({ wordWrap: newWrap })
    }
  }

  const toggleMinimap = () => {
    setMinimap(!minimap)
    if (editorRef.current) {
      editorRef.current.updateOptions({ minimap: { enabled: !minimap } })
    }
  }

  return (
    <div className={`flex flex-col h-full bg-secondary-800 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary-900 border-b border-secondary-700">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-secondary-400">
            <span>JavaScript</span>
            <span>•</span>
            <span>Line {currentLine || 1}</span>
            <span>•</span>
            <span>Step {executionStep}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Font Size Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => adjustFontSize(-1)}
              className="p-1 text-secondary-400 hover:text-secondary-200 rounded"
              title="Decrease font size"
            >
              <Type size={14} />
            </button>
            <span className="text-xs text-secondary-400 w-6 text-center">{fontSize}</span>
            <button
              onClick={() => adjustFontSize(1)}
              className="p-1 text-secondary-400 hover:text-secondary-200 rounded"
              title="Increase font size"
            >
              <Type size={16} />
            </button>
          </div>
          
          {/* Action Buttons */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="p-2 text-secondary-400 hover:text-secondary-200 hover:bg-secondary-700 rounded transition-colors"
            title="Copy code"
          >
            <Copy size={16} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="p-2 text-secondary-400 hover:text-secondary-200 hover:bg-secondary-700 rounded transition-colors"
            title="Download code"
          >
            <Download size={16} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFormat}
            className="p-2 text-secondary-400 hover:text-secondary-200 hover:bg-secondary-700 rounded transition-colors"
            title="Format code"
          >
            <RotateCcw size={16} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-secondary-400 hover:text-secondary-200 hover:bg-secondary-700 rounded transition-colors"
            title="Editor settings"
          >
            <Settings size={16} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="p-2 text-secondary-400 hover:text-secondary-200 hover:bg-secondary-700 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </motion.button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary-800 border-b border-secondary-700 p-4"
        >
          <div className="flex items-center space-x-6 text-sm">
            <label className="flex items-center space-x-2 text-secondary-300">
              <input
                type="checkbox"
                checked={wordWrap === 'on'}
                onChange={toggleWordWrap}
                className="rounded"
              />
              <span>Word Wrap</span>
            </label>
            
            <label className="flex items-center space-x-2 text-secondary-300">
              <input
                type="checkbox"
                checked={minimap}
                onChange={toggleMinimap}
                className="rounded"
              />
              <span>Minimap</span>
            </label>
          </div>
        </motion.div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        <Editor
          value={value}
          onChange={onChange}
          language={language}
          theme="custom-dark"
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize,
            wordWrap,
            minimap: { enabled: minimap },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            folding: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
        />
        
        {/* Execution indicator overlay */}
        {currentLine && (
          <div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            Executing line {currentLine}
          </div>
        )}
      </div>

      <style jsx global>{`
        .execution-line {
          background-color: rgba(59, 130, 246, 0.2) !important;
        }
        
        .execution-glyph {
          background-color: #3b82f6 !important;
          width: 4px !important;
        }
        
        .execution-line-decoration {
          background-color: #3b82f6 !important;
          width: 4px !important;
        }
      `}</style>
    </div>
  )
}