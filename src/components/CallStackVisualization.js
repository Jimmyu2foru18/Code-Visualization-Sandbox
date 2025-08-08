'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import { 
  Layers, 
  ArrowDown, 
  ArrowUp, 
  Code, 
  Clock,
  Hash,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { useExecutionStore } from '../stores/executionStore'

export default function CallStackVisualization() {
  const svgRef = useRef(null)
  const [viewMode, setViewMode] = useState('stack') // 'stack', 'tree', 'timeline'
  const [expandedFrames, setExpandedFrames] = useState(new Set())
  const [selectedFrame, setSelectedFrame] = useState(null)
  
  const { callStack, executionTrace, variables } = useExecutionStore()

  useEffect(() => {
    if (svgRef.current) {
      renderCallStackVisualization()
    }
  }, [callStack, viewMode, selectedFrame])

  const toggleFrameExpansion = (frameIndex) => {
    const newExpanded = new Set(expandedFrames)
    if (newExpanded.has(frameIndex)) {
      newExpanded.delete(frameIndex)
    } else {
      newExpanded.add(frameIndex)
    }
    setExpandedFrames(newExpanded)
  }

  const renderCallStackVisualization = () => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    if (viewMode === 'stack') {
      renderStackView(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    } else if (viewMode === 'tree') {
      renderTreeView(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    } else if (viewMode === 'timeline') {
      renderTimelineView(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    }
  }

  const renderStackView = (container, width, height) => {
    if (callStack.length === 0) {
      container.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#6b7280')
        .text('No function calls in stack')
      return
    }

    const frameHeight = 60
    const frameWidth = width - 40
    const spacing = 10

    // Reverse stack to show most recent calls at top
    const reversedStack = [...callStack].reverse()

    const frames = container.selectAll('.stack-frame')
      .data(reversedStack)
      .enter()
      .append('g')
      .attr('class', 'stack-frame')
      .attr('transform', (d, i) => `translate(20, ${i * (frameHeight + spacing)})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelectedFrame(d))

    // Frame background
    frames.append('rect')
      .attr('width', frameWidth)
      .attr('height', frameHeight)
      .attr('fill', (d, i) => i === 0 ? '#3b82f6' : '#e2e8f0')
      .attr('stroke', (d, i) => i === 0 ? '#1d4ed8' : '#cbd5e1')
      .attr('stroke-width', 2)
      .attr('rx', 8)
      .style('filter', (d, i) => i === 0 ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : 'none')

    // Function name
    frames.append('text')
      .attr('x', 15)
      .attr('y', 20)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', (d, i) => i === 0 ? '#ffffff' : '#374151')
      .text(d => d.name || 'anonymous')

    // Arguments
    frames.append('text')
      .attr('x', 15)
      .attr('y', 35)
      .attr('font-size', '12px')
      .attr('fill', (d, i) => i === 0 ? '#e0e7ff' : '#6b7280')
      .text(d => {
        const args = d.arguments || []
        if (args.length === 0) return 'No arguments'
        return `Args: ${args.slice(0, 3).map(arg => 
          typeof arg === 'string' ? `"${arg.slice(0, 10)}"` : String(arg).slice(0, 10)
        ).join(', ')}${args.length > 3 ? '...' : ''}`
      })

    // Timestamp
    frames.append('text')
      .attr('x', 15)
      .attr('y', 50)
      .attr('font-size', '10px')
      .attr('fill', (d, i) => i === 0 ? '#c7d2fe' : '#9ca3af')
      .text(d => {
        if (d.timestamp) {
          const time = new Date(d.timestamp)
          return `Called at ${time.toLocaleTimeString()}`
        }
        return 'No timestamp'
      })

    // Stack depth indicator
    frames.append('circle')
      .attr('cx', frameWidth - 20)
      .attr('cy', 20)
      .attr('r', 12)
      .attr('fill', (d, i) => i === 0 ? '#1d4ed8' : '#94a3b8')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)

    frames.append('text')
      .attr('x', frameWidth - 20)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .text((d, i) => callStack.length - i)

    // Stack arrows
    if (reversedStack.length > 1) {
      const arrows = container.selectAll('.stack-arrow')
        .data(reversedStack.slice(0, -1))
        .enter()
        .append('g')
        .attr('class', 'stack-arrow')
        .attr('transform', (d, i) => `translate(${width / 2}, ${(i + 1) * (frameHeight + spacing) - spacing / 2})`)

      arrows.append('line')
        .attr('x1', 0)
        .attr('y1', -spacing / 4)
        .attr('x2', 0)
        .attr('y2', spacing / 4)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)')

      // Define arrow marker
      const defs = svg.append('defs')
      defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 10)
        .attr('markerHeight', 7)
        .attr('refX', 9)
        .attr('refY', 3.5)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 3.5, 0 7')
        .attr('fill', '#94a3b8')
    }
  }

  const renderTreeView = (container, width, height) => {
    if (callStack.length === 0) return

    // Create hierarchical data
    const treeData = {
      name: 'main',
      children: callStack.map((call, i) => ({
        name: call.name,
        arguments: call.arguments,
        timestamp: call.timestamp,
        depth: i
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
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelectedFrame(d.data))

    nodes.append('circle')
      .attr('r', 25)
      .attr('fill', d => d.depth === 0 ? '#3b82f6' : '#10b981')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)

    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .text(d => d.data.name.slice(0, 8))

    // Add depth labels
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -35)
      .attr('font-size', '10px')
      .attr('fill', '#6b7280')
      .text(d => d.depth > 0 ? `Depth ${d.depth}` : '')
  }

  const renderTimelineView = (container, width, height) => {
    // Timeline of function calls from execution trace
    const callEvents = executionTrace
      .filter(trace => trace.callStack && trace.callStack.length > 0)
      .map((trace, i) => ({
        step: i,
        calls: trace.callStack,
        timestamp: trace.timestamp
      }))

    if (callEvents.length === 0) return

    const xScale = d3.scaleLinear()
      .domain([0, callEvents.length - 1])
      .range([0, width])

    const yScale = d3.scaleBand()
      .domain(d3.range(0, d3.max(callEvents, d => d.calls.length) || 1))
      .range([0, height])
      .padding(0.1)

    // Draw timeline axis
    container.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `Step ${d}`))

    // Draw call events
    callEvents.forEach((event, eventIndex) => {
      event.calls.forEach((call, callIndex) => {
        container.append('rect')
          .attr('x', xScale(eventIndex))
          .attr('y', yScale(callIndex))
          .attr('width', Math.max(2, width / callEvents.length - 1))
          .attr('height', yScale.bandwidth())
          .attr('fill', '#3b82f6')
          .attr('opacity', 0.7)
          .style('cursor', 'pointer')
          .on('mouseover', function() {
            d3.select(this).attr('opacity', 1)
          })
          .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.7)
          })
      })
    })
  }

  const viewModes = [
    { id: 'stack', label: 'Stack View', icon: Layers },
    { id: 'tree', label: 'Call Tree', icon: Code },
    { id: 'timeline', label: 'Timeline', icon: Clock }
  ]

  return (
    <div className="flex h-full bg-white">
      {/* Main Visualization */}
      <div className="flex-1 flex flex-col">
        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200">
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
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{mode.label}</span>
                </motion.button>
              )
            })}
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Layers size={16} className="text-primary-500" />
              <span className="text-secondary-600">Depth:</span>
              <span className="font-medium text-secondary-900">{callStack.length}</span>
            </div>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="flex-1 relative overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ background: '#fafafa' }}
          />
          
          {callStack.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                  <Layers size={24} className="text-secondary-400" />
                </div>
                <p className="text-secondary-600 text-lg font-medium mb-2">
                  No function calls
                </p>
                <p className="text-secondary-500 text-sm">
                  Execute code with functions to see call stack
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel - Frame Details */}
      {selectedFrame && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 border-l border-secondary-200 bg-secondary-50 p-4 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              Frame Details
            </h3>
            <button
              onClick={() => setSelectedFrame(null)}
              className="text-secondary-500 hover:text-secondary-700"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Function Name
              </label>
              <div className="bg-white p-3 rounded-lg border border-secondary-200">
                <code className="text-sm text-secondary-900">
                  {selectedFrame.name || 'anonymous'}
                </code>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Arguments
              </label>
              <div className="bg-white p-3 rounded-lg border border-secondary-200">
                {selectedFrame.arguments && selectedFrame.arguments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFrame.arguments.map((arg, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <span className="text-xs text-secondary-500">#{i}:</span>
                        <code className="text-sm text-secondary-900">
                          {typeof arg === 'string' ? `"${arg}"` : String(arg)}
                        </code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-secondary-500">No arguments</span>
                )}
              </div>
            </div>
            
            {selectedFrame.timestamp && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Called At
                </label>
                <div className="bg-white p-3 rounded-lg border border-secondary-200">
                  <span className="text-sm text-secondary-900">
                    {new Date(selectedFrame.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}