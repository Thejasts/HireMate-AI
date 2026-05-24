import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Moon,
  Sun,
  MonitorPlay,
  FileText,
  LayoutDashboard,
  Sparkles,
  Brain,
  Menu,
  X,
  DoorOpen,
  UserRound,
  BriefcaseBusiness
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import InterviewRoom from './pages/InterviewRoom';
import AptitudeArena from './pages/AptitudeArena';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

function WelcomeIntro({ onDone }) {
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (!isOpening) return undefined;

    const revealTimer = window.setTimeout(() => {
      onDone();
    }, 1250);

    return () => window.clearTimeout(revealTimer);
  }, [isOpening, onDone]);

  const handleDoorClick = () => {
    if (!isOpening) {
      setIsOpening(true);
    }
  };

  return (
    <motion.section
      className="min-h-screen overflow-hidden bg-white text-slate-950 relative flex items-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.12),transparent_32%),radial-gradient(circle_at_80%_22%,rgba(20,184,166,0.12),transparent_28%),linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#eef6ff_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-blue-50/80 to-transparent" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <motion.div
          className="max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <Sparkles size={16} />
            AI interview preparation
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Welcome to HireMate AI
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600 sm:text-xl">
            Ready to hire? Step into your smart interview room and unlock resume insights,
            aptitude practice, and AI-powered feedback.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-md border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            <DoorOpen size={18} />
            Click the interview room door to enter
          </div>
        </motion.div>

        <div className="relative min-h-[390px] sm:min-h-[480px]">
          <div className="absolute inset-x-0 bottom-10 h-4 rounded-full bg-slate-300/50 blur-md" />
          <motion.div
            className="absolute bottom-14 left-2 right-2 h-3 rounded-full bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200"
            initial={{ scaleX: 0.35, opacity: 0.35 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />

          <motion.div
            className="absolute bottom-[72px] left-[4%] flex flex-col items-center"
            initial={{ x: 0 }}
            animate={{ x: ['0%', '42vw', '42vw'] }}
            transition={{ duration: 5.2, times: [0, 0.9, 1], ease: 'easeInOut' }}
          >
            <motion.div
              className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-blue-700 shadow-lg shadow-blue-100"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut' }}
            >
              <UserRound size={34} />
            </motion.div>
            <motion.div
              className="h-24 w-16 rounded-t-full border border-blue-200 bg-gradient-to-b from-blue-400 to-blue-700 shadow-2xl shadow-blue-100"
              animate={{ rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="mt-[-8px] flex gap-2">
              <motion.div
                className="h-16 w-5 rounded-full bg-slate-200"
                animate={{ rotate: [10, -12, 10], y: [0, 3, 0] }}
                transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="h-16 w-5 rounded-full bg-slate-300"
                animate={{ rotate: [-12, 10, -12], y: [3, 0, 3] }}
                transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <motion.div
              className="absolute right-[-30px] top-[98px] text-teal-600"
              animate={{ rotate: [-7, 7, -7] }}
              transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BriefcaseBusiness size={32} />
            </motion.div>
          </motion.div>

          <button
            type="button"
            onClick={handleDoorClick}
            disabled={isOpening}
            aria-label="Open interview room door"
            className="absolute bottom-[70px] right-[6%] h-[280px] w-[190px] rounded-t-3xl border border-slate-200 bg-white p-3 text-left shadow-2xl shadow-blue-100 transition hover:-translate-y-1 hover:shadow-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-4 focus:ring-offset-white disabled:cursor-wait sm:h-[330px] sm:w-[230px]"
          >
            <div className="absolute -top-12 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-md border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-100">
              <MonitorPlay size={16} />
              Interview Room
            </div>
            <div className="h-full rounded-t-2xl bg-blue-50 p-2 [perspective:900px]">
              <motion.div
                className="relative h-full rounded-t-xl border border-blue-200 bg-gradient-to-br from-white via-blue-50 to-slate-100 shadow-inner"
                animate={isOpening ? { rotateY: -72, x: -22 } : { rotateY: 0, x: 0 }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                style={{ transformOrigin: 'left center' }}
              >
                <div className="absolute right-5 top-1/2 h-4 w-4 rounded-full bg-teal-400 shadow-lg shadow-teal-200" />
                <div className="absolute inset-x-5 top-8 h-px bg-blue-200" />
                <div className="absolute inset-x-5 bottom-8 h-px bg-blue-200" />
              </motion.div>
              <motion.div
                className="absolute inset-7 flex flex-col items-center justify-center rounded-t-xl bg-blue-100/80 text-center text-blue-800"
                initial={{ opacity: 0 }}
                animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.35 }}
              >
                <Sparkles size={38} />
                <span className="mt-3 text-sm font-semibold">Your workspace is ready</span>
              </motion.div>
            </div>
          </button>
        </div>
      </div>
    </motion.section>
  );
}

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
  const [introComplete, setIntroComplete] = useState(false);

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
      <AnimatePresence mode="wait">
        {!introComplete ? (
          <WelcomeIntro key="welcome-intro" onDone={() => setIntroComplete(true)} />
        ) : (
          <AppLayout key="app-layout" theme={theme} toggleTheme={toggleTheme} />
        )}
      </AnimatePresence>
    </Router>
  );
}

export default App;
