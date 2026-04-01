import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 shadow-2xl flex flex-col items-center gap-8 max-w-2xl w-full text-center">
        <div className="flex gap-8 items-center justify-center animate-bounce">
          <a href="https://vite.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="w-24 h-24 hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_2em_#646cffaa]" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="w-24 h-24 hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_2em_#61dafbaa]" alt="React logo" />
          </a>
        </div>
        
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Vite + React + Tailwind CSS
        </h1>
        
        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full font-bold text-lg shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all duration-200"
          >
            Count is {count}
          </button>
          
          <p className="text-gray-300 text-lg">
            Edit <code className="bg-black/30 px-2 py-1 rounded text-pink-400">src/App.jsx</code> and save to test HMR
          </p>
        </div>
        
        <p className="text-sm text-gray-400 mt-4 italic">
          Powering the next generation of eco-friendly digital experiences for Nirmalyam Krafts.
        </p>
      </div>
    </div>
  )
}

export default App
