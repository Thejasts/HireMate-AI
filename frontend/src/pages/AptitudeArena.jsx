import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Brain, BookOpen, Code, Lightbulb, Users, 
  ChevronRight, ChevronLeft, CheckCircle, Clock, Award, Star, XCircle, Loader2
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const categories = [
  { id: 'quantitative', label: 'Quantitative Aptitude', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', activeBorder: 'border-blue-500' },
  { id: 'logical', label: 'Logical Reasoning', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', activeBorder: 'border-purple-500' },
  { id: 'verbal', label: 'Verbal Ability', icon: BookOpen, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', activeBorder: 'border-yellow-500' },
  { id: 'technical', label: 'Technical MCQs', icon: Code, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200', activeBorder: 'border-indigo-500' },
  { id: 'coding', label: 'Coding Aptitude', icon: Lightbulb, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', activeBorder: 'border-orange-500' },
  { id: 'hr', label: 'HR Situational', icon: Users, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', activeBorder: 'border-green-500' },
];

const difficulties = ['Easy', 'Medium', 'Hard'];
const TIME_PER_QUESTION = 60;

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 }
};

function Panel({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className={`rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg hover:shadow-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-black/20 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function StatCard({ icon, value, label, tone, delay }) {
  return (
    <Panel delay={delay} className="relative overflow-hidden p-5">
      <div className={`absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full ${tone.bgSoft}`} />
      <div className={`relative mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${tone.bg} ${tone.text}`}>
        {icon}
      </div>
      <div className="relative text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="relative mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
    </Panel>
  );
}

export default function AptitudeArena() {
  const [step, setStep] = useState('selection'); // 'selection', 'loading', 'test', 'dashboard'
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  
  const [dashboardData, setDashboardData] = useState(null);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (step === 'test') {
      startTimer();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [step, currentQuestionIndex]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(TIME_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitTest();
    }
  };

  const generateQuestions = async () => {
    setStep('loading');
    try {
      const response = await axios.post(`${API}/aptitude/generate`, {
        category: categories.find(c => c.id === selectedCategory).label,
        difficulty: selectedDifficulty,
        limit: 5
      });
      setQuestions(response.data.questions);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setStep('test');
    } catch (err) {
      console.error(err);
      alert('Failed to generate questions. Please check backend connection.');
      setStep('selection');
    }
  };

  const handleOptionSelect = (option) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));
  };

  const submitTest = async () => {
    setStep('loading');
    clearInterval(timerRef.current);
    
    const answersArray = questions.map((_, idx) => answers[idx] || null);

    try {
      const response = await axios.post(`${API}/aptitude/submit`, {
        user_id: 1,
        category: categories.find(c => c.id === selectedCategory).label,
        difficulty: selectedDifficulty,
        questions,
        answers: answersArray
      });
      setDashboardData(response.data);
      setStep('dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to submit test.');
      setStep('selection');
    }
  };

  const renderSelection = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-8 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 text-center"
      >
        <motion.div
          className="absolute right-8 top-8 h-28 w-28 rounded-full border border-blue-200/70"
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-6 left-12 h-14 w-14 rounded-lg border border-indigo-200 bg-white/50 dark:bg-slate-700/40"
          animate={{ y: [0, -8, 0], rotate: [0, -4, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm dark:border-slate-600 dark:bg-slate-900/60 dark:text-blue-300">
            <Lightbulb size={16} />
            Skill Assessment
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">
            AI Aptitude Arena
          </h1>
          <p className="max-w-xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            Test your interview readiness with AI-generated aptitude challenges customized to your chosen difficulty.
          </p>
        </div>
      </motion.div>

      <Panel delay={0.1} className="p-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">1. Select Challenge Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.05) }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all ${
                  isSelected 
                    ? `${cat.activeBorder} bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 shadow-md transform -translate-y-1` 
                    : `border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700`
                }`}
              >
                <div className={`p-2.5 rounded-lg mb-3 ${cat.bg} dark:bg-slate-800 ${cat.color} ${isSelected ? 'ring-1 ring-inset ' + cat.border : ''}`}>
                  <Icon size={24} />
                </div>
                <h4 className={`font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {cat.label}
                </h4>
                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className={`absolute top-4 right-4 ${cat.color}`}
                  >
                    <CheckCircle size={20} className="fill-current bg-white dark:bg-slate-800 rounded-full" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">2. Select Difficulty Level</h3>
        <div className="flex flex-wrap gap-4 mb-10">
          {difficulties.map((diff, i) => (
            <motion.button 
              key={diff}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (i * 0.05) }}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                selectedDifficulty === diff 
                  ? 'border-primary-600 bg-primary-600 text-white shadow-md transform scale-105' 
                  : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {diff}
            </motion.button>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
          <button 
            onClick={generateQuestions}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:shadow-none"
          >
            Enter Arena <ChevronRight size={20} />
          </button>
        </div>
      </Panel>
    </div>
  );

  const renderLoading = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-[60vh] flex flex-col items-center justify-center text-center"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full blur-xl bg-primary-400/30 animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Preparing your challenge...</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">Our AI is hand-crafting unique questions tailored to your selected difficulty.</p>
    </motion.div>
  );

  const renderTest = () => {
    if (!questions.length) return null;
    const currentQ = questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
    const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100;
    
    const isLowTime = timeLeft <= 15;

    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        <Panel className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 uppercase tracking-wider">
                {categories.find(c => c.id === selectedCategory).label}
              </div>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-1">
                Question {currentQuestionIndex + 1} <span className="text-gray-400 text-xl font-medium">/ {questions.length}</span>
              </h2>
            </div>
            <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-xl transition-colors ${
              isLowTime ? 'bg-red-50 text-red-600 shadow-inner dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-800' : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}>
              <Clock size={22} className={isLowTime ? "animate-pulse" : ""} /> 00:{timeLeft.toString().padStart(2, '0')}
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3 mb-10">
             <div className="flex justify-between text-xs font-semibold text-gray-500">
               <span>Test Progress</span>
               <span>{Math.round(progressPercent)}%</span>
             </div>
             <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
               <motion.div 
                 className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full" 
                 initial={{ width: 0 }}
                 animate={{ width: `${progressPercent}%` }}
                 transition={{ duration: 0.5 }}
               />
             </div>
             <div className="w-full bg-gray-50 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
               <div className={`${isLowTime ? 'bg-red-500' : 'bg-teal-500'} h-1 rounded-full transition-all duration-1000 ease-linear`} style={{ width: `${timerPercent}%` }}></div>
             </div>
          </div>

          {/* Question */}
          <h3 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white leading-relaxed mb-8">
            {currentQ.question}
          </h3>
          
          <div className="space-y-4 mb-8">
            {currentQ.options.map((option, idx) => {
              const isSelected = answers[currentQuestionIndex] === option;
              return (
                <motion.button 
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100 shadow-sm'
                      : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-primary-200 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800'
                    }`}>
                      {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle size={14} /></motion.div>}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-slate-700">
            <button 
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} /> Previous
            </button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <button 
                onClick={() => { setCurrentQuestionIndex(prev => prev - 1 + 2); startTimer(); }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={submitTest}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
              >
                <CheckCircle size={18} /> Submit Test
              </button>
            )}
          </div>
        </Panel>
      </motion.div>
    );
  };

  const renderDashboard = () => {
    if (!dashboardData) return null;
    const { scorePercentage, correctCount, totalCount, xpGained, totalXP, currentStreak, feedback, evaluatedQuestions } = dashboardData;

    const stats = [
      { icon: <CheckCircle size={21} />, value: `${scorePercentage}%`, label: `${correctCount} out of ${totalCount} correct`, tone: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', bgSoft: 'bg-emerald-100/70 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-300' } },
      { icon: <Star size={21} />, value: `+${xpGained}`, label: `Total XP: ${totalXP}`, tone: { bg: 'bg-amber-50 dark:bg-amber-900/30', bgSoft: 'bg-amber-100/70 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-300' } },
      { icon: <Award size={21} />, value: currentStreak, label: 'Day Streak', tone: { bg: 'bg-blue-50 dark:bg-blue-900/30', bgSoft: 'bg-blue-100/70 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-300' } }
    ];

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 shadow-sm dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Award size={16} /> Challenge Complete
          </div>
          <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">Performance Dashboard</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">Detailed analysis of your AI aptitude challenge</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} delay={0.05 * i} />
          ))}
        </div>

        <Panel delay={0.15} className="p-8">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-4">
            <Brain className="text-primary-500" /> AI Coach Feedback
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h6 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-3">
                <CheckCircle size={16}/> Strengths
              </h6>
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30">{feedback.strengths}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <h6 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-3">
                <XCircle size={16}/> Areas for Improvement
              </h6>
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100/50 dark:border-amber-800/30">{feedback.weakAreas}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2 pt-6 border-t border-gray-100 dark:border-slate-700">
              <h6 className="text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2 mb-3">
                <Lightbulb size={16}/> Actionable Tips
              </h6>
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100/50 dark:border-blue-800/30">{feedback.improvementSuggestions}</p>
            </motion.div>
          </div>
        </Panel>

        <div className="pt-4">
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Question Review</h4>
          <div className="space-y-6">
            {evaluatedQuestions.map((q, idx) => (
              <Panel delay={0.2 + (idx * 0.05)} className="p-6 md:p-8" key={idx}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed flex-1">
                    <span className="text-primary-500 font-bold mr-2">Q{idx + 1}.</span> {q.question}
                  </h5>
                  <div className="flex-shrink-0">
                    {q.isCorrect ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        <CheckCircle size={14} className="mr-1.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                        <XCircle size={14} className="mr-1.5" /> Incorrect
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Answer</p>
                    <div className={`px-4 py-3 rounded-lg border-2 ${q.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-300'}`}>
                      {q.userAnswer || 'Skipped'}
                    </div>
                  </div>
                  {!q.isCorrect && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correct Answer</p>
                      <div className="px-4 py-3 rounded-lg border-2 bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300">
                        {q.correctAnswer}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-5 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-400"></div>
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white font-bold mr-2">Explanation:</strong> 
                    {q.explanation}
                  </p>
                </div>
              </Panel>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center pt-8 pb-12"
        >
          <button 
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg shadow-lg shadow-primary-200 dark:shadow-none text-base font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:-translate-y-0.5"
            onClick={() => setStep('selection')}
          >
            Take Another Challenge <ChevronRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === 'selection' && renderSelection()}
        {step === 'loading' && renderLoading()}
        {step === 'test' && renderTest()}
        {step === 'dashboard' && renderDashboard()}
      </AnimatePresence>
    </div>
  );
}
