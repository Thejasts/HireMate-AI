import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Award, AlertTriangle, Clock, MonitorPlay, BookOpen } from 'lucide-react';

const API = 'http://localhost:5000/api';
const primaryColor = '#2563eb'; // text-primary-600
const gridColor = '#e5e7eb'; // border-gray-200
const textColor = '#6b7280'; // text-gray-500

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = 1;

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/dashboard/${userId}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);


  const interviewChartData = data?.interviews
    ?.filter(i => i.status === 'Completed')
    .map((i, idx) => ({
      name: `#${idx + 1}`,
      score: parseFloat(i.final_score) || 0,
      type: i.interview_type
    })).reverse() || [];


  const latestScore = data?.detailedScores?.[0];
  const radarData = latestScore ? [
    { subject: 'Confidence', value: parseFloat(latestScore.confidence_score) || 0 },
    { subject: 'Technical', value: parseFloat(latestScore.technical_score) || 0 },
    { subject: 'Communication', value: parseFloat(latestScore.communication_score) || 0 },
    { subject: 'Eye Contact', value: parseFloat(latestScore.eye_contact_score) || 0 },
  ] : [];

  const userName = data?.user?.name || 'Thejas';
  const totalInterviews = data?.totalInterviews || 0;
  const avgScore = interviewChartData.length > 0 
    ? (interviewChartData.reduce((s, d) => s + d.score, 0) / interviewChartData.length).toFixed(1) 
    : '—';
  const skillCount = data?.skills?.length || 0;

  return (
    <div className="space-y-6">

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover-invert-center group">
        <div className="z-20">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">
            Welcome back, {userName}! 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Here's your AI interview performance overview.</p>
        </div>
        <Link 
          to="/interview" 
          className="z-20 inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <MonitorPlay size={18} /> 
          Start New Interview
        </Link>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <MonitorPlay size={20} />, value: totalInterviews, label: 'Interviews' },
          { icon: <Award size={20} />, value: avgScore, label: 'Avg Score' },
          { icon: <BookOpen size={20} />, value: skillCount, label: 'Skills' },
          { icon: <TrendingUp size={20} />, value: data?.weakTopics?.length || 0, label: 'Weak Areas' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 flex flex-col hover-invert-center"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
              {stat.icon}
            </div>
            <div className="text-2xl font-display font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 hover-invert-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 relative z-20">
            <TrendingUp size={18} className="text-primary-500" /> Performance Progress
          </h3>
          {interviewChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={interviewChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
                  <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={textColor} domain={[0, 10]} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" fill={primaryColor} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-gray-400">
              <MonitorPlay size={48} className="mb-4 opacity-20" />
              <p className="text-sm">No completed interviews yet. Start one to see your progress!</p>
            </div>
          )}
        </div>


        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 hover-invert-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 relative z-20">
            <Award size={18} className="text-primary-500" /> Skill Radar
          </h3>
          {radarData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" stroke={textColor} fontSize={11} />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="value" stroke={primaryColor} fill={primaryColor} fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-gray-400">
              <p className="text-sm text-center px-4">Complete an interview to see your skill radar.</p>
            </div>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary-500" /> Extracted Skills
          </h3>
          {data?.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {s.skill_name}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No skills found.</p>
              <Link to="/resume" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Upload Resume &rarr;</Link>
            </div>
          )}
        </div>


        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" /> Weak Topics
          </h3>
          {data?.weakTopics?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.weakTopics.slice(0, 10).map((t, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No weak topics detected yet.</p>
            </div>
          )}
        </div>


        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-gray-500" /> Recent Interviews
          </h3>
          {data?.interviews?.length > 0 ? (
            <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2">
              {data.interviews.map((interview, i) => {
                const score = parseFloat(interview.final_score);
                const isHigh = score >= 7;
                const isMed = score >= 4 && score < 7;
                
                return (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-700 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{interview.job_role}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {interview.interview_type} &middot; {new Date(interview.start_time).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold ${
                      isHigh ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      isMed ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {score.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No interviews yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 hover-invert-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 relative z-20">
          <Award size={18} className="text-primary-500" /> Aptitude Test History
        </h3>
        {data?.aptitudeTests?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2">
            {data.aptitudeTests.map((test, i) => {
              const score = test.score || 0;
              const total = test.total_qs || 1;
              const percent = (score / total) * 100;
              const isHigh = percent >= 70;
              const isMed = percent >= 40 && percent < 70;

              return (
                <div key={i} className="flex justify-between items-center p-4 border border-gray-100 dark:border-slate-700 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{test.category}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(test.created_at).toLocaleDateString()} &middot; +{test.xp_earned} XP
                    </div>
                  </div>
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg text-sm font-bold ${
                    isHigh ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    isMed ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {score}/{total}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No aptitude tests taken yet.</p>
            <Link to="/aptitude" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Take a Test &rarr;</Link>
          </div>
        )}
      </div>
    </div>
  );
}
