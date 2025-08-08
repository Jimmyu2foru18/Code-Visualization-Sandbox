'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react'
import { useExecutionStore } from '../stores/executionStore'

export default function PerformanceMetrics() {
  const svgRef = useRef(null)
  const [viewMode, setViewMode] = useState('overview') // 'overview', 'timeline', 'complexity'
  const [metrics, setMetrics] = useState({
    executionTime: 0,
    memoryPeak: 0,
    operationsCount: 0,
    complexity: {
      time: 'O(1)',
      space: 'O(1)'
    },
    performance: {
      score: 85,
      bottlenecks: [],
      suggestions: []
    }
  })
  
  const { 
    executionTrace, 
    performanceMetrics, 
    variables, 
    callStack,
    isExecuting,
    executionStep
  } = useExecutionStore()

  useEffect(() => {
    calculateMetrics()
  }, [executionTrace, performanceMetrics, variables, callStack])

  useEffect(() => {
    if (svgRef.current) {
      renderVisualization()
    }
  }, [metrics, viewMode])

  const calculateMetrics = () => {
    if (executionTrace.length === 0) return

    const startTime = executionTrace[0]?.timestamp || Date.now()
    const endTime = executionTrace[executionTrace.length - 1]?.timestamp || Date.now()
    const executionTime = endTime - startTime

    const memoryPeak = Math.max(...executionTrace.map(t => t.memoryUsage || 0))
    const operationsCount = executionTrace.length

    // Analyze complexity
    const complexity = analyzeComplexity()
    
    // Calculate performance score
    const performance = calculatePerformanceScore()

    setMetrics({
      executionTime,
      memoryPeak,
      operationsCount,
      complexity,
      performance
    })
  }

  const analyzeComplexity = () => {
    // Simplified complexity analysis based on execution patterns
    const operations = executionTrace.length
    const variables = Object.keys(variables).length
    const maxCallDepth = Math.max(...executionTrace.map(t => t.callStack?.length || 0))

    let timeComplexity = 'O(1)'
    let spaceComplexity = 'O(1)'

    // Basic heuristics for complexity estimation
    if (operations > 1000) {
      timeComplexity = 'O(n²)'
    } else if (operations > 100) {
      timeComplexity = 'O(n log n)'
    } else if (operations > 10) {
      timeComplexity = 'O(n)'
    }

    if (maxCallDepth > 10) {
      spaceComplexity = 'O(n)'
    } else if (variables > 10) {
      spaceComplexity = 'O(n)'
    }

    return { time: timeComplexity, space: spaceComplexity }
  }

  const calculatePerformanceScore = () => {
    let score = 100
    const bottlenecks = []
    const suggestions = []

    // Check execution time
    if (metrics.executionTime > 5000) {
      score -= 20
      bottlenecks.push('Long execution time')
      suggestions.push('Consider optimizing algorithms')
    }

    // Check memory usage
    if (metrics.memoryPeak > 1000) {
      score -= 15
      bottlenecks.push('High memory usage')
      suggestions.push('Optimize data structures')
    }

    // Check complexity
    if (metrics.complexity.time.includes('n²')) {
      score -= 25
      bottlenecks.push('Quadratic time complexity')
      suggestions.push('Use more efficient algorithms')
    }

    // Check call stack depth
    const maxDepth = Math.max(...executionTrace.map(t => t.callStack?.length || 0))
    if (maxDepth > 20) {
      score -= 10
      bottlenecks.push('Deep recursion')
      suggestions.push('Consider iterative solutions')
    }

    return {
      score: Math.max(0, score),
      bottlenecks,
      suggestions
    }
  }

  const renderVisualization = () => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 20, right: 20, bottom: 40, left: 60 }

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    if (viewMode === 'overview') {
      renderOverview(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    } else if (viewMode === 'timeline') {
      renderTimeline(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    } else if (viewMode === 'complexity') {
      renderComplexityAnalysis(g, width - margin.left - margin.right, height - margin.top - margin.bottom)
    }
  }

  const renderOverview = (container, width, height) => {
    // Performance score gauge
    const centerX = width / 4
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Background arc
    const backgroundArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)

    container.append('path')
      .attr('d', backgroundArc)
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .attr('fill', '#e5e7eb')

    // Score arc
    const scoreAngle = (metrics.performance.score / 100) * Math.PI - Math.PI / 2
    const scoreArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(scoreAngle)

    container.append('path')
      .attr('d', scoreArc)
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .attr('fill', getScoreColor(metrics.performance.score))

    // Score text
    container.append('text')
      .attr('x', centerX)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .text(metrics.performance.score)

    container.append('text')
      .attr('x', centerX)
      .attr('y', centerY + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#6b7280')
      .text('Performance Score')

    // Metrics bars
    const metricsData = [
      { label: 'Execution Time', value: metrics.executionTime, max: 10000, unit: 'ms' },
      { label: 'Memory Peak', value: metrics.memoryPeak, max: 2000, unit: 'KB' },
      { label: 'Operations', value: metrics.operationsCount, max: 1000, unit: '' }
    ]

    const barWidth = (width - centerX * 2 - 40) / metricsData.length
    const barHeight = height - 100

    metricsData.forEach((metric, i) => {
      const x = centerX * 2 + 20 + i * barWidth
      const normalizedValue = Math.min(metric.value / metric.max, 1)
      const barActualHeight = normalizedValue * barHeight

      // Bar background
      container.append('rect')
        .attr('x', x)
        .attr('y', 50)
        .attr('width', barWidth - 10)
        .attr('height', barHeight)
        .attr('fill', '#f3f4f6')
        .attr('rx', 4)

      // Bar fill
      container.append('rect')
        .attr('x', x)
        .attr('y', 50 + barHeight - barActualHeight)
        .attr('width', barWidth - 10)
        .attr('height', barActualHeight)
        .attr('fill', getMetricColor(normalizedValue))
        .attr('rx', 4)

      // Label
      container.append('text')
        .attr('x', x + (barWidth - 10) / 2)
        .attr('y', height - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#374151')
        .text(metric.label)

      // Value
      container.append('text')
        .attr('x', x + (barWidth - 10) / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#374151')
        .text(`${metric.value}${metric.unit}`)
    })
  }

  const renderTimeline = (container, width, height) => {
    if (executionTrace.length < 2) {
      container.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#6b7280')
        .text('Not enough data for timeline')
      return
    }

    const timeData = executionTrace.map((trace, i) => ({
      step: i,
      time: trace.timestamp - executionTrace[0].timestamp,
      memory: trace.memoryUsage || 0,
      operations: i + 1
    }))

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

    // Memory usage line
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

    // Data points
    container.selectAll('.data-point')
      .data(timeData)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.step))
      .attr('cy', d => yScale(d.memory))
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
  }

  const renderComplexityAnalysis = (container, width, height) => {
    // Complexity visualization
    const complexityData = [
      { type: 'Time', complexity: metrics.complexity.time, score: getComplexityScore(metrics.complexity.time) },
      { type: 'Space', complexity: metrics.complexity.space, score: getComplexityScore(metrics.complexity.space) }
    ]

    const barHeight = 60
    const barSpacing = 40

    complexityData.forEach((item, i) => {
      const y = i * (barHeight + barSpacing) + 50
      const barWidth = (item.score / 100) * (width - 200)

      // Label
      container.append('text')
        .attr('x', 0)
        .attr('y', y + barHeight / 2)
        .attr('dy', '0.35em')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#374151')
        .text(`${item.type} Complexity`)

      // Bar background
      container.append('rect')
        .attr('x', 150)
        .attr('y', y)
        .attr('width', width - 200)
        .attr('height', barHeight)
        .attr('fill', '#f3f4f6')
        .attr('rx', 8)

      // Bar fill
      container.append('rect')
        .attr('x', 150)
        .attr('y', y)
        .attr('width', barWidth)
        .attr('height', barHeight)
        .attr('fill', getComplexityColor(item.score))
        .attr('rx', 8)

      // Complexity text
      container.append('text')
        .attr('x', 150 + (width - 200) / 2)
        .attr('y', y + barHeight / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#ffffff')
        .text(item.complexity)
    })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getMetricColor = (normalized) => {
    if (normalized < 0.5) return '#10b981'
    if (normalized < 0.8) return '#f59e0b'
    return '#ef4444'
  }

  const getComplexityScore = (complexity) => {
    const scores = {
      'O(1)': 100,
      'O(log n)': 85,
      'O(n)': 70,
      'O(n log n)': 55,
      'O(n²)': 30,
      'O(2^n)': 10
    }
    return scores[complexity] || 50
  }

  const getComplexityColor = (score) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const viewModes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'complexity', label: 'Complexity', icon: Target }
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Performance Controls */}
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
            <Zap size={16} className="text-warning" />
            <span className="text-secondary-600">Score:</span>
            <span className={`font-medium ${
              metrics.performance.score >= 80 ? 'text-green-600' :
              metrics.performance.score >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.performance.score}/100
            </span>
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
        
        {executionTrace.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                <BarChart3 size={24} className="text-secondary-400" />
              </div>
              <p className="text-secondary-600 text-lg font-medium mb-2">
                No performance data
              </p>
              <p className="text-secondary-500 text-sm">
                Execute code to see performance metrics
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <div className="p-4 bg-secondary-50 border-t border-secondary-200">
        <div className="grid grid-cols-2 gap-4">
          {/* Bottlenecks */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-2 flex items-center">
              <TrendingDown size={16} className="mr-2 text-red-500" />
              Bottlenecks
            </h4>
            <div className="space-y-1">
              {metrics.performance.bottlenecks.length > 0 ? (
                metrics.performance.bottlenecks.map((bottleneck, i) => (
                  <div key={i} className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                    {bottleneck}
                  </div>
                ))
              ) : (
                <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                  No bottlenecks detected
                </div>
              )}
            </div>
          </div>
          
          {/* Suggestions */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-2 flex items-center">
              <TrendingUp size={16} className="mr-2 text-green-500" />
              Suggestions
            </h4>
            <div className="space-y-1">
              {metrics.performance.suggestions.length > 0 ? (
                metrics.performance.suggestions.map((suggestion, i) => (
                  <div key={i} className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {suggestion}
                  </div>
                ))
              ) : (
                <div className="text-sm text-secondary-600 bg-secondary-100 px-2 py-1 rounded">
                  Code looks optimized!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}