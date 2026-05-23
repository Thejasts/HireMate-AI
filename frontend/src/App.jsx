import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, MonitorPlay, FileText, LayoutDashboard, Sparkles, Brain, Menu, X } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import InterviewRoom from './pages/InterviewRoom';
import AptitudeArena from './pages/AptitudeArena';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

function NavLinkCustom({ to, icon, label, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-primary-400' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white'
      }`}
    >
      {icon} {label}
    </Link>
  );
}

function AppLayout({ theme, toggleTheme }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-sm group-hover:bg-primary-700 transition-colors">
                  <Sparkles size={16} />
                </div>
                <span className="font-display font-semibold text-lg tracking-tight">
                  HireMate AI
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLinkCustom to="/" icon={<LayoutDashboard size={16} />} label="Dashboard" />
              <NavLinkCustom to="/resume" icon={<FileText size={16} />} label="Resume" />
              <NavLinkCustom to="/aptitude" icon={<Brain size={16} />} label="Aptitude" />
              
              <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>
              
              <Link 
                to="/interview" 
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <MonitorPlay size={16} />
                Interview Room
              </Link>
              
              <button 
                onClick={toggleTheme} 
                className="ml-2 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={toggleTheme} 
                className="mr-2 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <NavLinkCustom to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                <NavLinkCustom to="/resume" icon={<FileText size={18} />} label="Resume" onClick={() => setMobileMenuOpen(false)} />
                <NavLinkCustom to="/aptitude" icon={<Brain size={18} />} label="Aptitude" onClick={() => setMobileMenuOpen(false)} />
                <div className="pt-2">
                  <Link 
                    to="/interview" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <MonitorPlay size={18} />
                    Interview Room
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <Dashboard />
              </motion.div>
            } />
            <Route path="/resume" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <ResumeUpload />
              </motion.div>
            } />
            <Route path="/interview" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <InterviewRoom />
              </motion.div>
            } />
            <Route path="/aptitude" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <AptitudeArena />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if(newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if(theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <AppLayout theme={theme} toggleTheme={toggleTheme} />
    </Router>
  );
}

export default App;
