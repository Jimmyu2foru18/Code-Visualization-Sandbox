// Example algorithms for the Code Visualization Sandbox

export const examples = {
  fibonacci: {
    title: "Fibonacci Sequence",
    description: "Recursive implementation of the Fibonacci sequence",
    code: `// Fibonacci Sequence - Recursive Implementation
function fibonacci(n) {
  console.log('Computing fibonacci(' + n + ')');
  
  if (n <= 1) {
    console.log('Base case: fibonacci(' + n + ') = ' + n);
    return n;
  }
  
  const result = fibonacci(n - 1) + fibonacci(n - 2);
  console.log('fibonacci(' + n + ') = ' + result);
  return result;
}

// Test the function
const number = 5;
console.log('Starting fibonacci calculation for n = ' + number);
const result = fibonacci(number);
console.log('Final result: fibonacci(' + number + ') = ' + result);`
  },
  
  bubbleSort: {
    title: "Bubble Sort",
    description: "Classic bubble sort algorithm with step-by-step visualization",
    code: `// Bubble Sort Algorithm
function bubbleSort(arr) {
  console.log('Starting bubble sort with array:', arr);
  const n = arr.length;
  let swaps = 0;
  
  for (let i = 0; i < n - 1; i++) {
    console.log('Pass ' + (i + 1) + ' of ' + (n - 1));
    let swapped = false;
    
    for (let j = 0; j < n - i - 1; j++) {
      console.log('Comparing arr[' + j + '] = ' + arr[j] + ' with arr[' + (j + 1) + '] = ' + arr[j + 1]);
      
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        console.log('Swapping ' + arr[j] + ' and ' + arr[j + 1]);
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        swaps++;
        console.log('Array after swap:', [...arr]);
      }
    }
    
    if (!swapped) {
      console.log('No swaps in this pass - array is sorted!');
      break;
    }
  }
  
  console.log('Sorting complete! Total swaps:', swaps);
  return arr;
}

// Test the algorithm
const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log('Original array:', numbers);
const sorted = bubbleSort([...numbers]);
console.log('Sorted array:', sorted);`
  },
  
  binarySearch: {
    title: "Binary Search",
    description: "Efficient binary search algorithm",
    code: `// Binary Search Algorithm
function binarySearch(arr, target) {
  console.log('Searching for ' + target + ' in array:', arr);
  let left = 0;
  let right = arr.length - 1;
  let steps = 0;
  
  while (left <= right) {
    steps++;
    const mid = Math.floor((left + right) / 2);
    console.log('Step ' + steps + ': left=' + left + ', right=' + right + ', mid=' + mid);
    console.log('Checking arr[' + mid + '] = ' + arr[mid]);
    
    if (arr[mid] === target) {
      console.log('Found ' + target + ' at index ' + mid + ' in ' + steps + ' steps!');
      return mid;
    }
    
    if (arr[mid] < target) {
      console.log(arr[mid] + ' < ' + target + ', searching right half');
      left = mid + 1;
    } else {
      console.log(arr[mid] + ' > ' + target + ', searching left half');
      right = mid - 1;
    }
  }
  
  console.log('Target ' + target + ' not found after ' + steps + ' steps');
  return -1;
}

// Test the algorithm
const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
const searchTarget = 7;
console.log('Sorted array:', sortedArray);
const index = binarySearch(sortedArray, searchTarget);
if (index !== -1) {
  console.log('Result: Found at index ' + index);
} else {
  console.log('Result: Not found');
}`
  },
  
  quickSort: {
    title: "Quick Sort",
    description: "Divide and conquer quicksort algorithm",
    code: `// Quick Sort Algorithm
function quickSort(arr, low = 0, high = arr.length - 1) {
  console.log('quickSort called with arr[' + low + '..' + high + ']:', arr.slice(low, high + 1));
  
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    console.log('Pivot placed at index ' + pivotIndex + ', value: ' + arr[pivotIndex]);
    
    // Recursively sort elements before and after partition
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  console.log('Partitioning with pivot: ' + pivot);
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    console.log('Comparing ' + arr[j] + ' with pivot ' + pivot);
    
    if (arr[j] < pivot) {
      i++;
      console.log('Swapping arr[' + i + '] = ' + arr[i] + ' with arr[' + j + '] = ' + arr[j]);
      [arr[i], arr[j]] = [arr[j], arr[i]];
      console.log('Array after swap:', [...arr]);
    }
  }
  
  // Place pivot in correct position
  console.log('Placing pivot at position ' + (i + 1));
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  console.log('Array after pivot placement:', [...arr]);
  
  return i + 1;
}

// Test the algorithm
const unsorted = [10, 7, 8, 9, 1, 5];
console.log('Original array:', unsorted);
const sorted = quickSort([...unsorted]);
console.log('Final sorted array:', sorted);`
  },
  
  factorial: {
    title: "Factorial",
    description: "Recursive factorial calculation",
    code: `// Factorial - Recursive Implementation
function factorial(n) {
  console.log('Computing factorial(' + n + ')');
  
  if (n === 0 || n === 1) {
    console.log('Base case: factorial(' + n + ') = 1');
    return 1;
  }
  
  const result = n * factorial(n - 1);
  console.log('factorial(' + n + ') = ' + n + ' * factorial(' + (n - 1) + ') = ' + result);
  return result;
}

// Test the function
const number = 5;
console.log('Calculating factorial of ' + number);
const result = factorial(number);
console.log('Final result: ' + number + '! = ' + result);`
  },

  // Data Structures
  linkedList: {
    title: "Linked List",
    description: "Dynamic linear data structure implementation",
    code: `// Linked List Implementation
class ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
    console.log('Created node with data:', data);
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
    console.log('Created new LinkedList');
  }

  append(data) {
    console.log('Appending:', data);
    const newNode = new ListNode(data);
    
    if (!this.head) {
      this.head = newNode;
      console.log('Set as head node');
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
      console.log('Appended to end of list');
    }
    this.size++;
    console.log('List size:', this.size);
  }

  display() {
    console.log('Displaying list:');
    let current = this.head;
    const values = [];
    
    while (current) {
      values.push(current.data);
      current = current.next;
    }
    
    console.log('List contents:', values.join(' -> '));
    return values;
  }
}

// Test the linked list
const list = new LinkedList();
list.append(1);
list.append(2);
list.append(3);
list.display();`
  },

  binaryTree: {
    title: "Binary Tree",
    description: "Hierarchical data structure with tree traversal",
    code: `// Binary Tree Implementation
class TreeNode {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
    console.log('Created tree node with data:', data);
  }
}

class BinaryTree {
  constructor() {
    this.root = null;
    console.log('Created new Binary Tree');
  }

  insert(data) {
    console.log('Inserting:', data);
    const newNode = new TreeNode(data);
    
    if (!this.root) {
      this.root = newNode;
      console.log('Set as root node');
      return;
    }
    
    this.insertNode(this.root, newNode);
  }

  insertNode(node, newNode) {
    if (newNode.data < node.data) {
      console.log('Going left from', node.data);
      if (!node.left) {
        node.left = newNode;
        console.log('Inserted', newNode.data, 'as left child of', node.data);
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      console.log('Going right from', node.data);
      if (!node.right) {
        node.right = newNode;
        console.log('Inserted', newNode.data, 'as right child of', node.data);
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }

  inorderTraversal(node = this.root, result = []) {
    if (node) {
      this.inorderTraversal(node.left, result);
      console.log('Visiting node:', node.data);
      result.push(node.data);
      this.inorderTraversal(node.right, result);
    }
    return result;
  }
}

// Test the binary tree
const tree = new BinaryTree();
tree.insert(5);
tree.insert(3);
tree.insert(7);
tree.insert(1);
tree.insert(9);
console.log('Inorder traversal:', tree.inorderTraversal());`
  },

  hashTable: {
    title: "Hash Table",
    description: "Key-value mapping with hash function",
    code: `// Hash Table Implementation
class HashTable {
  constructor(size = 10) {
    this.size = size;
    this.buckets = new Array(size).fill(null).map(() => []);
    console.log('Created hash table with size:', size);
  }

  hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash += key.charCodeAt(i);
    }
    const index = hash % this.size;
    console.log('Hash of "' + key + '" = ' + index);
    return index;
  }

  set(key, value) {
    console.log('Setting:', key, '=', value);
    const index = this.hash(key);
    const bucket = this.buckets[index];
    
    // Check if key already exists
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        console.log('Key exists, updating value');
        bucket[i][1] = value;
        return;
      }
    }
    
    // Add new key-value pair
    bucket.push([key, value]);
    console.log('Added to bucket', index);
  }

  get(key) {
    console.log('Getting value for key:', key);
    const index = this.hash(key);
    const bucket = this.buckets[index];
    
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        console.log('Found:', bucket[i][1]);
        return bucket[i][1];
      }
    }
    
    console.log('Key not found');
    return undefined;
  }
}

// Test the hash table
const hashTable = new HashTable(5);
hashTable.set('name', 'John');
hashTable.set('age', 30);
hashTable.set('city', 'New York');
console.log('Name:', hashTable.get('name'));
console.log('Age:', hashTable.get('age'));`
  },

  stackQueue: {
    title: "Stack & Queue",
    description: "LIFO and FIFO data structures",
    code: `// Stack and Queue Implementation
class Stack {
  constructor() {
    this.items = [];
    console.log('Created new Stack (LIFO)');
  }

  push(item) {
    console.log('Pushing to stack:', item);
    this.items.push(item);
    console.log('Stack contents:', this.items);
  }

  pop() {
    if (this.isEmpty()) {
      console.log('Stack is empty!');
      return null;
    }
    const item = this.items.pop();
    console.log('Popped from stack:', item);
    console.log('Stack contents:', this.items);
    return item;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

class Queue {
  constructor() {
    this.items = [];
    console.log('Created new Queue (FIFO)');
  }

  enqueue(item) {
    console.log('Enqueuing to queue:', item);
    this.items.push(item);
    console.log('Queue contents:', this.items);
  }

  dequeue() {
    if (this.isEmpty()) {
      console.log('Queue is empty!');
      return null;
    }
    const item = this.items.shift();
    console.log('Dequeued from queue:', item);
    console.log('Queue contents:', this.items);
    return item;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

// Test Stack
console.log('=== Testing Stack ===');
const stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
stack.pop();
stack.pop();

// Test Queue
console.log('=== Testing Queue ===');
const queue = new Queue();
queue.enqueue('A');
queue.enqueue('B');
queue.enqueue('C');
queue.dequeue();
queue.dequeue();`
  },

  // Design Patterns
  observer: {
    title: "Observer Pattern",
    description: "Event notification pattern implementation",
    code: `// Observer Pattern Implementation
class Subject {
  constructor() {
    this.observers = [];
    console.log('Created Subject');
  }

  addObserver(observer) {
    console.log('Adding observer:', observer.name);
    this.observers.push(observer);
  }

  removeObserver(observer) {
    console.log('Removing observer:', observer.name);
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(data) {
    console.log('Notifying all observers with data:', data);
    this.observers.forEach(observer => {
      observer.update(data);
    });
  }
}

class Observer {
  constructor(name) {
    this.name = name;
    console.log('Created Observer:', name);
  }

  update(data) {
    console.log(this.name + ' received update:', data);
  }
}

// Test the Observer pattern
const subject = new Subject();
const observer1 = new Observer('Observer 1');
const observer2 = new Observer('Observer 2');

subject.addObserver(observer1);
subject.addObserver(observer2);

subject.notify('Hello Observers!');
subject.notify('Second notification');`
  },

  factory: {
    title: "Factory Pattern",
    description: "Object creation pattern",
    code: `// Factory Pattern Implementation
class Animal {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    console.log('Created', type + ':', name);
  }

  speak() {
    console.log(this.name + ' makes a sound');
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name, 'Dog');
  }

  speak() {
    console.log(this.name + ' barks: Woof!');
  }
}

class Cat extends Animal {
  constructor(name) {
    super(name, 'Cat');
  }

  speak() {
    console.log(this.name + ' meows: Meow!');
  }
}

class AnimalFactory {
  static createAnimal(type, name) {
    console.log('Factory creating', type, 'named', name);
    
    switch (type.toLowerCase()) {
      case 'dog':
        return new Dog(name);
      case 'cat':
        return new Cat(name);
      default:
        console.log('Unknown animal type:', type);
        return new Animal(name, 'Unknown');
    }
  }
}

// Test the Factory pattern
const dog = AnimalFactory.createAnimal('dog', 'Buddy');
const cat = AnimalFactory.createAnimal('cat', 'Whiskers');

dog.speak();
cat.speak();`
  },

  singleton: {
    title: "Singleton Pattern",
    description: "Single instance pattern",
    code: `// Singleton Pattern Implementation
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      console.log('Returning existing instance');
      return DatabaseConnection.instance;
    }
    
    console.log('Creating new database connection');
    this.connected = false;
    this.connectionId = Math.random().toString(36).substr(2, 9);
    DatabaseConnection.instance = this;
  }

  connect() {
    if (!this.connected) {
      console.log('Connecting to database with ID:', this.connectionId);
      this.connected = true;
    } else {
      console.log('Already connected with ID:', this.connectionId);
    }
  }

  disconnect() {
    if (this.connected) {
      console.log('Disconnecting from database');
      this.connected = false;
    } else {
      console.log('Already disconnected');
    }
  }

  getStatus() {
    console.log('Connection status:', this.connected ? 'Connected' : 'Disconnected');
    console.log('Connection ID:', this.connectionId);
  }
}

// Test the Singleton pattern
console.log('Creating first connection:');
const db1 = new DatabaseConnection();
db1.connect();
db1.getStatus();

console.log('\nCreating second connection:');
const db2 = new DatabaseConnection();
db2.getStatus();

console.log('\nAre they the same instance?', db1 === db2);`
  },

  strategy: {
    title: "Strategy Pattern",
    description: "Algorithm selection pattern",
    code: `// Strategy Pattern Implementation
class SortStrategy {
  sort(data) {
    throw new Error('Sort method must be implemented');
  }
}

class BubbleSortStrategy extends SortStrategy {
  sort(data) {
    console.log('Using Bubble Sort strategy');
    const arr = [...data];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    
    console.log('Bubble sort result:', arr);
    return arr;
  }
}

class QuickSortStrategy extends SortStrategy {
  sort(data) {
    console.log('Using Quick Sort strategy');
    const arr = [...data];
    
    const quickSort = (arr, low = 0, high = arr.length - 1) => {
      if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
      }
    };
    
    const partition = (arr, low, high) => {
      const pivot = arr[high];
      let i = low - 1;
      
      for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      return i + 1;
    };
    
    quickSort(arr);
    console.log('Quick sort result:', arr);
    return arr;
  }
}

class SortContext {
  constructor(strategy) {
    this.strategy = strategy;
    console.log('Created sort context with strategy:', strategy.constructor.name);
  }

  setStrategy(strategy) {
    console.log('Changing strategy to:', strategy.constructor.name);
    this.strategy = strategy;
  }

  executeSort(data) {
    console.log('Executing sort on data:', data);
    return this.strategy.sort(data);
  }
}

// Test the Strategy pattern
const data = [64, 34, 25, 12, 22, 11, 90];

const context = new SortContext(new BubbleSortStrategy());
context.executeSort(data);

context.setStrategy(new QuickSortStrategy());
context.executeSort(data);`
  },

  // Performance Examples
  timeComplexity: {
    title: "Time Complexity Analysis",
    description: "Comparing algorithm efficiency",
    code: `// Time Complexity Analysis
function measureTime(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();
  const time = end - start;
  console.log('Execution time:', time.toFixed(4), 'ms');
  return { result, time };
}

// O(1) - Constant Time
function constantTime(arr, index) {
  console.log('=== O(1) Constant Time ===');
  console.log('Accessing element at index', index);
  return arr[index];
}

// O(n) - Linear Time
function linearTime(arr, target) {
  console.log('=== O(n) Linear Time ===');
  console.log('Linear search for', target);
  
  for (let i = 0; i < arr.length; i++) {
    console.log('Checking index', i, ':', arr[i]);
    if (arr[i] === target) {
      console.log('Found at index', i);
      return i;
    }
  }
  
  console.log('Not found');
  return -1;
}

// O(n²) - Quadratic Time
function quadraticTime(arr) {
  console.log('=== O(n²) Quadratic Time ===');
  console.log('Finding all pairs in array');
  const pairs = [];
  
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      const pair = [arr[i], arr[j]];
      console.log('Pair:', pair);
      pairs.push(pair);
    }
  }
  
  return pairs;
}

// Test with different input sizes
const smallArray = [1, 2, 3, 4, 5];
const largeArray = Array.from({length: 10}, (_, i) => i + 1);

console.log('Testing with small array:', smallArray);
measureTime(constantTime, smallArray, 2);
measureTime(linearTime, smallArray, 4);
measureTime(quadraticTime, smallArray);

console.log('\nTesting with larger array:', largeArray);
measureTime(constantTime, largeArray, 5);
measureTime(linearTime, largeArray, 8);`
  },

  memoryUsage: {
    title: "Memory Usage Analysis",
    description: "Space complexity examples",
    code: `// Memory Usage Analysis
function analyzeMemory(description, func) {
  console.log('=== ' + description + ' ===');
  
  // Simulate memory tracking
  let memoryUsed = 0;
  
  const trackMemory = (size, description) => {
    memoryUsed += size;
    console.log('Allocated', size, 'units for', description);
    console.log('Total memory used:', memoryUsed, 'units');
  };
  
  return func(trackMemory);
}

// O(1) Space - Constant Space
function constantSpace(trackMemory) {
  console.log('Swapping two variables in-place');
  let a = 5;
  let b = 10;
  
  trackMemory(2, 'variables a and b');
  
  console.log('Before swap: a =', a, ', b =', b);
  
  // Swap without extra space
  a = a + b;
  b = a - b;
  a = a - b;
  
  console.log('After swap: a =', a, ', b =', b);
  console.log('Space complexity: O(1)');
}

// O(n) Space - Linear Space
function linearSpace(trackMemory) {
  console.log('Creating array copy');
  const original = [1, 2, 3, 4, 5];
  
  trackMemory(original.length, 'original array');
  
  const copy = [];
  trackMemory(original.length, 'copy array');
  
  for (let i = 0; i < original.length; i++) {
    copy[i] = original[i];
    console.log('Copied element', original[i], 'to index', i);
  }
  
  console.log('Original:', original);
  console.log('Copy:', copy);
  console.log('Space complexity: O(n)');
}

// O(n²) Space - Quadratic Space
function quadraticSpace(trackMemory) {
  console.log('Creating 2D matrix');
  const size = 4;
  const matrix = [];
  
  trackMemory(size * size, '2D matrix');
  
  for (let i = 0; i < size; i++) {
    matrix[i] = [];
    for (let j = 0; j < size; j++) {
      matrix[i][j] = i * size + j;
      console.log('Set matrix[' + i + '][' + j + '] =', matrix[i][j]);
    }
  }
  
  console.log('Matrix created:', matrix);
  console.log('Space complexity: O(n²)');
}

// Test different space complexities
analyzeMemory('Constant Space Example', constantSpace);
analyzeMemory('Linear Space Example', linearSpace);
analyzeMemory('Quadratic Space Example', quadraticSpace);`
  },

  optimization: {
    title: "Code Optimization Techniques",
    description: "Performance optimization examples",
    code: `// Code Optimization Techniques

// Memoization - Optimizing recursive functions
function createMemoizedFibonacci() {
  console.log('=== Memoization Optimization ===');
  const cache = {};
  let cacheHits = 0;
  let calculations = 0;
  
  function fibonacci(n) {
    if (n in cache) {
      cacheHits++;
      console.log('Cache hit for fibonacci(' + n + ') =', cache[n]);
      return cache[n];
    }
    
    calculations++;
    console.log('Calculating fibonacci(' + n + ')');
    
    if (n <= 1) {
      cache[n] = n;
      return n;
    }
    
    const result = fibonacci(n - 1) + fibonacci(n - 2);
    cache[n] = result;
    console.log('Cached fibonacci(' + n + ') =', result);
    return result;
  }
  
  return { fibonacci, getStats: () => ({ cacheHits, calculations }) };
}

// Loop Optimization - Reducing iterations
function optimizedSearch() {
  console.log('=== Loop Optimization ===');
  const data = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const target = 13;
  
  console.log('Searching for', target, 'in:', data);
  
  // Optimized: Binary search instead of linear
  let left = 0;
  let right = data.length - 1;
  let steps = 0;
  
  while (left <= right) {
    steps++;
    const mid = Math.floor((left + right) / 2);
    console.log('Step', steps + ': checking index', mid, '=', data[mid]);
    
    if (data[mid] === target) {
      console.log('Found in', steps, 'steps (vs', data.length, 'for linear)');
      return mid;
    }
    
    if (data[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// Memory Optimization - Object pooling
function objectPooling() {
  console.log('=== Object Pooling ===');
  
  class ObjectPool {
    constructor() {
      this.pool = [];
      this.created = 0;
      this.reused = 0;
    }
    
    getObject() {
      if (this.pool.length > 0) {
        this.reused++;
        const obj = this.pool.pop();
        console.log('Reused object from pool. Reused:', this.reused);
        return obj;
      } else {
        this.created++;
        const obj = { id: this.created, data: null };
        console.log('Created new object. Created:', this.created);
        return obj;
      }
    }
    
    returnObject(obj) {
      obj.data = null; // Reset object
      this.pool.push(obj);
      console.log('Returned object to pool. Pool size:', this.pool.length);
    }
    
    getStats() {
      return { created: this.created, reused: this.reused, poolSize: this.pool.length };
    }
  }
  
  const pool = new ObjectPool();
  
  // Simulate object usage
  const obj1 = pool.getObject();
  const obj2 = pool.getObject();
  
  pool.returnObject(obj1);
  
  const obj3 = pool.getObject(); // Should reuse obj1
  
  console.log('Pool stats:', pool.getStats());
}

// Test optimizations
const memoFib = createMemoizedFibonacci();
console.log('Memoized fibonacci(10):', memoFib.fibonacci(10));
console.log('Stats:', memoFib.getStats());

optimizedSearch();
objectPooling();`
  }
};

export default examples;