import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Mic, MicOff, Send, Play, Loader2, Users, Bot, Hand,
  Award, BarChart2, CheckCircle, ShieldAlert, Video
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API = 'http://localhost:5000/api';

// To prevent Chrome Garbage Collection of SpeechSynthesisUtterance
window.speechUtterances = window.speechUtterances || [];

const getAvatarImage = (name) => {
  if (name === 'AI Moderator') return '/avatars/mod.png';
  if (name === 'Participant 1') return '/avatars/p1.png';
  if (name === 'Participant 2') return '/avatars/p2.png';
  if (name === 'Participant 3') return '/avatars/p3.png';
  return null;
};

const ParticipantTile = ({ name, role, isUser, isSpeaking, isQueued, stream, videoRef, className = '' }) => {
  const avatarImg = getAvatarImage(name);
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-900 flex flex-col justify-end border-4 transition-all duration-300 ${className} ${
       isSpeaking ? 'border-primary-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] z-10' : 'border-slate-800'
    }`}>
       {isUser ? (
         <>
           <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${!stream ? 'hidden' : ''}`} />
           {!stream && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
               <Video size={48} className="text-gray-600 opacity-50" />
             </div>
           )}
         </>
       ) : (
         <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
           {avatarImg ? (
             <img src={avatarImg} alt={name} className="w-full h-full object-cover opacity-80" />
           ) : (
             <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${getAvatarColor(name)} shadow-lg`}>
               <Bot size={48} />
             </div>
           )}
         </div>
       )}
       
       <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-2">
          {isSpeaking && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          <span className="text-white text-sm font-medium">{name} {role ? <span className="text-xs text-gray-400 font-normal">({role})</span> : null}</span>
       </div>

       {isQueued && (
         <div className="absolute top-4 right-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 animate-bounce">
           <span className="text-xl">✋</span>
         </div>
       )}
    </div>
  );
};

export default function GroupDiscussion() {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [discussionEnded, setDiscussionEnded] = useState(false);
  
  const [voices, setVoices] = useState([]);
  const [stream, setStream] = useState(null);

  const [speakingNow, setSpeakingNow] = useState(null);
  const [queueState, setQueueState] = useState([]);
  const [userHandRaised, setUserHandRaised] = useState(false);
  const [allHandsRaised, setAllHandsRaised] = useState(false); // To show fast AI interaction intent

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const autonomousTimerRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isEndingRef = useRef(false);
  const videoRef = useRef(null);
  const queueRef = useRef([]);

  // Fix for camera element mounting
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, discussionEnded]);

  // Load Voices
  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiThinking]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        
        const displayTranscript = finalTranscript || currentTranscript;
        setTranscript(displayTranscript);

        // Cancel AI TTS if user interrupts with speech
        if (displayTranscript.trim().length > 3 && isSpeakingRef.current) {
          handleUserInterrupt();
        }

        // Auto-send on silence
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (autonomousTimerRef.current) clearTimeout(autonomousTimerRef.current);
        
        silenceTimerRef.current = setTimeout(() => {
          if (displayTranscript.trim()) {
             handleUserSpeechEnd(displayTranscript.trim());
          } else {
             if(!isSpeakingRef.current && queueRef.current.length === 0) startAutonomousTimer();
          }
        }, 800); // Super fast 0.8s response wait
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, [sessionInfo, aiThinking]);

  const handleUserInterrupt = () => {
    queueRef.current = [];
    setQueueState([]);
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    setSpeakingNow(null);
    setUserHandRaised(true);
  };

  const handleRaiseHand = () => {
    setUserHandRaised(true);
    handleUserInterrupt();
    if (autonomousTimerRef.current) clearTimeout(autonomousTimerRef.current);
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

  const speak = (name, text, onEnd) => {
    if (!window.speechSynthesis) {
      if(onEnd) onEnd();
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechUtterances.push(utterance); // Prevent GC

    const englishVoices = voices.filter(v => v.lang.includes('en'));
    
    if (name === 'AI Moderator' && englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
      utterance.pitch = 1;
      utterance.rate = 1.05;
    } else if (name === 'Participant 1' && englishVoices.length > 1) {
      utterance.voice = englishVoices[1 % englishVoices.length];
      utterance.pitch = 1.2;
      utterance.rate = 1.15;
    } else if (name === 'Participant 2' && englishVoices.length > 2) {
      utterance.voice = englishVoices[2 % englishVoices.length];
      utterance.pitch = 0.8;
      utterance.rate = 0.95;
    } else if (name === 'Participant 3' && englishVoices.length > 3) {
      utterance.voice = englishVoices[3 % englishVoices.length];
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
    }
    
    utterance.onstart = () => { isSpeakingRef.current = true; };
    utterance.onend = () => {
      if (!isSpeakingRef.current) return; // it was interrupted
      isSpeakingRef.current = false;
      if(onEnd) onEnd();
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      if(onEnd) onEnd();
    };

    isSpeakingRef.current = true;
    window.speechSynthesis.speak(utterance);
  };

  const startAutonomousTimer = () => {
    if (autonomousTimerRef.current) clearTimeout(autonomousTimerRef.current);
    autonomousTimerRef.current = setTimeout(() => {
      if (!isSpeakingRef.current && !aiThinking && !discussionEnded && queueRef.current.length === 0) {
        triggerNextAI();
      }
    }, 200); // 0.2s ultra low latency
  };

  const triggerNextAI = () => {
    sendMessage(true);
  };

  const processNextInQueue = () => {
    if (isEndingRef.current) return;
    if (isSpeakingRef.current) return;
    
    if (queueRef.current.length > 0) {
      if (autonomousTimerRef.current) clearTimeout(autonomousTimerRef.current);
      
      const nextMsg = queueRef.current.shift();
      setQueueState([...queueRef.current]);
      
      setSpeakingNow(nextMsg.name);
      setMessages(prev => [...prev, { role: 'bot', name: nextMsg.name, text: nextMsg.text }]);
      
      speak(nextMsg.name, nextMsg.text, () => {
         setSpeakingNow(null);
         processNextInQueue();
      });
    } else {
      if (!aiThinking && !discussionEnded) {
        startAutonomousTimer();
      }
    }
  };

  const handleUserSpeechEnd = (finalText) => {
    setUserHandRaised(false);
    setTranscript('');
    setMessages(prev => [...prev, { role: 'user', name: 'You', text: finalText }]);
    processMessage(finalText);
  };

  const sendMessage = (isAuto = false) => {
    if (!isAuto && !transcript.trim() && !aiThinking) {
      processMessage('');
      return;
    }
    if (!isAuto) {
      const userText = transcript.trim();
      if (userText) {
        setUserHandRaised(false);
        setMessages(prev => [...prev, { role: 'user', name: 'You', text: userText }]);
        setTranscript('');
        processMessage(userText);
      }
    } else {
      processMessage('');
    }
  };

  const processMessage = async (userText) => {
    if (!sessionInfo || aiThinking) return;
    
    try {
      setAiThinking(true);
      setAllHandsRaised(true); // AI agents instantly raise hands to hide latency

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (autonomousTimerRef.current) clearTimeout(autonomousTimerRef.current);

      const res = await axios.post(`${API}/gd/message`, {
        session_id: sessionInfo.session_id,
        user_message: userText
      });

      const newResponses = res.data.responses;
      if (isEndingRef.current) return;
      queueRef.current.push(...newResponses.map(r => ({ name: r.participant_name, text: r.message_text })));
      setQueueState([...queueRef.current]);
      
      setAiThinking(false);
      setAllHandsRaised(false);
      processNextInQueue();
      
    } catch (err) {
      console.error(err);
      setAiThinking(false);
      setAllHandsRaised(false);
      toast.error('Failed to process conversation.');
    }
  };

  const startDiscussion = async () => {
    try {
      // Start camera
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(mediaStream);
      } catch (camErr) {
        console.error("Camera access denied", camErr);
      }

      setAiThinking(true);
      const res = await axios.post(`${API}/gd/start`, { user_id: 1 });
      setSessionInfo({ session_id: res.data.session_id, topic: res.data.topic });
      
      const modMsg = res.data.messages[0];
      queueRef.current.push({ name: modMsg.participant_name, text: modMsg.message_text });
      setQueueState([...queueRef.current]);
      
      setAiThinking(false);
      
      if (!isListening) toggleListening();
      processNextInQueue();
      
    } catch (err) {
      console.error(err);
      setAiThinking(false);
      toast.error('Failed to start group discussion.');
    }
  };

  const endDiscussion = async () => {
    if (!sessionInfo) return;
    try {
      setAiThinking(true);
      if (isListening) toggleListening();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (autonomousTimerRef.current) clearTimeout(autonomousTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      queueRef.current = [];
      setQueueState([]);
      setSpeakingNow(null);
      setUserHandRaised(false);
      isEndingRef.current = true;
      setDiscussionEnded(true);
      
      const res = await axios.post(`${API}/gd/end`, {
        session_id: sessionInfo.session_id
      });
      
      if (isEndingRef.current) {
         setReportData(res.data.report);
      }
      setAiThinking(false);
    } catch (err) {
      console.error(err);
      setAiThinking(false);
      toast.error('Failed to end discussion.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4 pb-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-primary-500" /> Virtual Interview Room
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {sessionInfo ? `Topic: ${sessionInfo.topic}` : 'Waiting for host to start...'}
          </p>
        </div>
        <div className="flex gap-2">
          {!sessionInfo && !discussionEnded && (
            <button 
              onClick={startDiscussion} disabled={aiThinking}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {aiThinking ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Start GD
            </button>
          )}
          {sessionInfo && !discussionEnded && (
            <button 
              onClick={endDiscussion} disabled={aiThinking}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              End Call
            </button>
          )}
          {discussionEnded && (
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              <Play size={16} /> New Session
            </button>
          )}
        </div>
      </div>

      {!discussionEnded ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          
          {/* Main Grid: Google Meet Style */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2 gap-4 h-full bg-black rounded-xl p-4 shadow-inner">
             <ParticipantTile 
                className="w-full h-full"
                name="You" role="Student" isUser={true} 
                stream={stream} videoRef={videoRef}
                isSpeaking={speakingNow === 'You'}
                isQueued={userHandRaised}
             />
             <ParticipantTile 
                name="AI Moderator" role="Host" 
                isSpeaking={speakingNow === 'AI Moderator'}
                isQueued={queueState.some(q => q.name === 'AI Moderator') || (allHandsRaised && !speakingNow)}
             />
             <ParticipantTile 
                name="Participant 1" role="Aggressive" 
                isSpeaking={speakingNow === 'Participant 1'}
                isQueued={queueState.some(q => q.name === 'Participant 1') || (allHandsRaised && !speakingNow)}
             />
             <ParticipantTile 
                name="Participant 2" role="Analytical" 
                isSpeaking={speakingNow === 'Participant 2'}
                isQueued={queueState.some(q => q.name === 'Participant 2') || (allHandsRaised && !speakingNow)}
             />
             <ParticipantTile 
                name="Participant 3" role="Supportive" 
                isSpeaking={speakingNow === 'Participant 3'}
                isQueued={queueState.some(q => q.name === 'Participant 3') || (allHandsRaised && !speakingNow)}
             />
             <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-4 border-slate-800 flex flex-col items-center justify-center p-6 text-center w-full h-full">
                <Users size={32} className="text-slate-700 mb-2" />
                <h3 className="text-white font-medium mb-1 text-sm">Room Info</h3>
                <p className="text-[10px] text-slate-400">Status: {aiThinking ? 'AI Thinking...' : 'Live'}</p>
                {sessionInfo && (
                  <button 
                    onClick={handleRaiseHand}
                    className={`mt-2 px-3 py-1.5 rounded-full font-medium text-xs flex items-center gap-1.5 transition-colors ${
                      userHandRaised ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    <Hand size={14} /> {userHandRaised ? 'Hand Raised' : 'Raise Hand'}
                  </button>
                )}
             </div>
          </div>

          {/* Right Sidebar: Controls & Transcript */}
          <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-900">
               <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Transcript</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-900/50 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
                   <span className="text-[10px] font-bold text-gray-500 uppercase mb-0.5">{msg.name}</span>
                   <div className={`px-3 py-2 shadow-sm text-xs ${
                     msg.role === 'user' 
                       ? 'bg-primary-600 text-white rounded-xl rounded-tr-sm' 
                       : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-xl rounded-tl-sm'
                   }`}>
                     {msg.text}
                   </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex items-center gap-2">
               <button 
                 onClick={toggleListening}
                 disabled={!sessionInfo}
                 className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                   isListening 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200 shadow-inner' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400'
                 } disabled:opacity-50`}
               >
                 {isListening ? <span className="animate-pulse flex items-center"><Mic size={18} /></span> : <MicOff size={18} />}
               </button>
               <input 
                 type="text" 
                 placeholder="Type your point..." 
                 value={transcript}
                 onChange={(e) => setTranscript(e.target.value)}
                 disabled={!sessionInfo}
                 onKeyPress={(e) => e.key === 'Enter' && sendMessage(false)}
                 className="flex-1 block w-full px-3 py-2 text-xs rounded-full border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white shadow-sm focus:ring-primary-500 disabled:opacity-50"
               />
               <button 
                 onClick={() => sendMessage(false)}
                 disabled={!sessionInfo}
                 className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
               >
                 <Send size={16} className="-ml-0.5" />
               </button>
            </div>
          </div>
        </div>
      ) : (
        /* Analysis View remains unchanged... */
        <div className="flex-1 overflow-y-auto">
          {reportData ? (
             <div className="max-w-5xl mx-auto space-y-6">
              <div className="text-center py-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                <Award size={48} className="mx-auto text-primary-500 mb-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">GD Performance Report</h2>
                <p className="text-gray-500 mt-1">Topic: {sessionInfo.topic}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Communication', val: reportData.communication_score, color: '#3b82f6' },
                  { label: 'Confidence', val: reportData.confidence_score, color: '#10b981' },
                  { label: 'Participation', val: reportData.participation_score, color: '#8b5cf6' },
                  { label: 'Leadership', val: reportData.leadership_score, color: '#f59e0b' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.val}/10</p>
                    </div>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center opacity-20" style={{ backgroundColor: stat.color }}>
                      <BarChart2 size={24} style={{ color: stat.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={18} /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {(Array.isArray(reportData.strengths) ? reportData.strengths : String(reportData.strengths || '').split(',')).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-green-500 mt-0.5">•</span> {typeof s === 'string' ? s.trim() : s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShieldAlert className="text-red-500" size={18} /> Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {(Array.isArray(reportData.improvement_areas) ? reportData.improvement_areas : String(reportData.improvement_areas || '').split(',')).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-red-500 mt-0.5">•</span> {typeof s === 'string' ? s.trim() : s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm h-[300px]">
                 <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Overall Score Distribution</h3>
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={[
                     { name: 'Comm', score: reportData.communication_score },
                     { name: 'Conf', score: reportData.confidence_score },
                     { name: 'Partic', score: reportData.participation_score },
                     { name: 'Interact', score: reportData.interaction_level },
                     { name: 'Leader', score: reportData.leadership_score }
                   ]}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                     <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#6b7280" domain={[0, 10]} fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                     <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
                   </BarChart>
                 </ResponsiveContainer>
              </div>

            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-gray-400 gap-4">
              <Loader2 size={48} className="animate-spin text-primary-500" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">Analyzing Discussion & Generating Scorecard...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
