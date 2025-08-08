import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { executeJavaScript } from '../services/codeExecutor'
import { analyzeCode } from '../services/codeAnalyzer'

export const useExecutionStore = create(
  subscribeWithSelector((set, get) => ({
    // Code state
    code: `// Welcome to Code Visualization Sandbox
// Write your JavaScript code here and see it execute in real-time!

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// Test the functions
console.log('Fibonacci of 5:', fibonacci(5));
const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log('Sorted array:', bubbleSort([...numbers]));`,
    
    // Recent projects
    recentProjects: [],
    
    // Execution state
    isExecuting: false,
    isPaused: false,
    executionStep: 0,
    executionSpeed: 1000, // ms between steps
    
    // Code analysis
    ast: null,
    variables: {},
    callStack: [],
    memoryUsage: 0,
    performanceMetrics: {
      executionTime: 0,
      memoryPeak: 0,
      operationsCount: 0,
    },
    
    // Visualization data
    executionTrace: [],
    currentLine: null,
    highlightedNodes: [],
    
    // Console output
    consoleOutput: [],
    
    // Error handling
    errors: [],
    warnings: [],
    
    // Actions
    setCode: (newCode) => {
      const state = get()
      // Add to recent projects when code changes significantly
      if (newCode && newCode !== state.code && newCode.length > 50) {
        const projectName = newCode.split('\n')[0].replace(/\/\/\s*/, '') || 'Untitled Project'
        const newProject = {
          id: Date.now(),
          name: projectName.substring(0, 50),
          code: newCode,
          timestamp: new Date().toISOString(),
          preview: newCode.substring(0, 100) + (newCode.length > 100 ? '...' : '')
        }
        
        const updatedRecent = [newProject, ...state.recentProjects.filter(p => p.code !== newCode)].slice(0, 10)
        set({ code: newCode, recentProjects: updatedRecent })
      } else {
        set({ code: newCode })
      }
    },
    
    addRecentProject: (project) => {
      const state = get()
      const updatedRecent = [project, ...state.recentProjects.filter(p => p.id !== project.id)].slice(0, 10)
      set({ recentProjects: updatedRecent })
    },
    
    removeRecentProject: (projectId) => {
      const state = get()
      set({ recentProjects: state.recentProjects.filter(p => p.id !== projectId) })
    },
    
    clearRecentProjects: () => {
      set({ recentProjects: [] })
    },
    
    executeCode: async (code) => {
      const state = get()
      if (state.isExecuting) return
      
      set({ 
        isExecuting: true, 
        isPaused: false,
        executionStep: 0,
        variables: {},
        callStack: [],
        executionTrace: [],
        consoleOutput: [],
        errors: [],
        warnings: [],
        currentLine: null,
        highlightedNodes: []
      })
      
      try {
        // Analyze code structure
        const analysis = await analyzeCode(code)
        set({ ast: analysis.ast })
        
        // Execute code with instrumentation
        const execution = executeJavaScript(code, {
          onStep: (stepData) => {
            const currentState = get()
            set({
              executionStep: currentState.executionStep + 1,
              variables: { ...currentState.variables, ...stepData.variables },
              callStack: stepData.callStack,
              currentLine: stepData.line,
              memoryUsage: stepData.memoryUsage,
              executionTrace: [...currentState.executionTrace, stepData]
            })
          },
          onConsole: (output) => {
            const currentState = get()
            set({
              consoleOutput: [...currentState.consoleOutput, {
                id: Date.now(),
                type: output.type,
                message: output.message,
                timestamp: new Date().toISOString()
              }]
            })
          },
          onError: (error) => {
            const currentState = get()
            set({
              errors: [...currentState.errors, {
                id: Date.now(),
                message: error.message,
                line: error.line,
                column: error.column,
                timestamp: new Date().toISOString()
              }],
              isExecuting: false
            })
          },
          speed: state.executionSpeed
        })
        
        // Wait for execution to complete
        await execution
        
        set({ isExecuting: false })
        
      } catch (error) {
        set({ 
          isExecuting: false,
          errors: [{
            id: Date.now(),
            message: error.message,
            timestamp: new Date().toISOString()
          }]
        })
      }
    },
    
    pauseExecution: () => {
      set({ isPaused: true })
    },
    
    resumeExecution: () => {
      set({ isPaused: false })
    },
    
    resetExecution: () => {
      set({
        isExecuting: false,
        isPaused: false,
        executionStep: 0,
        variables: {},
        callStack: [],
        memoryUsage: 0,
        executionTrace: [],
        currentLine: null,
        highlightedNodes: [],
        consoleOutput: [],
        errors: [],
        warnings: [],
        performanceMetrics: {
          executionTime: 0,
          memoryPeak: 0,
          operationsCount: 0,
        }
      })
    },
    
    stepForward: () => {
      const state = get()
      if (!state.isExecuting) return
      
      // Trigger next step in execution
      set({ executionStep: state.executionStep + 1 })
    },
    
    stepBackward: () => {
      const state = get()
      if (state.executionStep <= 0) return
      
      // Restore previous state
      const previousTrace = state.executionTrace[state.executionStep - 2]
      if (previousTrace) {
        set({
          executionStep: state.executionStep - 1,
          variables: previousTrace.variables,
          callStack: previousTrace.callStack,
          currentLine: previousTrace.line,
          memoryUsage: previousTrace.memoryUsage
        })
      }
    },
    
    setExecutionSpeed: (speed) => {
      set({ executionSpeed: speed })
    },
    
    highlightNode: (nodeId) => {
      const state = get()
      set({ 
        highlightedNodes: [...state.highlightedNodes, nodeId]
      })
    },
    
    clearHighlights: () => {
      set({ highlightedNodes: [] })
    },
    
    addVariable: (name, value, type = 'unknown') => {
      const state = get()
      set({
        variables: {
          ...state.variables,
          [name]: { value, type, timestamp: Date.now() }
        }
      })
    },
    
    updatePerformanceMetrics: (metrics) => {
      const state = get()
      set({
        performanceMetrics: {
          ...state.performanceMetrics,
          ...metrics
        }
      })
    }
  }))
)