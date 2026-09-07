import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Home, Compass, Image as ImageIcon, Search } from 'lucide-react';

import Discovery from './pages/Discovery';
import Entertainment from './pages/Entertainment';
import Utility from './pages/Utility';

function App() {
  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-900 text-white">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-gray-800 p-6 flex flex-col h-full border-r border-gray-700 shadow-xl z-10">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              AnimeHub
            </h1>
          </div>
          
          <div className="space-y-4 flex-grow">
            <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
              <Compass className="text-indigo-400" size={20} />
              <span className="font-medium">Discovery & News</span>
            </Link>
            
            <Link to="/fun" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
              <ImageIcon className="text-pink-400" size={20} />
              <span className="font-medium">Entertainment</span>
            </Link>
            
            <Link to="/tools" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
              <Search className="text-green-400" size={20} />
              <span className="font-medium">Scene Search</span>
            </Link>
          </div>
          
          <div className="mt-auto pt-6 border-t border-gray-700 text-xs text-gray-400 text-center">
            Updated Weekly via GitHub Actions
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-900 relative">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
          
          <div className="p-8 relative z-10 min-h-full">
            <Routes>
              <Route path="/" element={<Discovery />} />
              <Route path="/fun" element={<Entertainment />} />
              <Route path="/tools" element={<Utility />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;