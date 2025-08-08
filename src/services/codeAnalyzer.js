import { parse } from 'acorn'
import { simple as walkSimple, full as walkFull } from 'acorn-walk'

class CodeAnalyzer {
  constructor() {
    this.ast = null
    this.analysis = null
  }

  async analyze(code) {
    try {
      // Parse code into AST
      this.ast = parse(code, {
        ecmaVersion: 2020,
        sourceType: 'script',
        locations: true,
        ranges: true
      })

      // Perform various analyses
      this.analysis = {
        ast: this.ast,
        functions: this.analyzeFunctions(),
        variables: this.analyzeVariables(),
        loops: this.analyzeLoops(),
        conditionals: this.analyzeConditionals(),
        complexity: this.calculateComplexity(),
        dependencies: this.analyzeDependencies(),
        suggestions: this.generateSuggestions(),
        metrics: this.calculateMetrics()
      }

      return this.analysis
    } catch (error) {
      throw new Error(`Code analysis failed: ${error.message}`)
    }
  }

  analyzeFunctions() {
    const functions = []
    
    walkSimple(this.ast, {
      FunctionDeclaration: (node) => {
        functions.push({
          type: 'declaration',
          name: node.id?.name || 'anonymous',
          params: node.params.map(p => p.name),
          line: node.loc?.start?.line,
          column: node.loc?.start?.column,
          complexity: this.calculateFunctionComplexity(node),
          isRecursive: this.isRecursiveFunction(node)
        })
      },
      FunctionExpression: (node) => {
        functions.push({
          type: 'expression',
          name: node.id?.name || 'anonymous',
          params: node.params.map(p => p.name),
          line: node.loc?.start?.line,
          column: node.loc?.start?.column,
          complexity: this.calculateFunctionComplexity(node),
          isRecursive: this.isRecursiveFunction(node)
        })
      },
      ArrowFunctionExpression: (node) => {
        functions.push({
          type: 'arrow',
          name: 'arrow function',
          params: node.params.map(p => p.name),
          line: node.loc?.start?.line,
          column: node.loc?.start?.column,
          complexity: this.calculateFunctionComplexity(node),
          isRecursive: false // Simplified for arrow functions
        })
      }
    })

    return functions
  }

  analyzeVariables() {
    const variables = []
    const scopes = new Map()
    
    walkSimple(this.ast, {
      VariableDeclaration: (node) => {
        node.declarations.forEach(declaration => {
          if (declaration.id.type === 'Identifier') {
            variables.push({
              name: declaration.id.name,
              type: node.kind, // var, let, const
              line: declaration.loc?.start?.line,
              column: declaration.loc?.start?.column,
              hasInitializer: !!declaration.init,
              scope: this.determineScope(node)
            })
          }
        })
      },
      AssignmentExpression: (node) => {
        if (node.left.type === 'Identifier') {
          const existing = variables.find(v => v.name === node.left.name)
          if (existing) {
            existing.reassigned = true
          }
        }
      }
    })

    return variables
  }

  analyzeLoops() {
    const loops = []
    
    walkSimple(this.ast, {
      ForStatement: (node) => {
        loops.push({
          type: 'for',
          line: node.loc?.start?.line,
          column: node.loc?.start?.column,
          hasInit: !!node.init,
          hasTest: !!node.test,
          hasUpdate: !!node.update,
          isInfinite: this.isInfiniteLoop(node)
        })
      },
      WhileStatement: (node) => {
        loops.push({
          type: 'while',
          line: node.loc?.start?.line,
          column: node.loc?.start?.column,
          isInfinite: this.isInfiniteLoop(node)
        })
      },
      DoWhileStatement: (node) => {
        loops.push({
          type: 'do-while',
          line: node.loc?.start?.line,
          column: node.loc?.start?.column,
          isInfinite: this.isInfiniteLoop(node)
        })
      },
      ForInStatement: (node) => {
        loops.push({
          type: 'for-in',
          line: node.loc?.start?.line,
          column: node.loc?.start?.column,
          isInfinite: false
        })
      },
      ForOfStatement: (node) => {
        loops.push({
          type: 'for-of',
          line: node.loc?.start?.line,
          column: node.loc?.start?.column,
          isInfinite: false
        })
      }
    })

    return loops
  }

  analyzeConditionals() {
    const conditionals = []
    
    walkSimple(this.ast, {
      IfStatement: (node) => {
        conditionals.push({
          type: 'if',
          line: node.loc?.start?.line,
          column: node.loc?.start?.column,
          hasElse: !!node.alternate,
          isElseIf: node.alternate?.type === 'IfStatement',
          complexity: this.calculateConditionalComplexity(node.test)
        })
      },
      ConditionalExpression: (node) => {
        conditionals.push({
          type: 'ternary',
          line: node.loc?.start?.line,
          column: node.loc?.start?.column,
          complexity: this.calculateConditionalComplexity(node.test)
        })
      },
      SwitchStatement: (node) => {
        conditionals.push({
          type: 'switch',
          line: node.loc?.start?.line,
          column: node.loc?.start?.column,
          caseCount: node.cases.length,
          hasDefault: node.cases.some(c => !c.test)
        })
      }
    })

    return conditionals
  }

  calculateComplexity() {
    let complexity = 1 // Base complexity
    
    walkSimple(this.ast, {
      IfStatement: () => complexity++,
      WhileStatement: () => complexity++,
      ForStatement: () => complexity++,
      DoWhileStatement: () => complexity++,
      ForInStatement: () => complexity++,
      ForOfStatement: () => complexity++,
      SwitchCase: (node) => {
        if (node.test) complexity++ // Don't count default case
      },
      ConditionalExpression: () => complexity++,
      LogicalExpression: (node) => {
        if (node.operator === '&&' || node.operator === '||') {
          complexity++
        }
      },
      CatchClause: () => complexity++
    })

    return complexity
  }

  analyzeDependencies() {
    const dependencies = {
      builtins: new Set(),
      globals: new Set(),
      imports: []
    }
    
    walkSimple(this.ast, {
      CallExpression: (node) => {
        if (node.callee.type === 'Identifier') {
          const name = node.callee.name
          if (this.isBuiltinFunction(name)) {
            dependencies.builtins.add(name)
          }
        } else if (node.callee.type === 'MemberExpression') {
          const objectName = node.callee.object.name
          if (this.isGlobalObject(objectName)) {
            dependencies.globals.add(objectName)
          }
        }
      },
      ImportDeclaration: (node) => {
        dependencies.imports.push({
          source: node.source.value,
          specifiers: node.specifiers.map(s => s.local.name)
        })
      }
    })

    return {
      builtins: Array.from(dependencies.builtins),
      globals: Array.from(dependencies.globals),
      imports: dependencies.imports
    }
  }

  generateSuggestions() {
    const suggestions = []
    
    // Check for common issues
    walkSimple(this.ast, {
      VariableDeclaration: (node) => {
        if (node.kind === 'var') {
          suggestions.push({
            type: 'warning',
            message: 'Consider using let or const instead of var',
            line: node.loc?.start?.line,
            severity: 'medium'
          })
        }
      },
      FunctionDeclaration: (node) => {
        if (this.calculateFunctionComplexity(node) > 10) {
          suggestions.push({
            type: 'warning',
            message: `Function '${node.id?.name}' has high complexity. Consider breaking it down.`,
            line: node.loc?.start?.line,
            severity: 'high'
          })
        }
      },
      ForStatement: (node) => {
        if (this.isInfiniteLoop(node)) {
          suggestions.push({
            type: 'error',
            message: 'Potential infinite loop detected',
            line: node.loc?.start?.line,
            severity: 'critical'
          })
        }
      }
    })

    return suggestions
  }

  calculateMetrics() {
    let lines = 0
    let statements = 0
    let expressions = 0
    
    walkFull(this.ast, (node) => {
      if (node.loc) {
        lines = Math.max(lines, node.loc.end.line)
      }
      
      if (this.isStatement(node)) {
        statements++
      }
      
      if (this.isExpression(node)) {
        expressions++
      }
    })

    return {
      linesOfCode: lines,
      statements,
      expressions,
      functions: this.analysis?.functions?.length || 0,
      variables: this.analysis?.variables?.length || 0,
      complexity: this.analysis?.complexity || 0
    }
  }

  // Helper methods
  calculateFunctionComplexity(functionNode) {
    let complexity = 1
    
    walkSimple(functionNode, {
      IfStatement: () => complexity++,
      WhileStatement: () => complexity++,
      ForStatement: () => complexity++,
      SwitchCase: (node) => {
        if (node.test) complexity++
      }
    })

    return complexity
  }

  isRecursiveFunction(functionNode) {
    const functionName = functionNode.id?.name
    if (!functionName) return false
    
    let isRecursive = false
    
    walkSimple(functionNode, {
      CallExpression: (node) => {
        if (node.callee.type === 'Identifier' && node.callee.name === functionName) {
          isRecursive = true
        }
      }
    })

    return isRecursive
  }

  isInfiniteLoop(loopNode) {
    // Simplified infinite loop detection
    if (loopNode.type === 'WhileStatement') {
      return loopNode.test.type === 'Literal' && loopNode.test.value === true
    }
    
    if (loopNode.type === 'ForStatement') {
      return !loopNode.test || (loopNode.test.type === 'Literal' && loopNode.test.value === true)
    }
    
    return false
  }

  calculateConditionalComplexity(testNode) {
    let complexity = 1
    
    walkSimple(testNode, {
      LogicalExpression: () => complexity++,
      BinaryExpression: () => complexity++
    })

    return complexity
  }

  determineScope(node) {
    // Simplified scope determination
    return 'function' // In a real implementation, track scope properly
  }

  isBuiltinFunction(name) {
    const builtins = ['parseInt', 'parseFloat', 'isNaN', 'isFinite', 'setTimeout', 'setInterval']
    return builtins.includes(name)
  }

  isGlobalObject(name) {
    const globals = ['console', 'Math', 'Date', 'Array', 'Object', 'String', 'Number']
    return globals.includes(name)
  }

  isStatement(node) {
    return node.type.endsWith('Statement') || node.type.endsWith('Declaration')
  }

  isExpression(node) {
    return node.type.endsWith('Expression')
  }
}

// Export analyzer functions
export const analyzeCode = async (code) => {
  const analyzer = new CodeAnalyzer()
  return await analyzer.analyze(code)
}

export const getASTFromCode = (code) => {
  try {
    return parse(code, {
      ecmaVersion: 2020,
      sourceType: 'script',
      locations: true,
      ranges: true
    })
  } catch (error) {
    throw new Error(`Failed to parse code: ${error.message}`)
  }
}