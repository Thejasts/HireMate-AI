import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import hrVideoFile from '../assets/hr_video.mp4';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Play,
  Send,
  Download,
  Eye,
  Settings,
  ShieldAlert,
  Award,
  Clock,
  TrendingUp,
  AlertTriangle,
  MonitorPlay,
  Loader2,
  UserRound,
  Bot,
  BriefcaseBusiness,
  CheckCircle
} from 'lucide-react';
import * as faceapi from 'face-api.js';

const API = 'http://localhost:5000/api';

function InterviewWalkScene({ sessionInfo, interviewEnded, aiThinking, introOnly = false }) {
  if (introOnly) {
    return (
      <div className="relative min-h-[calc(100vh-10rem)] overflow-hidden bg-gradient-to-br from-white via-blue-50 to-slate-50">
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-blue-50 to-transparent" />
        <div className="absolute bottom-20 left-8 right-8 h-3 rounded-full bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200" />

        <motion.div
          className="absolute bottom-[92px] left-[8%] flex flex-col items-center"
          initial={{ x: 0 }}
          animate={{ x: ['0vw', '50vw', '50vw'] }}
          transition={{ duration: 4.4, times: [0, 0.9, 1], ease: 'easeInOut' }}
        >
          <motion.div
            className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-xl shadow-blue-100"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
          >
            <UserRound size={42} />
          </motion.div>
          <motion.div
            className="h-28 w-20 rounded-t-full border border-blue-200 bg-gradient-to-b from-blue-400 to-primary-700 shadow-2xl shadow-blue-100"
            animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="mt-[-8px] flex gap-3">
            <motion.div
              className="h-20 w-6 rounded-full bg-slate-500"
              animate={{ rotate: [10, -12, 10], y: [0, 3, 0] }}
              transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="h-20 w-6 rounded-full bg-slate-600"
              animate={{ rotate: [-12, 10, -12], y: [3, 0, 3] }}
              transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <BriefcaseBusiness className="absolute -right-10 top-28 text-teal-600" size={34} />
        </motion.div>

        <div className="absolute bottom-20 right-[10%] h-[390px] w-[250px] rounded-t-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-100">
          <div className="h-full rounded-t-[1.5rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-slate-100 shadow-inner">
            <div className="absolute right-10 top-1/2 h-5 w-5 rounded-full bg-teal-400 shadow-lg shadow-teal-200" />
            <div className="absolute inset-x-10 top-16 h-px bg-blue-100" />
            <div className="absolute inset-x-10 bottom-16 h-px bg-blue-100" />
          </div>
        </div>
      </div>
    );
  }

  const inInterview = Boolean(sessionInfo) && !interviewEnded;
  const walkTarget = '13.5rem';
  const statusText = interviewEnded
    ? 'Interview completed'
    : inInterview
      ? 'Candidate is giving the interview'
      : aiThinking
        ? 'Preparing interview room'
        : 'Candidate walking to the interview desk';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-52 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-slate-50 shadow-sm"
    >
      <div className="absolute inset-x-6 bottom-10 h-2 rounded-full bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200" />
      <div className="absolute left-4 top-4 rounded-md border border-blue-100 bg-white/85 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          {interviewEnded ? <CheckCircle size={17} className="text-green-500" /> : <MonitorPlay size={17} />}
          {statusText}
        </div>
      </div>

      <motion.div
        className="absolute bottom-[44px] left-5 flex flex-col items-center"
        initial={{ x: 0 }}
        animate={inInterview || interviewEnded ? { x: walkTarget } : { x: ['0rem', walkTarget, walkTarget] }}
        transition={{ duration: inInterview || interviewEnded ? 0.8 : 4.2, times: inInterview || interviewEnded ? undefined : [0, 0.9, 1], ease: 'easeInOut' }}
      >
        <motion.div
          className="mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-md"
          animate={inInterview || interviewEnded ? { y: 0 } : { y: [0, -5, 0] }}
          transition={{ duration: 0.95, repeat: inInterview || interviewEnded ? 0 : Infinity, ease: 'easeInOut' }}
        >
          <UserRound size={24} />
        </motion.div>
        <motion.div
          className="h-14 w-11 rounded-t-full border border-blue-200 bg-gradient-to-b from-blue-400 to-primary-700 shadow-lg shadow-blue-100"
          animate={inInterview || interviewEnded ? { rotate: 0 } : { rotate: [-1, 1, -1] }}
          transition={{ duration: 0.95, repeat: inInterview || interviewEnded ? 0 : Infinity, ease: 'easeInOut' }}
        />
        <div className="mt-[-5px] flex gap-2">
          <motion.div
            className="h-10 w-3.5 rounded-full bg-slate-500"
            animate={inInterview || interviewEnded ? { rotate: 0, y: 0 } : { rotate: [10, -12, 10], y: [0, 2, 0] }}
            transition={{ duration: 0.95, repeat: inInterview || interviewEnded ? 0 : Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="h-10 w-3.5 rounded-full bg-slate-600"
            animate={inInterview || interviewEnded ? { rotate: 0, y: 0 } : { rotate: [-12, 10, -12], y: [2, 0, 2] }}
            transition={{ duration: 0.95, repeat: inInterview || interviewEnded ? 0 : Infinity, ease: 'easeInOut' }}
          />
        </div>
        <BriefcaseBusiness className="absolute -right-7 top-16 text-teal-600" size={25} />
      </motion.div>

      <div className="absolute bottom-9 right-5 w-32 rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-blue-100">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Bot size={16} className="text-primary-600" />
            AI Panel
          </div>
          <motion.span
            className={`h-2.5 w-2.5 rounded-full ${inInterview ? 'bg-green-500' : interviewEnded ? 'bg-blue-500' : 'bg-slate-300'}`}
            animate={inInterview || aiThinking ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, repeat: inInterview || aiThinking ? Infinity : 0 }}
          />
        </div>
        <div className="h-16 rounded-lg border border-blue-100 bg-blue-50 p-2">
          <motion.div
            className="mb-2 h-2 rounded-full bg-primary-300"
            animate={inInterview || aiThinking ? { width: ['35%', '100%', '55%'] } : { width: '55%' }}
            transition={{ duration: 1.2, repeat: inInterview || aiThinking ? Infinity : 0 }}
          />
          <div className="space-y-1.5">
            <div className="h-1.5 rounded-full bg-slate-200" />
            <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
            <div className="h-1.5 w-2/3 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function InterviewRoom() {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reportData, setReportData] = useState(null);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  

  const [jobRoles, setJobRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(1);
  const [interviewType, setInterviewType] = useState('Technical');
  const [questionLimit, setQuestionLimit] = useState(5);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);


  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [eyeContactScore, setEyeContactScore] = useState(100);

  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const aiVideoRef = useRef(null);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroComplete(true), 4300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (aiVideoRef.current) {
      if (aiSpeaking) {
        aiVideoRef.current.currentTime = 0;
        aiVideoRef.current.play().catch(e => console.log("Video play error:", e));
      } else {
        aiVideoRef.current.pause();
      }
    }
  }, [aiSpeaking]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiThinking]);

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    axios.get(`${API}/dashboard/1`).then(res => {
      if (res.data.jobRoles) {
        setJobRoles(res.data.jobRoles);
        if (res.data.jobRoles.length > 0) setSelectedRole(res.data.jobRoles[0].id);
      }
    }).catch(err => console.error(err));

    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models", err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (webcamEnabled) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Webcam error:", err));
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    }
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    }
  }, [webcamEnabled]);

  const handleVideoPlay = () => {
    if (!modelsLoaded || !videoRef.current) return;
    
    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        const detections = await faceapi.detectAllFaces(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        );
        
        if (detections.length > 0) {
          setEyeContactScore(prev => Math.min(100, prev + 2)); 
        } else {
          setEyeContactScore(prev => Math.max(0, prev - 5)); 
        }
      }
    }, 1000);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const startInterview = async () => {
    try {
      setAiThinking(true);
      const res = await axios.post(`${API}/interview/start`, {
        user_id: 1,
        job_role_id: selectedRole,
        interview_type: interviewType
      });
      setSessionInfo(res.data);
      setTimerActive(true);
      setTimer(0);
      setAnsweredCount(0);
      setEyeContactScore(100);
      setAiThinking(false);
      
      addMessage('ai', res.data.question_text);
      speak(res.data.question_text);
    } catch (err) {
      console.error(err);
      setAiThinking(false);
      toast.error('Failed to start interview. Check backend connection.');
    }
  };

  const addMessage = (role, text, metadata = null) => {
    setMessages(prev => [...prev, { role, text, metadata }]);
  };

  const speak = (text) => {
    if (!window.speechSynthesis || interviewEnded) return;
    setAiSpeaking(true);
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voices.length > 0) {
      let targetVoice = voices.find(v => v.name === 'Google US English');
      if (!targetVoice) targetVoice = voices.find(v => v.lang.startsWith('en'));
      
      if (targetVoice) {
        utterance.voice = targetVoice;
      }
    }

    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 
    utterance.onend = () => setAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const submitAnswer = async () => {
    if (!transcript.trim() || !sessionInfo || aiThinking || interviewEnded) return;
    
    if (isListening) toggleListening();
    
    const currentAnswer = transcript;
    addMessage('student', currentAnswer);
    setTranscript('');
    setAiThinking(true);

    try {
      const res = await axios.post(`${API}/interview/analyze-answer`, {
        session_id: sessionInfo.session_id,
        question_id: sessionInfo.question_id,
        student_text_answer: currentAnswer,
        interview_type: interviewType
      });

      setAiThinking(false);
      
      addMessage('ai_feedback', `Score: ${res.data.feedback.overall_score}/10`, res.data.feedback);
      
      const newCount = answeredCount + 1;
      setAnsweredCount(newCount);

      if (questionLimit !== 'Unlimited' && newCount >= parseInt(questionLimit)) {
        endInterview();
      } else {
        setSessionInfo({
          ...sessionInfo,
          question_id: res.data.next_question.question_id
        });

        addMessage('ai', res.data.next_question.question_text);
        speak(res.data.next_question.question_text);
      }

    } catch (err) {
      console.error(err);
      setAiThinking(false);
      toast.error('Failed to analyze answer');
    }
  };

  const endInterview = async () => {
    if (!sessionInfo) return;
    try {
      setAiThinking(true);
      setTimerActive(false);
      if (isListening) toggleListening();
      
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setAiSpeaking(false);

      const res = await axios.post(`${API}/interview/end`, {
        session_id: sessionInfo.session_id,
        eye_contact_score: eyeContactScore
      });
      
      setReportData(res.data);
      setInterviewEnded(true);
      setAiThinking(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to end interview and fetch report');
      setAiThinking(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('interview-report-content');
    if (!element || !window.html2pdf) return;
    const opt = {
      margin:       0.5,
      filename:     `HireMate_AI_Interview_Report_${sessionInfo?.session_id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    window.html2pdf().set(opt).from(element).save();
  };

  if (!introComplete) {
    return (
      <motion.div
        className="flex min-h-[calc(100vh-10rem)] flex-col justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <InterviewWalkScene introOnly />
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)] min-h-[600px]">
      

      <div className="lg:col-span-4 flex flex-col gap-6">
        {!sessionInfo && !interviewEnded && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
            <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Settings size={18}/> Interview Settings
            </h5>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Profile</label>
                <select 
                  className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
                >
                  {jobRoles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Type</label>
                <select 
                  className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={interviewType} onChange={e => setInterviewType(e.target.value)}
                >
                  {['HR', 'Technical', 'DBMS', 'AIML', 'Data Science', 'React JS', 'Node.js', 'System Design', 'Coding', 'Custom'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Questions</label>
                <select 
                  className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={questionLimit} onChange={e => setQuestionLimit(e.target.value)}
                >
                  {[3, 5, 10, 15, 'Unlimited'].map(num => <option key={num} value={num}>{num}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}


        <div className="bg-slate-900 rounded-xl overflow-hidden relative shadow-sm border border-slate-800 flex-1 min-h-[250px] flex flex-col">
          <video 
              ref={aiVideoRef}
              src={hrVideoFile}
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-10"></div>

          {sessionInfo && (
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between items-center z-20">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary-600/80 text-white backdrop-blur-sm border border-primary-500/30">
                {interviewType} • Q{answeredCount + 1}{questionLimit !== 'Unlimited' ? `/${questionLimit}` : ''}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-black/60 text-white backdrop-blur-sm">
                <Clock size={12}/> {formatTime(timer)}
              </span>
            </div>
          )}

          <div className="relative z-20 mt-auto p-4 w-full">
            <h4 className="text-white font-semibold mb-1 text-shadow-sm">AI Coach</h4>
            <p className="text-white/80 text-xs mb-3">
              {aiSpeaking ? 'Speaking...' : aiThinking ? 'Evaluating...' : 'Listening...'}
            </p>

            {aiSpeaking && (
              <div className="flex items-center gap-1 h-6">
                <div className="w-1 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-full"></div>
                <div className="w-1 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.1s] h-4"></div>
                <div className="w-1 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.2s] h-6"></div>
                <div className="w-1 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.3s] h-3"></div>
                <div className="w-1 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s] h-5"></div>
              </div>
            )}
          </div>
        </div>


        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-3 flex flex-col h-[220px] relative">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Camera</span>
            {webcamEnabled && modelsLoaded && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                eyeContactScore > 60 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                eyeContactScore > 30 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                <Eye size={12} /> Focus: {eyeContactScore}%
              </span>
            )}
          </div>
          <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden relative">
            {webcamEnabled ? (
              <video 
                ref={videoRef} 
                onPlay={handleVideoPlay}
                autoPlay muted playsInline 
                className="w-full h-full object-cover transform -scale-x-100" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-400">
                <VideoOff size={32} />
              </div>
            )}
            
            {webcamEnabled && eyeContactScore < 40 && sessionInfo && !interviewEnded && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-600 text-white text-sm font-medium shadow-lg animate-pulse">
                  <ShieldAlert size={16} /> Look at the camera
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setWebcamEnabled(!webcamEnabled)}
            className={`absolute bottom-5 right-5 p-2 rounded-full shadow-md text-white transition-colors ${webcamEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 hover:bg-gray-500'}`}
          >
            {webcamEnabled ? <VideoOff size={18} /> : <Video size={18} />}
          </button>
        </div>

      </div>


      <div className="lg:col-span-8 flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        

        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors ${
                aiSpeaking ? 'bg-primary-50 border-primary-300 text-primary-600' :
                aiThinking ? 'bg-purple-50 border-purple-300 text-purple-600' :
                isListening ? 'bg-green-50 border-green-300 text-green-600' :
                'bg-gray-100 border-gray-200 text-gray-500 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-400'
              }`}>
                <Bot size={20} />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                !sessionInfo ? 'bg-gray-400' :
                aiSpeaking ? 'bg-primary-500 animate-pulse' :
                aiThinking ? 'bg-purple-500' :
                isListening ? 'bg-green-500' :
                'bg-gray-400'
              }`}></div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                AI Interview Coach
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {!sessionInfo ? 'Idle' : aiSpeaking ? 'Speaking...' : aiThinking ? 'Thinking...' : isListening ? 'Listening...' : 'Idle'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!sessionInfo && !interviewEnded && (
              <button 
                onClick={startInterview} disabled={aiThinking}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:bg-gray-400 transition-colors"
              >
                {aiThinking ? <Loader2 size={16} className="animate-spin"/> : <Play size={16}/>} Start Interview
              </button>
            )}
            {sessionInfo && !interviewEnded && (
              <button 
                onClick={endInterview} disabled={aiThinking}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:bg-gray-400 transition-colors"
              >
                End Interview
              </button>
            )}
            {interviewEnded && reportData && (
              <>
                <button 
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-colors"
                >
                  <Play size={16}/> New Interview
                </button>
                <button 
                  onClick={downloadPDF}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none transition-colors"
                >
                  <Download size={16}/> Export Report
                </button>
              </>
            )}
          </div>
        </div>


        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-slate-900/50 space-y-6">
          {interviewEnded && reportData ? (
            <div id="interview-report-content" className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="text-center border-b border-gray-200 dark:border-slate-700 pb-6 mb-6">
                <Award size={48} className="text-primary-500 mx-auto mb-3" />
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Interview Performance Report</h2>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  <span className="inline-flex px-3 py-1 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 text-sm font-medium">Overall Score: {reportData.final_score}/10</span>
                  <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium">Eye Contact: {reportData.eye_contact_score}%</span>
                  <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300 text-sm font-medium">Questions: {reportData.total_questions}</span>
                </div>
              </div>

              <div className="space-y-8">
                {reportData.report && reportData.report.length > 0 ? reportData.report.map((item, idx) => (
                  <div key={idx} className="pb-6 border-b border-gray-100 dark:border-slate-700 last:border-0 last:pb-0">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                      <span className="text-primary-500 mr-2">Q{idx + 1}.</span> {item.question_text}
                    </h5>
                    <div className="pl-4 border-l-4 border-gray-300 dark:border-slate-600 mb-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Your Answer</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{item.student_text_answer}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                        <h6 className="text-xs font-bold text-red-800 dark:text-red-400 flex items-center gap-2 mb-2 uppercase tracking-wide">
                          <AlertTriangle size={14}/> Mistakes
                        </h6>
                        <p className="text-sm text-red-700 dark:text-red-300">{item.ai_feedback_mistakes}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900/30">
                        <h6 className="text-xs font-bold text-green-800 dark:text-green-400 flex items-center gap-2 mb-2 uppercase tracking-wide">
                          <TrendingUp size={14}/> Improvements
                        </h6>
                        <p className="text-sm text-green-700 dark:text-green-300">{item.ai_feedback_improvements}</p>
                      </div>
                    </div>
                    <div className="mt-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                        Score: {item.score}/10
                      </span>
                    </div>
                  </div>
                )) : <p className="text-center text-gray-500">No questions answered.</p>}
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 && !aiThinking && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-600 flex items-center justify-center shadow-sm">
                      <Bot size={32} className="text-primary-500" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-white dark:border-slate-900 bg-gray-400"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hello, I am your AI Interview Coach.</h3>
                  <p className="text-sm max-w-md">Select your preferences on the left and click "Start Interview" to begin your session.</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  key={idx} 
                  className={`flex w-full ${msg.role === 'student' ? 'justify-end' : 'justify-start'} gap-3`}
                >
                  {msg.role !== 'student' && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-sm">
                        <Bot size={16} />
                      </div>
                    </div>
                  )}
                  <div className={`flex flex-col ${msg.role === 'student' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                    {msg.role === 'ai_feedback' ? (
                    <div className="w-full max-w-2xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-2xl rounded-tl-none p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
                          <Award size={16}/> Evaluated Score: {msg.metadata.overall_score}/10
                        </span>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-500 uppercase tracking-wider">Feedback</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg border border-green-100 dark:border-green-800/50">
                          <span className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1">Needs Work</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{msg.metadata.mistakes}</span>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg border border-green-100 dark:border-green-800/50">
                          <span className="block text-xs font-bold text-primary-600 dark:text-primary-400 mb-1">How to Improve</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{msg.metadata.improvements}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`px-5 py-3.5 max-w-[80%] shadow-sm ${
                      msg.role === 'student' 
                        ? 'bg-primary-600 text-white rounded-2xl rounded-br-none' 
                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-none'
                    }`}>
                      <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  )}
                  </div>
                </motion.div>
              ))}

              {aiThinking && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-start">
                  <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>


        {!interviewEnded && (
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 relative">
             {isListening && (
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold shadow-sm border border-red-200 dark:border-red-800/50 animate-pulse">
                 <span className="w-2 h-2 rounded-full bg-red-500"></span> Recording
               </div>
             )}

             <div className="flex items-center gap-2">
               <button 
                 onClick={toggleListening}
                 disabled={!sessionInfo || aiThinking}
                 className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
                   isListening 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
                 } disabled:opacity-50 disabled:cursor-not-allowed`}
               >
                 {isListening ? <MicOff size={20} /> : <Mic size={20} />}
               </button>
               
               <input 
                 type="text" 
                 placeholder={!sessionInfo ? "Start interview first..." : isListening ? "Listening to your voice..." : "Type or speak your answer..."} 
                 value={transcript}
                 onChange={(e) => setTranscript(e.target.value)}
                 disabled={!sessionInfo || aiThinking}
                 onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                 className="flex-1 block w-full px-4 py-3 rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-50 transition-colors"
               />
               
               <button 
                 onClick={submitAnswer} 
                 disabled={!sessionInfo || !transcript || aiThinking}
                 className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
               >
                 <span className="hidden sm:inline">Submit</span> <Send size={18} />
               </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
