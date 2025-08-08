'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw,
  Zap,
  GitBranch,
  Layers
} from 'lucide-react'
import { useExecutionStore } from '../stores/executionStore'

export default function VisualizationPanel() {
  const svgRef = useRef(null)
  const [viewMode, setViewMode] = useState('flow') // 'flow', 'tree', 'graph'
  const [animationSpeed, setAnimationSpeed] = useState(1)
  
  const { 
    executionTrace, 
    variables, 
    callStack, 
    isExecuting, 
    executionStep,
    currentLine
  } = useExecutionStore()

  useEffect(() => {
    if (svgRef.current && executionTrace.length > 0) {
      renderVisualization()
    }
  }, [executionTrace, viewMode, executionStep])

  const renderVisualization = () => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    if (viewMode === 'flow') {
      renderExecutionFlow(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    } else if (viewMode === 'tree') {
      renderCallTree(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    } else if (viewMode === 'graph') {
      renderDataFlow(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    }
  }

  const renderExecutionFlow = (container, width, height) => {
    const steps = executionTrace.slice(0, executionStep + 1)
    if (steps.length === 0) return

    // Create timeline
    const xScale = d3.scaleLinear()
      .domain([0, Math.max(steps.length - 1, 1)])
      .range([0, width - 100])

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(...steps.map(s => s.line || 0))])
      .range([height - 50, 50])

    // Draw timeline axis
    container.append('line')
      .attr('x1', 0)
      .attr('y1', height / 2)
      .attr('x2', width - 100)
      .attr('y2', height / 2)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 2)

    // Draw execution steps
    const stepGroups = container.selectAll('.step-group')
      .data(steps)
      .enter()
      .append('g')
      .attr('class', 'step-group')
      .attr('transform', (d, i) => `translate(${xScale(i)}, ${height / 2})`)

    // Step circles
    stepGroups.append('circle')
      .attr('r', 8)
      .attr('fill', (d, i) => i === executionStep ? '#3b82f6' : '#10b981')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        // Jump to step
        console.log('Jump to step:', d.step)
      })

    // Step labels
    stepGroups.append('text')
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .text((d, i) => `${i + 1}`)

    // Line numbers
    stepGroups.append('text')
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#6b7280')
      .text(d => `L${d.line || '?'}`)

    // Variable changes indicator
    stepGroups.filter(d => Object.keys(d.variables || {}).length > 0)
      .append('circle')
      .attr('cx', 12)
      .attr('cy', -12)
      .attr('r', 4)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)

    // Function calls indicator
    stepGroups.filter(d => d.callStack && d.callStack.length > 0)
      .append('rect')
      .attr('x', -15)
      .attr('y', -20)
      .attr('width', 30)
      .attr('height', 4)
      .attr('fill', '#8b5cf6')
      .attr('rx', 2)

    // Current execution pointer
    if (executionStep >= 0 && executionStep < steps.length) {
      container.append('polygon')
        .attr('points', '0,-10 10,0 0,10')
        .attr('transform', `translate(${xScale(executionStep) + 20}, ${height / 2})`)
        .attr('fill', '#ef4444')
        .style('animation', 'pulse 1s infinite')
    }

    // Variable display panel
    const variablePanel = container.append('g')
      .attr('transform', `translate(${width - 90}, 20)`)

    variablePanel.append('rect')
      .attr('width', 80)
      .attr('height', height - 40)
      .attr('fill', '#f8fafc')
      .attr('stroke', '#e2e8f0')
      .attr('rx', 4)

    variablePanel.append('text')
      .attr('x', 40)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .text('Variables')

    const variableEntries = Object.entries(variables).slice(0, 8)
    variableEntries.forEach((entry, i) => {
      const [name, data] = entry
      const y = 35 + i * 20

      variablePanel.append('text')
        .attr('x', 5)
        .attr('y', y)
        .attr('font-size', '10px')
        .attr('fill', '#6b7280')
        .text(`${name}:`)

      variablePanel.append('text')
        .attr('x', 75)
        .attr('y', y)
        .attr('text-anchor', 'end')
        .attr('font-size', '10px')
        .attr('fill', '#374151')
        .text(String(data.value).slice(0, 8))
    })
  }

  const renderCallTree = (container, width, height) => {
    if (callStack.length === 0) {
      container.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#6b7280')
        .text('No function calls to display')
      return
    }

    const treeData = {
      name: 'main',
      children: callStack.map((call, i) => ({
        name: call.name,
        depth: i,
        args: call.arguments
      }))
    }

    const treeLayout = d3.tree()
      .size([width, height - 100])

    const root = d3.hierarchy(treeData)
    treeLayout(root)

    // Draw links
    container.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y + 50)
      )
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2)

    // Draw nodes
    const nodes = container.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y + 50})`)

    nodes.append('circle')
      .attr('r', 20)
      .attr('fill', d => d.depth === 0 ? '#3b82f6' : '#10b981')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)

    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '12px')
      .attr('fill', '#ffffff')
      .text(d => d.data.name.slice(0, 8))
  }

  const renderDataFlow = (container, width, height) => {
    // Simplified data flow visualization
    const nodes = Object.entries(variables).map(([name, data], i) => ({
      id: name,
      value: data.value,
      type: data.type,
      x: (i % 4) * (width / 4) + width / 8,
      y: Math.floor(i / 4) * 80 + 60
    }))

    if (nodes.length === 0) {
      container.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#6b7280')
        .text('No variables to display')
      return
    }

    // Draw variable nodes
    const nodeGroups = container.selectAll('.variable-node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'variable-node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)

    nodeGroups.append('rect')
      .attr('x', -40)
      .attr('y', -20)
      .attr('width', 80)
      .attr('height', 40)
      .attr('fill', d => {
        switch (d.type) {
          case 'number': return '#3b82f6'
          case 'string': return '#10b981'
          case 'boolean': return '#f59e0b'
          case 'object': return '#8b5cf6'
          default: return '#6b7280'
        }
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('rx', 8)

    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -5)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .text(d => d.id)

    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 10)
      .attr('font-size', '10px')
      .attr('fill', '#ffffff')
      .text(d => String(d.value).slice(0, 10))
  }

  const viewModes = [
    { id: 'flow', label: 'Execution Flow', icon: GitBranch },
    { id: 'tree', label: 'Call Tree', icon: Layers },
    { id: 'graph', label: 'Data Flow', icon: Zap }
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-secondary-800">
      {/* Visualization Controls */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center space-x-2">
          {viewModes.map((mode) => {
            const Icon = mode.icon
            return (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                }`}
              >
                <Icon size={16} />
                <span>{mode.label}</span>
              </motion.button>
            )
          })}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary-600">Speed:</span>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-secondary-600 w-8">{animationSpeed}x</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => console.log('Reset view')}
            className="p-2 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100 rounded-lg transition-colors"
            title="Reset view"
          >
            <RotateCcw size={16} />
          </motion.button>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ background: '#fafafa' }}
        />
        
        {/* Status Overlay */}
        {!isExecuting && executionTrace.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                <Play size={24} className="text-secondary-400" />
              </div>
              <p className="text-secondary-600 text-lg font-medium mb-2">
                Ready to visualize
              </p>
              <p className="text-secondary-500 text-sm">
                Click Execute to start code visualization
              </p>
            </div>
          </div>
        )}
        
        {isExecuting && (
          <div className="absolute top-4 left-4 bg-primary-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">Executing...</span>
          </div>
        )}
      </div>

      {/* Execution Info */}
      <div className="p-4 bg-secondary-50 border-t border-secondary-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-secondary-600">
              Step: <span className="font-medium text-secondary-900">{executionStep}</span>
            </span>
            <span className="text-secondary-600">
              Line: <span className="font-medium text-secondary-900">{currentLine || 'N/A'}</span>
            </span>
            <span className="text-secondary-600">
              Variables: <span className="font-medium text-secondary-900">{Object.keys(variables).length}</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isExecuting ? 'bg-green-500 animate-pulse' : 'bg-secondary-400'
            }`} />
            <span className="text-secondary-600">
              {isExecuting ? 'Running' : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}