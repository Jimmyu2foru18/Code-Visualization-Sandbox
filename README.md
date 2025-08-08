# Code Visualization Sandbox

A powerful, interactive code visualization and execution environment built with Next.js, React, and modern web technologies. This sandbox allows developers to write, execute, and visualize JavaScript code with real-time insights into execution flow, memory usage, call stacks, and performance metrics.

## Features

### Core Functionality
- **Interactive Code Editor**: Monaco Editor with syntax highlighting, auto-completion, and error detection
- **Real-time Code Execution**: Step-by-step code execution with visualization
- **Memory Management Visualization**: Track memory allocation and usage patterns
- **Call Stack Analysis**: Visualize function calls and execution context
- **Performance Metrics**: Monitor execution time, memory usage, and optimization insights

### User Interface
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Dark/Light Mode**: Toggle between themes for comfortable coding
- **Sidebar Navigation**: Easy access to examples, recent projects, and tutorials
- **Tabbed Interface**: Switch between visualization, memory, call stack, and performance views
- **Mobile Responsive**: Works seamlessly across desktop and mobile devices

### Project Management
- **New Project Creation**: Start fresh projects with customizable templates
- **Recent Projects**: Automatic tracking and quick access to recent work
- **Export/Import**: Save and share code projects
- **Example Library**: Pre-built algorithms and data structures for learning

### Execution Controls
- **Play/Pause/Reset**: Full control over code execution
- **Step-by-Step Debugging**: Execute code line by line
- **Speed Control**: Adjust execution speed (Slow, Normal, Fast, Turbo)
- **Variable Tracking**: Monitor variable values in real-time
- **Breakpoint Support**: Set breakpoints for detailed debugging

### Educational Features
- **Algorithm Examples**: Bubble sort, quick sort, binary search, and more
- **Data Structure Demos**: Arrays, linked lists, trees, and graphs
- **Performance Tutorials**: Learn optimization techniques
- **Interactive Learning**: Hands-on coding with immediate feedback

## Technology Stack

- **Frontend Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with Hooks
- **Styling**: Tailwind CSS for responsive design
- **Code Editor**: Monaco Editor (VS Code editor)
- **Animations**: Framer Motion for smooth interactions
- **State Management**: Zustand for lightweight state management
- **Visualization**: D3.js for data visualization
- **Icons**: Lucide React for consistent iconography

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd code-visualization-sandbox
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## Usage

### Getting Started
1. **Load an Example**: Click on the sidebar to browse algorithm examples
2. **Write Code**: Use the Monaco editor to write or modify JavaScript code
3. **Execute**: Click the "Execute" button to run your code
4. **Visualize**: Watch the execution flow in real-time
5. **Analyze**: Check memory usage, call stack, and performance metrics

### Keyboard Shortcuts
- `Ctrl + Enter`: Execute code
- `Ctrl + R`: Reset execution
- `F10`: Step forward
- `Ctrl + S`: Save project
- `Ctrl + /`: Toggle comments

### Example Algorithms
- **Sorting**: Bubble Sort, Quick Sort, Merge Sort
- **Searching**: Binary Search, Linear Search
- **Recursion**: Fibonacci, Factorial
- **Data Structures**: Linked Lists, Binary Trees
- **Graph Algorithms**: DFS, BFS

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Main application page
├── components/            # React components
│   ├── Header.js          # Navigation header
│   ├── Sidebar.js         # Sidebar with examples
│   ├── CodeEditor.js      # Monaco code editor
│   ├── VisualizationPanel.js  # Execution visualization
│   ├── MemoryVisualization.js # Memory usage display
│   ├── CallStackVisualization.js # Call stack viewer
│   ├── PerformanceMetrics.js  # Performance dashboard
│   └── StatusBar.js       # Bottom status bar
├── stores/                # State management
│   └── executionStore.js  # Zustand store
├── services/              # Business logic
│   ├── codeAnalyzer.js    # Code analysis engine
│   └── codeExecutor.js    # Code execution engine
├── examples/              # Example algorithms
│   └── algorithms.js      # Algorithm library
└── visualizations/        # D3.js visualizations
```

## Configuration

### Environment Variables
Create a `.env.local` file for environment-specific settings:
```env
NEXT_PUBLIC_APP_NAME="Code Visualization Sandbox"
NEXT_PUBLIC_VERSION="1.0.0"
```

### Customization
- **Themes**: Modify `tailwind.config.js` for custom colors
- **Examples**: Add new algorithms in `src/examples/algorithms.js`
- **Visualizations**: Create custom D3.js visualizations in `src/visualizations/`

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with each push

### Other Platforms
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

---
