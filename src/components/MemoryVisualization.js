'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import { 
  MemoryStick, 
  Trash2, 
  AlertTriangle, 
  TrendingUp,
  Database,
  Layers
} from 'lucide-react'
import { useExecutionStore } from '../stores/executionStore'

export default function MemoryVisualization() {
  const svgRef = useRef(null)
  const [viewMode, setViewMode] = useState('blocks') // 'blocks', 'graph', 'timeline'
  const [memoryData, setMemoryData] = useState({
    heap: [],
    stack: [],
    total: 0,
    peak: 0,
    allocations: 0,
    deallocations: 0
  })
  
  const { variables, callStack, executionTrace, memoryUsage } = useExecutionStore()

  useEffect(() => {
    updateMemoryData()
  }, [variables, callStack, executionTrace])

  useEffect(() => {
    if (svgRef.current) {
      renderMemoryVisualization()
    }
  }, [memoryData, viewMode])

  const updateMemoryData = () => {
    // Simulate memory allocation based on variables and call stack
    const heap = Object.entries(variables).map(([name, data], index) => ({
      id: `var_${name}`,
      name,
      size: getVariableSize(data.value, data.type),
      type: data.type,
      address: 1000 + index * 8,
      allocated: true,
      timestamp: data.timestamp || Date.now()
    }))

    const stack = callStack.map((call, index) => ({
      id: `call_${index}`,
      name: call.name,
      size: 32 + (call.arguments?.length || 0) * 8,
      type: 'function',
      address: 2000 + index * 32,
      allocated: true,
      timestamp: call.timestamp || Date.now()
    }))

    const total = heap.reduce((sum, item) => sum + item.size, 0) + 
                  stack.reduce((sum, item) => sum + item.size, 0)

    setMemoryData(prev => ({
      heap,
      stack,
      total,
      peak: Math.max(prev.peak, total),
      allocations: heap.length + stack.length,
      deallocations: prev.deallocations
    }))
  }

  const getVariableSize = (value, type) => {
    switch (type) {
      case 'number': return 8
      case 'boolean': return 1
      case 'string': return (value?.length || 0) * 2 + 16
      case 'object': 
        if (Array.isArray(value)) {
          return value.length * 8 + 24
        }
        return Object.keys(value || {}).length * 16 + 32
      default: return 8
    }
  }

  const renderMemoryVisualization = () => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 20, right: 20, bottom: 60, left: 60 }

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    if (viewMode === 'blocks') {
      renderMemoryBlocks(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    } else if (viewMode === 'graph') {
      renderMemoryGraph(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    } else if (viewMode === 'timeline') {
      renderMemoryTimeline(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    }
  }

  const renderMemoryBlocks = (container, width, height) => {
    const allBlocks = [...memoryData.heap, ...memoryData.stack]
    if (allBlocks.length === 0) {
      container.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#6b7280')
        .text('No memory allocations to display')
      return
    }

    // Calculate layout
    const blockWidth = 40
    const blockHeight = 30
    const blocksPerRow = Math.floor(width / (blockWidth + 5))
    
    // Heap section
    container.append('text')
      .attr('x', 0)
      .attr('y', 15)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .text('Heap Memory')

    const heapBlocks = container.selectAll('.heap-block')
      .data(memoryData.heap)
      .enter()
      .append('g')
      .attr('class', 'heap-block')
      .attr('transform', (d, i) => {
        const row = Math.floor(i / blocksPerRow)
        const col = i % blocksPerRow
        return `translate(${col * (blockWidth + 5)}, ${30 + row * (blockHeight + 5)})`
      })

    heapBlocks.append('rect')
      .attr('width', blockWidth)
      .attr('height', blockHeight)
      .attr('fill', d => getTypeColor(d.type))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        showTooltip(event, d)
      })
      .on('mouseout', hideTooltip)

    heapBlocks.append('text')
      .attr('x', blockWidth / 2)
      .attr('y', blockHeight / 2 - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#ffffff')
      .attr('font-weight', 'bold')
      .text(d => d.name.slice(0, 5))

    heapBlocks.append('text')
      .attr('x', blockWidth / 2)
      .attr('y', blockHeight / 2 + 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', '#ffffff')
      .text(d => `${d.size}B`)

    // Stack section
    const stackY = 30 + Math.ceil(memoryData.heap.length / blocksPerRow) * (blockHeight + 5) + 40
    
    container.append('text')
      .attr('x', 0)
      .attr('y', stackY)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .text('Stack Memory')

    const stackBlocks = container.selectAll('.stack-block')
      .data(memoryData.stack)
      .enter()
      .append('g')
      .attr('class', 'stack-block')
      .attr('transform', (d, i) => {
        return `translate(${i * (blockWidth + 5)}, ${stackY + 15})`
      })

    stackBlocks.append('rect')
      .attr('width', blockWidth)
      .attr('height', blockHeight)
      .attr('fill', '#8b5cf6')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        showTooltip(event, d)
      })
      .on('mouseout', hideTooltip)

    stackBlocks.append('text')
      .attr('x', blockWidth / 2)
      .attr('y', blockHeight / 2 - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#ffffff')
      .attr('font-weight', 'bold')
      .text(d => d.name.slice(0, 5))

    stackBlocks.append('text')
      .attr('x', blockWidth / 2)
      .attr('y', blockHeight / 2 + 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', '#ffffff')
      .text(d => `${d.size}B`)
  }

  const renderMemoryGraph = (container, width, height) => {
    // Memory usage over time
    const timeData = executionTrace.map((trace, i) => ({
      step: i,
      memory: trace.memoryUsage || 0,
      timestamp: trace.timestamp
    }))

    if (timeData.length < 2) return

    const xScale = d3.scaleLinear()
      .domain([0, timeData.length - 1])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(timeData, d => d.memory) || 100])
      .range([height, 0])

    // Draw axes
    container.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `Step ${d}`))

    container.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}KB`))

    // Draw line
    const line = d3.line()
      .x(d => xScale(d.step))
      .y(d => yScale(d.memory))
      .curve(d3.curveMonotoneX)

    container.append('path')
      .datum(timeData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line)

    // Draw area under curve
    const area = d3.area()
      .x(d => xScale(d.step))
      .y0(height)
      .y1(d => yScale(d.memory))
      .curve(d3.curveMonotoneX)

    container.append('path')
      .datum(timeData)
      .attr('fill', 'rgba(59, 130, 246, 0.1)')
      .attr('d', area)

    // Draw points
    container.selectAll('.memory-point')
      .data(timeData)
      .enter()
      .append('circle')
      .attr('class', 'memory-point')
      .attr('cx', d => xScale(d.step))
      .attr('cy', d => yScale(d.memory))
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
  }

  const renderMemoryTimeline = (container, width, height) => {
    // Timeline of allocations and deallocations
    const events = [...memoryData.heap, ...memoryData.stack]
      .map(block => ({
        ...block,
        event: 'allocation',
        time: block.timestamp
      }))
      .sort((a, b) => a.time - b.time)

    if (events.length === 0) return

    const xScale = d3.scaleTime()
      .domain(d3.extent(events, d => new Date(d.time)))
      .range([0, width])

    const yScale = d3.scaleBand()
      .domain(events.map((d, i) => i))
      .range([0, height])
      .padding(0.1)

    // Draw timeline axis
    container.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%H:%M:%S')))

    // Draw events
    const eventGroups = container.selectAll('.memory-event')
      .data(events)
      .enter()
      .append('g')
      .attr('class', 'memory-event')
      .attr('transform', (d, i) => `translate(${xScale(new Date(d.time))}, ${yScale(i)})`)

    eventGroups.append('rect')
      .attr('width', 8)
      .attr('height', yScale.bandwidth())
      .attr('fill', d => getTypeColor(d.type))
      .attr('rx', 2)

    eventGroups.append('text')
      .attr('x', 12)
      .attr('y', yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .text(d => `${d.name} (${d.size}B)`)
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'number': return '#3b82f6'
      case 'string': return '#10b981'
      case 'boolean': return '#f59e0b'
      case 'object': return '#8b5cf6'
      case 'function': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const showTooltip = (event, data) => {
    // Implement tooltip logic
    console.log('Show tooltip for:', data)
  }

  const hideTooltip = () => {
    // Implement tooltip hide logic
  }

  const viewModes = [
    { id: 'blocks', label: 'Memory Blocks', icon: Database },
    { id: 'graph', label: 'Usage Graph', icon: TrendingUp },
    { id: 'timeline', label: 'Timeline', icon: Layers }
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Memory Controls */}
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
            <MemoryStick size={16} className="text-primary-500" />
            <span className="text-secondary-600">Total:</span>
            <span className="font-medium text-secondary-900">{memoryData.total}B</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp size={16} className="text-warning" />
            <span className="text-secondary-600">Peak:</span>
            <span className="font-medium text-secondary-900">{memoryData.peak}B</span>
          </div>
        </div>
      </div>

      {/* Memory Visualization */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ background: '#fafafa' }}
        />
        
        {memoryData.total === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                <MemoryStick size={24} className="text-secondary-400" />
              </div>
              <p className="text-secondary-600 text-lg font-medium mb-2">
                No memory usage
              </p>
              <p className="text-secondary-500 text-sm">
                Execute code to see memory allocations
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Memory Stats */}
      <div className="p-4 bg-secondary-50 border-t border-secondary-200">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">{memoryData.heap.length}</div>
            <div className="text-secondary-600">Heap Objects</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{memoryData.stack.length}</div>
            <div className="text-secondary-600">Stack Frames</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{memoryData.allocations}</div>
            <div className="text-secondary-600">Allocations</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{memoryData.deallocations}</div>
            <div className="text-secondary-600">Deallocations</div>
          </div>
        </div>
      </div>
    </div>
  )
}