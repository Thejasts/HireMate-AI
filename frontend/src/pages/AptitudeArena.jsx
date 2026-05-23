import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Brain, BookOpen, Code, Lightbulb, Users, 
  ChevronRight, ChevronLeft, CheckCircle, Clock, Award, Star, XCircle, Loader2
} from 'lucide-react';

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
      const response = await axios.post('http://localhost:5000/api/aptitude/generate', {
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
      const response = await axios.post('http://localhost:5000/api/aptitude/submit', {
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-3">
          AI Aptitude Arena
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Test your interview readiness with AI-generated aptitude challenges</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">1. Select Challenge Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all ${
                  isSelected 
                    ? `${cat.activeBorder} bg-gray-50 dark:bg-slate-700 shadow-md` 
                    : `border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700`
                }`}
              >
                <div className={`p-2.5 rounded-lg mb-3 ${cat.bg} dark:bg-slate-800 ${cat.color} ${isSelected ? 'ring-1 ring-inset ' + cat.border : ''}`}>
                  <Icon size={24} />
                </div>
                <h4 className={`font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {cat.label}
                </h4>
                {isSelected && (
                  <div className="absolute top-4 right-4 text-primary-600 dark:text-primary-400">
                    <CheckCircle size={20} className="fill-primary-100" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">2. Select Difficulty Level</h3>
        <div className="flex flex-wrap gap-4 mb-10">
          {difficulties.map(diff => (
            <button 
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium border-2 transition-colors ${
                selectedDifficulty === diff 
                  ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
                  : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
          <button 
            onClick={generateQuestions}
            className="inline-flex items-center gap-2 px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Enter Arena <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderLoading = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-6" />
      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Preparing your challenge...</h3>
      <p className="text-gray-500 dark:text-gray-400">Our AI is hand-crafting unique questions just for you.</p>
    </div>
  );

  const renderTest = () => {
    if (!questions.length) return null;
    const currentQ = questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
    const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100;
    
    const isLowTime = timeLeft <= 15;

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              {categories.find(c => c.id === selectedCategory).label}
            </span>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mt-1">
              Question {currentQuestionIndex + 1} <span className="text-gray-500 text-lg font-normal">of {questions.length}</span>
            </h2>
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg ${
            isLowTime ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
          }`}>
            <Clock size={20} /> 00:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Progress Bars */}
        <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full mb-2 overflow-hidden">
          <div className="bg-primary-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="w-full bg-gray-100 dark:bg-slate-800 h-1 rounded-full mb-8 overflow-hidden">
          <div className={`${isLowTime ? 'bg-red-500' : 'bg-green-500'} h-1 rounded-full transition-all duration-1000 linear`} style={{ width: `${timerPercent}%` }}></div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed mb-8">
            {currentQ.question}
          </h3>
          
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = answers[currentQuestionIndex] === option;
              return (
                <button 
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                      : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full border ${
                      isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <CheckCircle size={14} />}
                    </div>
                    <span className="text-base">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} /> Previous
          </button>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <button 
              onClick={() => { setCurrentQuestionIndex(prev => prev + 1); startTimer(); }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={submitTest}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
            >
              <CheckCircle size={18} /> Submit Test
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const renderDashboard = () => {
    if (!dashboardData) return null;
    const { scorePercentage, correctCount, totalCount, xpGained, totalXP, currentStreak, feedback, evaluatedQuestions } = dashboardData;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Performance Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">Detailed analysis of your AI aptitude challenge</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 text-center">
            <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Final Score</h5>
            <div className={`text-4xl font-display font-bold mb-2 ${scorePercentage >= 70 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
              {scorePercentage}%
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{correctCount} out of {totalCount} correct</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 text-center">
            <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">XP Earned</h5>
            <div className="flex items-center justify-center gap-2 text-4xl font-display font-bold text-yellow-500 mb-2">
              <Star fill="currentColor" size={32} /> +{xpGained}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total XP: {totalXP}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 text-center">
            <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Current Streak</h5>
            <div className="flex items-center justify-center gap-2 text-4xl font-display font-bold text-primary-600 dark:text-primary-400 mb-2">
              <Award size={32} /> {currentStreak}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Days. Keep it up!</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-slate-700 pb-4">
            <Brain className="text-primary-500" /> AI Coach Feedback
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h6 className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2 mb-2">
                <CheckCircle size={16}/> Strengths
              </h6>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{feedback.strengths}</p>
            </div>
            <div>
              <h6 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-2">
                <XCircle size={16}/> Areas for Improvement
              </h6>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{feedback.weakAreas}</p>
            </div>
            <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-slate-700">
              <h6 className="text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2 mb-2">
                <Lightbulb size={16}/> Actionable Tips
              </h6>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{feedback.improvementSuggestions}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Question Review</h4>
          <div className="space-y-6">
            {evaluatedQuestions.map((q, idx) => (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6" key={idx}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <h5 className="text-base font-medium text-gray-900 dark:text-white leading-relaxed flex-1">
                    <span className="text-gray-400 mr-2">{idx + 1}.</span> {q.question}
                  </h5>
                  <div className="flex-shrink-0">
                    {q.isCorrect ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Your Answer</p>
                    <div className={`px-4 py-3 rounded-lg border ${q.isCorrect ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
                      {q.userAnswer || 'Skipped'}
                    </div>
                  </div>
                  {!q.isCorrect && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Correct Answer</p>
                      <div className="px-4 py-3 rounded-lg border bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                        {q.correctAnswer}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 border border-gray-100 dark:border-slate-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white font-medium mr-2">Explanation:</strong> 
                    {q.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-4 pb-10">
          <button 
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            onClick={() => setStep('selection')}
          >
            Take Another Challenge
          </button>
        </div>
      </motion.div>
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
