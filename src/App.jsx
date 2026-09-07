import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Compass, Layers, Image as ImageIcon, Search, Menu, X, Newspaper } from 'lucide-react';

import Discovery from './pages/Discovery';
import Categories from './pages/Categories';
import News from './pages/News';
import Entertainment from './pages/Entertainment';
import Utility from './pages/Utility';

const ScrollToTop = ({ mainRef }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, mainRef]);
  return null;
};

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainRef = useRef(null);
  const location = useLocation();

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const desktopNavLinkClass = ({ isActive }) =>
    `flex items-center space-x-3 p-3 rounded-xl transition-all ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-medium'
        : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
    }`;

  const mobileDrawerLinkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl text-base transition-all ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md font-semibold'
        : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
    }`;

  const mobileBottomTabClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? 'text-indigo-400 font-semibold'
        : 'text-gray-400 hover:text-gray-200'
    }`;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white overflow-hidden">
      <ScrollToTop mainRef={mainRef} />

      {/* Mobile Top App Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 md:hidden">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/40">
            <span className="font-bold text-sm">A</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            AnimeHub
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Slide-Out Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-4/5 max-w-xs bg-gray-800 border-r border-gray-700 p-6 flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40">
                  <span className="font-bold text-base">A</span>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  AnimeHub
                </h1>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-2 flex-grow">
              <NavLink to="/" className={mobileDrawerLinkClass}>
                <Compass className="text-indigo-400" size={20} />
                <span>Discovery</span>
              </NavLink>

              <NavLink to="/categories" className={mobileDrawerLinkClass}>
                <Layers className="text-amber-400" size={20} />
                <span>Categories</span>
              </NavLink>

              <NavLink to="/news" className={mobileDrawerLinkClass}>
                <Newspaper className="text-rose-400" size={20} />
                <span>Daily News</span>
              </NavLink>

              <NavLink to="/fun" className={mobileDrawerLinkClass}>
                <ImageIcon className="text-pink-400" size={20} />
                <span>Entertainment</span>
              </NavLink>

              <NavLink to="/tools" className={mobileDrawerLinkClass}>
                <Search className="text-green-400" size={20} />
                <span>Scene Search</span>
              </NavLink>
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-700 text-xs text-gray-400 text-center">
              <p className="font-medium text-gray-300">AnimeHub Mobile</p>
              <p className="mt-1">News updated daily • Catalog weekly</p>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex md:w-64 bg-gray-800 p-6 flex-col h-full border-r border-gray-700 shadow-xl z-10 shrink-0">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <span className="font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            AnimeHub
          </h1>
        </div>
        
        <div className="space-y-2 flex-grow">
          <NavLink to="/" className={desktopNavLinkClass}>
            <Compass className="text-indigo-400" size={20} />
            <span>Discovery</span>
          </NavLink>
          
          <NavLink to="/categories" className={desktopNavLinkClass}>
            <Layers className="text-amber-400" size={20} />
            <span>Categories</span>
          </NavLink>

          <NavLink to="/news" className={desktopNavLinkClass}>
            <Newspaper className="text-rose-400" size={20} />
            <span>Daily News</span>
          </NavLink>

          <NavLink to="/fun" className={desktopNavLinkClass}>
            <ImageIcon className="text-pink-400" size={20} />
            <span>Entertainment</span>
          </NavLink>
          
          <NavLink to="/tools" className={desktopNavLinkClass}>
            <Search className="text-green-400" size={20} />
            <span>Scene Search</span>
          </NavLink>
        </div>
        
        <div className="mt-auto pt-6 border-t border-gray-700 text-xs text-gray-400 text-center">
          <div className="flex items-center justify-center gap-1.5 text-rose-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>News Updated Daily</span>
          </div>
          Catalog Updated Weekly
        </div>
      </nav>

      {/* Main Content Area */}
      <main 
        ref={mainRef}
        className="flex-1 overflow-y-auto bg-gray-900 relative"
      >
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
        
        <div className="p-4 sm:p-6 md:p-8 pb-28 md:pb-8 relative z-10 min-h-full max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Discovery />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/news" element={<News />} />
            <Route path="/fun" element={<Entertainment />} />
            <Route path="/tools" element={<Utility />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Tab Bar (App-style navigation for thumb access) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 px-1 py-2 flex justify-around items-center shadow-2xl">
        <NavLink to="/" className={mobileBottomTabClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-full transition-transform ${isActive ? 'scale-110' : ''}`}>
                <Compass size={19} className={isActive ? 'text-indigo-400' : 'text-gray-400'} />
              </div>
              <span className="text-[10px] mt-0.5">Discovery</span>
            </>
          )}
        </NavLink>

        <NavLink to="/categories" className={mobileBottomTabClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-full transition-transform ${isActive ? 'scale-110' : ''}`}>
                <Layers size={19} className={isActive ? 'text-amber-400' : 'text-gray-400'} />
              </div>
              <span className="text-[10px] mt-0.5">Categories</span>
            </>
          )}
        </NavLink>

        <NavLink to="/news" className={mobileBottomTabClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-full transition-transform ${isActive ? 'scale-110' : ''}`}>
                <Newspaper size={19} className={isActive ? 'text-rose-400' : 'text-gray-400'} />
              </div>
              <span className="text-[10px] mt-0.5">News</span>
            </>
          )}
        </NavLink>

        <NavLink to="/fun" className={mobileBottomTabClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-full transition-transform ${isActive ? 'scale-110' : ''}`}>
                <ImageIcon size={19} className={isActive ? 'text-pink-400' : 'text-gray-400'} />
              </div>
              <span className="text-[10px] mt-0.5">Fun</span>
            </>
          )}
        </NavLink>

        <NavLink to="/tools" className={mobileBottomTabClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-full transition-transform ${isActive ? 'scale-110' : ''}`}>
                <Search size={19} className={isActive ? 'text-green-400' : 'text-gray-400'} />
              </div>
              <span className="text-[10px] mt-0.5">Search</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
