import * as Babel from '@babel/standalone'
import { parse } from 'acorn'
import { simple as walkSimple } from 'acorn-walk'

class CodeExecutor {
  constructor() {
    this.executionContext = null
    this.stepCallbacks = []
    this.consoleCallbacks = []
    this.errorCallbacks = []
    this.isRunning = false
    this.isPaused = false
    this.currentStep = 0
    this.variables = new Map()
    this.callStack = []
    this.memoryUsage = 0
  }

  async execute(code, options = {}) {
    const {
      onStep = () => {},
      onConsole = () => {},
      onError = () => {},
      speed = 1000
    } = options

    this.stepCallbacks = [onStep]
    this.consoleCallbacks = [onConsole]
    this.errorCallbacks = [onError]
    this.isRunning = true
    this.isPaused = false
    this.currentStep = 0
    this.variables.clear()
    this.callStack = []
    this.memoryUsage = 0

    try {
      // Parse and instrument the code
      const instrumentedCode = this.instrumentCode(code)
      
      // Create execution context
      this.createExecutionContext()
      
      // Execute with step-by-step control
      await this.executeInstrumented(instrumentedCode, speed)
      
    } catch (error) {
      this.handleError(error)
    } finally {
      this.isRunning = false
    }
  }

  instrumentCode(code) {
    try {
      // Parse the code into AST
      const ast = parse(code, { ecmaVersion: 2020, sourceType: 'script' })
      
      // Transform AST to add instrumentation
      const instrumentedAst = this.addInstrumentation(ast)
      
      // Generate instrumented code
      return this.generateCode(instrumentedAst)
      
    } catch (error) {
      throw new Error(`Code parsing failed: ${error.message}`)
    }
  }

  addInstrumentation(ast) {
    let nodeId = 0
    
    const instrumentNode = (node) => {
      node._instrumentId = nodeId++
      
      // Add step tracking for statements
      if (this.isStatement(node)) {
        node._shouldStep = true
      }
      
      // Add variable tracking for declarations
      if (node.type === 'VariableDeclaration') {
        node._trackVariables = true
      }
      
      // Add function call tracking
      if (node.type === 'CallExpression') {
        node._trackCall = true
      }
      
      return node
    }

    walkSimple(ast, {
      Statement: instrumentNode,
      Expression: instrumentNode,
      Declaration: instrumentNode
    })

    return ast
  }

  generateCode(ast) {
    // Use Babel to transform the AST and add instrumentation
    try {
      const result = Babel.transformFromAst(ast, null, {
        plugins: [
          // Custom plugin to add step tracking
          () => ({
            visitor: {
              Statement(path) {
                if (path.node._shouldStep) {
                  const stepCall = Babel.template.statement(`
                    await this.__step(%%nodeId%%, %%line%%, this.__getVariables(), this.__getCallStack());
                  `)({ 
                    nodeId: Babel.types.numericLiteral(path.node._instrumentId),
                    line: Babel.types.numericLiteral(path.node.loc?.start?.line || 0)
                  })
                  path.insertBefore(stepCall)
                }
              },
              VariableDeclarator(path) {
                if (path.node.id.name && path.node._trackVariables) {
                  const trackCall = Babel.template.statement(`
                    this.__trackVariable('%%varName%%', %%varName%%);
                  `)({ 
                    varName: path.node.id.name
                  })
                  path.insertAfter(trackCall)
                }
              }
            }
          })
        ]
      })
      
      return result.code || ''
    } catch (error) {
      // Fallback to simple code generation if Babel fails
      return this.generateSimpleCode(ast)
    }
  }
  
  generateSimpleCode(ast) {
    // Simplified fallback code generation
    let code = ''
    
    const generateNode = (node) => {
      switch (node.type) {
        case 'Program':
          return node.body.map(generateNode).join('\n')
        case 'ExpressionStatement':
          return generateNode(node.expression) + ';'
        case 'CallExpression':
          const callee = generateNode(node.callee)
          const args = node.arguments.map(generateNode).join(', ')
          return `${callee}(${args})`
        case 'MemberExpression':
          const object = generateNode(node.object)
          const property = node.computed ? `[${generateNode(node.property)}]` : `.${node.property.name}`
          return object + property
        case 'Identifier':
          return node.name
        case 'Literal':
          return typeof node.value === 'string' ? `"${node.value}"` : String(node.value)
        case 'VariableDeclaration':
          const declarations = node.declarations.map(decl => {
            const init = decl.init ? ` = ${generateNode(decl.init)}` : ''
            return `${decl.id.name}${init}`
          }).join(', ')
          return `${node.kind} ${declarations};`
        case 'FunctionDeclaration':
          const params = node.params.map(p => p.name).join(', ')
          const body = generateNode(node.body)
          return `function ${node.id.name}(${params}) ${body}`
        case 'BlockStatement':
          return '{\n' + node.body.map(generateNode).join('\n') + '\n}'
        case 'ReturnStatement':
          return `return ${node.argument ? generateNode(node.argument) : ''};`
        case 'IfStatement':
          const test = generateNode(node.test)
          const consequent = generateNode(node.consequent)
          const alternate = node.alternate ? ` else ${generateNode(node.alternate)}` : ''
          return `if (${test}) ${consequent}${alternate}`
        case 'WhileStatement':
          return `while (${generateNode(node.test)}) ${generateNode(node.body)}`
        case 'ForStatement':
          const init = node.init ? generateNode(node.init) : ''
          const test2 = node.test ? generateNode(node.test) : ''
          const update = node.update ? generateNode(node.update) : ''
          return `for (${init}; ${test2}; ${update}) ${generateNode(node.body)}`
        case 'BinaryExpression':
        case 'LogicalExpression':
          return `${generateNode(node.left)} ${node.operator} ${generateNode(node.right)}`
        case 'UnaryExpression':
          return `${node.operator}${generateNode(node.argument)}`
        case 'UpdateExpression':
          return node.prefix ? `${node.operator}${generateNode(node.argument)}` : `${generateNode(node.argument)}${node.operator}`
        case 'AssignmentExpression':
          return `${generateNode(node.left)} ${node.operator} ${generateNode(node.right)}`
        default:
          return '/* Unsupported node type: ' + node.type + ' */'
      }
    }
    
    return generateNode(ast)
  }

  createExecutionContext() {
    const self = this
    
    this.executionContext = {
      // Step tracking
      __step: async (nodeId, line, variables, callStack) => {
        await self.handleStep(nodeId, line, variables, callStack)
      },
      
      // Variable tracking
      __getVariables: () => {
        return Object.fromEntries(self.variables)
      },
      
      __trackVariable: (name, value) => {
        self.variables.set(name, {
          value,
          type: typeof value,
          timestamp: Date.now()
        })
      },
      
      // Call stack tracking
      __getCallStack: () => {
        return [...self.callStack]
      },
      
      __enterFunction: (functionName, args) => {
        self.callStack.push({
          name: functionName,
          arguments: args,
          timestamp: Date.now()
        })
      },
      
      __exitFunction: () => {
        self.callStack.pop()
      },
      
      // Console override
      console: {
        log: (...args) => self.handleConsole('log', args),
        error: (...args) => self.handleConsole('error', args),
        warn: (...args) => self.handleConsole('warn', args),
        info: (...args) => self.handleConsole('info', args)
      },
      
      // Memory tracking
      __updateMemory: () => {
        // Simplified memory calculation
        self.memoryUsage = self.variables.size * 8 + self.callStack.length * 16
      }
    }
  }

  async executeInstrumented(code, speed) {
    // Create a function with the instrumented code
    const asyncFunction = new Function(
      'return (async function() {' + code + '})()'
    )
    
    // Execute in the context
    await asyncFunction.call(this.executionContext)
  }

  async handleStep(nodeId, line, variables, callStack) {
    if (!this.isRunning) return
    
    // Wait if paused
    while (this.isPaused && this.isRunning) {
      await this.sleep(100)
    }
    
    this.currentStep++
    
    // Update memory usage
    this.executionContext.__updateMemory()
    
    // Notify step callbacks
    const stepData = {
      step: this.currentStep,
      nodeId,
      line,
      variables,
      callStack,
      memoryUsage: this.memoryUsage,
      timestamp: Date.now()
    }
    
    this.stepCallbacks.forEach(callback => callback(stepData))
    
    // Wait for step delay
    await this.sleep(1000 / speed)
  }

  handleConsole(type, args) {
    const output = {
      type,
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '),
      timestamp: Date.now()
    }
    
    this.consoleCallbacks.forEach(callback => callback(output))
  }

  handleError(error) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      line: error.lineNumber || 0,
      column: error.columnNumber || 0,
      timestamp: Date.now()
    }
    
    this.errorCallbacks.forEach(callback => callback(errorData))
  }

  isStatement(node) {
    const statementTypes = [
      'ExpressionStatement',
      'BlockStatement',
      'IfStatement',
      'WhileStatement',
      'ForStatement',
      'ReturnStatement',
      'VariableDeclaration',
      'FunctionDeclaration'
    ]
    
    return statementTypes.includes(node.type)
  }

  pause() {
    this.isPaused = true
  }

  resume() {
    this.isPaused = false
  }

  stop() {
    this.isRunning = false
    this.isPaused = false
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Singleton instance
const codeExecutor = new CodeExecutor()

export const executeJavaScript = (code, options) => {
  return codeExecutor.execute(code, options)
}

export const pauseExecution = () => {
  codeExecutor.pause()
}

export const resumeExecution = () => {
  codeExecutor.resume()
}

export const stopExecution = () => {
  codeExecutor.stop()
}