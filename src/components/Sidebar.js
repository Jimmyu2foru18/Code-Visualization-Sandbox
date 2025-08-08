'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  BookOpen,
  Lightbulb,
  Code2,
  Zap,
  Target,
  Clock,
  Star,
  Play,
  Download,
  X
} from 'lucide-react'
import { examples } from '../examples/algorithms'
import { useExecutionStore } from '../stores/executionStore'

export default function Sidebar({ isOpen, onToggle }) {
  const [activeSection, setActiveSection] = useState('examples')
  const [expandedFolders, setExpandedFolders] = useState(new Set(['algorithms']))
  const { setCode, recentProjects, addRecentProject, removeRecentProject } = useExecutionStore()

  // Load recent projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentProjects')
    if (saved) {
      const projects = JSON.parse(saved)
      projects.forEach(project => addRecentProject(project))
    }
  }, [])

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const saveToRecent = (name, code) => {
    const newProject = {
      id: Date.now(),
      name,
      code,
      timestamp: new Date().toISOString(),
      preview: code.slice(0, 100) + '...'
    }
    
    addRecentProject(newProject)
  }

  const loadRecentProject = (project) => {
    setCode(project.code)
  }

  const exampleCategories = {
    algorithms: {
      name: 'Algorithms',
      icon: Target,
      items: [
        { name: 'Bubble Sort', description: 'Basic sorting algorithm', key: 'bubbleSort' },
        { name: 'Quick Sort', description: 'Efficient divide-and-conquer sort', key: 'quickSort' },
        { name: 'Binary Search', description: 'Search in sorted arrays', key: 'binarySearch' },
        { name: 'Fibonacci', description: 'Recursive number sequence', key: 'fibonacci' },
        { name: 'Factorial', description: 'Recursive factorial calculation', key: 'factorial' }
      ]
    },
    dataStructures: {
      name: 'Data Structures',
      icon: Code2,
      items: [
        { name: 'Linked List', description: 'Dynamic linear data structure', key: 'linkedList' },
        { name: 'Binary Tree', description: 'Hierarchical data structure', key: 'binaryTree' },
        { name: 'Hash Table', description: 'Key-value mapping', key: 'hashTable' },
        { name: 'Stack & Queue', description: 'LIFO and FIFO structures', key: 'stackQueue' }
      ]
    },
    patterns: {
      name: 'Design Patterns',
      icon: Lightbulb,
      items: [
        { name: 'Observer', description: 'Event notification pattern', key: 'observer' },
        { name: 'Factory', description: 'Object creation pattern', key: 'factory' },
        { name: 'Singleton', description: 'Single instance pattern', key: 'singleton' },
        { name: 'Strategy', description: 'Algorithm selection pattern', key: 'strategy' }
      ]
    },
    performance: {
      name: 'Performance',
      icon: Zap,
      items: [
        { name: 'Time Complexity', description: 'Algorithm efficiency analysis', key: 'timeComplexity' },
        { name: 'Memory Usage', description: 'Space complexity examples', key: 'memoryUsage' },
        { name: 'Optimization', description: 'Code optimization techniques', key: 'optimization' }
      ]
    }
  }

  const tutorials = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of code visualization',
      duration: '5 min',
      difficulty: 'Beginner',
      content: `// Getting Started Tutorial
// Welcome to Code Visualization Sandbox!

// 1. Write your code in the editor
console.log('Hello, World!');

// 2. Click Execute to run your code
let message = 'Code visualization is awesome!';
console.log(message);

// 3. Watch variables and execution flow
for (let i = 0; i < 3; i++) {
  console.log('Step:', i);
}`
    },
    {
      title: 'Understanding Variables',
      description: 'Monitor variable changes in real-time',
      duration: '8 min',
      difficulty: 'Beginner',
      content: `// Variable Tracking Tutorial

// Watch how variables change during execution
let counter = 0;
let result = 1;

// The visualization will show these changes
for (let i = 1; i <= 5; i++) {
  counter++;
  result *= i;
  console.log('Counter:', counter, 'Result:', result);
}

// Objects and arrays are also tracked
let data = { count: 0, items: [] };
data.items.push('item1', 'item2');
data.count = data.items.length;`
    },
    {
      title: 'Function Call Stack',
      description: 'Visualize function calls and returns',
      duration: '10 min',
      difficulty: 'Intermediate',
      content: `// Call Stack Tutorial

// Watch the call stack as functions are called
function factorial(n) {
  console.log('Calculating factorial of', n);
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

function fibonacci(n) {
  console.log('Calculating fibonacci of', n);
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test the functions
console.log('Factorial of 4:', factorial(4));
console.log('Fibonacci of 5:', fibonacci(5));`
    },
    {
      title: 'Performance Analysis',
      description: 'Analyze algorithm performance',
      duration: '12 min',
      difficulty: 'Advanced',
      content: `// Performance Analysis Tutorial

// Compare different sorting algorithms
function bubbleSort(arr) {
  const n = arr.length;
  let comparisons = 0;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  
  console.log('Bubble sort comparisons:', comparisons);
  return arr;
}

function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}

// Test with sample data
const data = [64, 34, 25, 12, 22, 11, 90];
console.log('Original:', data);
console.log('Bubble sorted:', bubbleSort([...data]));
console.log('Quick sorted:', quickSort([...data]));`
    },
    {
      title: 'Memory Visualization',
      description: 'Understanding memory usage patterns',
      duration: '15 min',
      difficulty: 'Advanced',
      content: `// Memory Visualization Tutorial

// Create objects and watch memory allocation
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }
  
  add(value) {
    const newNode = new Node(value);
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.size++;
    console.log('Added node with value:', value);
  }
  
  display() {
    const values = [];
    let current = this.head;
    while (current) {
      values.push(current.value);
      current = current.next;
    }
    console.log('List contents:', values);
  }
}

// Create and populate the list
const list = new LinkedList();
list.add(1);
list.add(2);
list.add(3);
list.display();`
    }
  ]

  const sections = [
    { id: 'examples', label: 'Examples', icon: BookOpen },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'tutorials', label: 'Tutorials', icon: Lightbulb }
  ]

  const loadExample = (category, item) => {
    console.log(`Loading example: ${category}/${item.name}`)
    if (item.key && examples[item.key]) {
      setCode(examples[item.key].code)
      saveToRecent(item.name, examples[item.key].code)
    }
  }

  const loadTutorial = (tutorial) => {
    setCode(tutorial.content)
    saveToRecent(tutorial.title, tutorial.content)
  }

  return (
    <>
      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-80 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex flex-col shadow-lg"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Project Explorer
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggle}
                  className="p-1 text-secondary-500 hover:text-secondary-700 rounded"
                >
                  <ChevronLeft size={18} />
                </motion.button>
              </div>
              
              {/* Section Tabs */}
              <div className="flex mt-3 bg-secondary-100 dark:bg-secondary-700 rounded-lg p-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                        activeSection === section.id
                          ? 'bg-white dark:bg-secondary-600 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-secondary-600 dark:text-secondary-300 hover:text-secondary-800 dark:hover:text-secondary-100'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{section.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {activeSection === 'examples' && (
                <div className="p-4 space-y-3">
                  {Object.entries(exampleCategories).map(([categoryId, category]) => {
                    const CategoryIcon = category.icon
                    const isExpanded = expandedFolders.has(categoryId)
                    
                    return (
                      <div key={categoryId} className="space-y-2">
                        {/* Category Header */}
                        <motion.button
                          whileHover={{ x: 2 }}
                          onClick={() => toggleFolder(categoryId)}
                          className="flex items-center space-x-2 w-full p-2 text-left text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <FolderOpen size={16} className="text-primary-500" />
                          ) : (
                            <Folder size={16} className="text-secondary-400" />
                          )}
                          <CategoryIcon size={16} className="text-secondary-500" />
                          <span className="font-medium">{category.name}</span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-auto"
                          >
                            <ChevronRight size={14} />
                          </motion.div>
                        </motion.button>

                        {/* Category Items */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-6 space-y-1"
                            >
                              {category.items.map((item, index) => (
                                <motion.button
                                  key={index}
                                  whileHover={{ x: 4, backgroundColor: '#f8fafc' }}
                                  onClick={() => loadExample(categoryId, item)}
                                  className="flex items-start space-x-2 w-full p-2 text-left rounded-lg transition-colors group"
                                >
                                  <FileText size={14} className="text-secondary-400 mt-0.5 group-hover:text-primary-500" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-secondary-800 group-hover:text-secondary-900">
                                      {item.name}
                                    </div>
                                    <div className="text-xs text-secondary-500 truncate">
                                      {item.description}
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeSection === 'recent' && (
                <div className="p-4">
                  {recentProjects.length > 0 ? (
                    <div className="space-y-2">
                      {recentProjects.map((project) => (
                        <motion.div
                          key={project.id}
                          whileHover={{ x: 4 }}
                          className="group p-3 border border-secondary-100 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer relative"
                          onClick={() => loadRecentProject(project)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <FileText size={16} className="text-secondary-400 mt-0.5 group-hover:text-primary-500" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-secondary-800 group-hover:text-secondary-900">
                                  {project.name}
                                </div>
                                <div className="text-xs text-secondary-500 truncate">
                                  {project.preview}
                                </div>
                                <div className="text-xs text-secondary-400 mt-1">
                                  {new Date(project.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                removeRecentProject(project.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-secondary-400 hover:text-red-500 transition-all"
                            >
                              <X size={14} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock size={48} className="mx-auto text-secondary-300 mb-3" />
                      <p className="text-secondary-500 text-sm">
                        No recent projects
                      </p>
                      <p className="text-secondary-400 text-xs mt-1">
                        Load an example to get started
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'tutorials' && (
                <div className="p-4">
                  <div className="space-y-3">
                    {tutorials.map((tutorial, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ x: 4 }}
                        onClick={() => loadTutorial(tutorial)}
                        className="flex items-start space-x-3 w-full p-3 text-left text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors border border-secondary-100"
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            tutorial.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                            tutorial.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            <BookOpen size={16} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-secondary-900">{tutorial.title}</div>
                          <div className="text-sm text-secondary-600 mt-1">{tutorial.description}</div>
                          <div className="flex items-center space-x-3 mt-2 text-xs text-secondary-500">
                            <span className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{tutorial.duration}</span>
                            </span>
                            <span className={`px-2 py-1 rounded-full ${
                              tutorial.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                              tutorial.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {tutorial.difficulty}
                            </span>
                          </div>
                        </div>
                        <Play size={16} className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-secondary-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 w-full p-3 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200"
              >
                <Plus size={16} />
                <span className="font-medium">New Project</span>
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle Button (when sidebar is closed) */}
      {!isOpen && (
        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white border border-secondary-200 rounded-lg shadow-lg text-secondary-600 hover:text-secondary-800 hover:bg-secondary-50 transition-colors"
        >
          <ChevronRight size={18} />
        </motion.button>
      )}
    </>
  )
}