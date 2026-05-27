import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  Clock,
  MonitorPlay,
  BookOpen,
  Brain,
  FileText,
  Sparkles,
  ArrowUpRight,
  Activity,
  Zap,
  Target,
  Shield,
  Star,
  Map,
  Users,
  ChevronRight,
  Building2,
  Lock
} from 'lucide-react';

const API = 'http://localhost:5000/api';
const primaryColor = '#2563eb';
const tealColor = '#0f766e';
const gridColor = '#e5e7eb';
const textColor = '#6b7280';

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

function EmptyState({ icon, title, action }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center text-center text-gray-400">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-300 dark:bg-slate-700 dark:text-slate-500">
        {icon}
      </div>
      <p className="text-sm">{title}</p>
      {action}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = 1;

  useEffect(() => {
    axios.get(`${API}/dashboard/${userId}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const interviewChartData = useMemo(() => (
    data?.interviews
      ?.filter(i => i.status === 'Completed')
      .map((i, idx) => ({
        name: `#${idx + 1}`,
        score: parseFloat(i.final_score) || 0,
        type: i.interview_type
      }))
      .reverse() || []
  ), [data]);

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


      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Panel delay={0.1} className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <BookOpen size={19} className="text-primary-500" /> Extracted Skills
          </h3>
          {data?.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {s.skill_name}
                </motion.span>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FileText size={32} />}
              title="No skills found yet."
              action={<Link to="/resume" className="mt-3 text-sm font-semibold text-primary-600">Upload resume</Link>}
            />
          )}
        </Panel>

        <Panel delay={0.16} className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <AlertTriangle size={19} className="text-amber-500" /> Weak Topics
          </h3>
          {data?.weakTopics?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.weakTopics.slice(0, 10).map((t, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                >
                  {t}
                </motion.span>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Award size={32} />} title="No weak topics detected yet." />
          )}
        </Panel>

        <Panel delay={0.22} className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Clock size={19} className="text-gray-500" /> Recent Interviews
          </h3>
          {data?.interviews?.length > 0 ? (
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
              {data.interviews.map((interview, i) => {
                const score = parseFloat(interview.final_score);
                const isHigh = score >= 7;
                const isMed = score >= 4 && score < 7;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/70 p-3 dark:border-slate-700 dark:bg-slate-900/40"
                  >
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{interview.job_role}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={12} />
                        {interview.interview_type} - {new Date(interview.start_time).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${
                      isHigh ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      isMed ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {Number.isFinite(score) ? score.toFixed(1) : '--'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<MonitorPlay size={32} />} title="No interviews yet." />
          )}
        </Panel>
      </div>

      {/* New Section: Achievements */}
      <Panel delay={0.24} className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Award size={19} className="text-primary-500" /> Achievements & Streaks
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: <Award size={16} className="text-yellow-500"/>, label: 'Interview Master', progress: 80 },
            { icon: <Zap size={16} className="text-orange-500"/>, label: '7 Day Streak', progress: 40 },
            { icon: <Brain size={16} className="text-purple-500"/>, label: 'Aptitude Champ', progress: 60 },
            { icon: <Activity size={16} className="text-teal-500"/>, label: 'Comm. Expert', progress: 90 },
            { icon: <Target size={16} className="text-blue-500"/>, label: 'Skill Builder', progress: 30 }
          ].map((badge, i) => (
            <div key={i} className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                {badge.icon} {badge.label}
              </div>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${badge.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel delay={0.18} className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Award size={19} className="text-primary-500" /> Aptitude Test History
          </h3>
          <Link to="/aptitude" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
            Practice <ArrowUpRight size={15} />
          </Link>
        </div>
        {data?.aptitudeTests?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.aptitudeTests.map((test, i) => {
              const score = test.score || 0;
              const total = test.total_qs || 1;
              const percent = (score / total) * 100;
              const isHigh = percent >= 70;
              const isMed = percent >= 40 && percent < 70;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{test.category}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock size={12} />
                      {new Date(test.created_at).toLocaleDateString()} - +{test.xp_earned} XP
                    </div>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-sm font-bold ${
                    isHigh ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    isMed ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {score}/{total}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Brain size={34} />}
            title="No aptitude tests taken yet."
            action={<Link to="/aptitude" className="mt-3 text-sm font-semibold text-primary-600">Take a test</Link>}
          />
        )}
      </Panel>

      <Panel delay={0.20} className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Users size={19} className="text-primary-500" /> Group Discussion History
          </h3>
          <Link to="/gd" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
            Join Room <ArrowUpRight size={15} />
          </Link>
        </div>
        {data?.gdHistory?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {data.gdHistory.map((session, i) => {
              const avgScore = (parseFloat(session.communication_score) + parseFloat(session.confidence_score) + parseFloat(session.participation_score) + parseFloat(session.leadership_score)) / 4;
              const isHigh = avgScore >= 7;
              const isMed = avgScore >= 4 && avgScore < 7;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex flex-col rounded-lg border border-gray-100 bg-gray-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{session.topic}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={12} />
                        {new Date(session.start_time).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ml-4 ${
                      isHigh ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      isMed ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {avgScore.toFixed(1)}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 border-t border-gray-200 dark:border-slate-700 pt-3">
                    <div className="text-center">
                      <div className="text-[10px] uppercase text-gray-500">Comm</div>
                      <div className="text-xs font-semibold dark:text-gray-300">{session.communication_score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase text-gray-500">Conf</div>
                      <div className="text-xs font-semibold dark:text-gray-300">{session.confidence_score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase text-gray-500">Part</div>
                      <div className="text-xs font-semibold dark:text-gray-300">{session.participation_score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase text-gray-500">Lead</div>
                      <div className="text-xs font-semibold dark:text-gray-300">{session.leadership_score}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Users size={34} />}
            title="No GD sessions completed yet."
            action={<Link to="/gd" className="mt-3 text-sm font-semibold text-primary-600">Start Discussion</Link>}
          />
        )}
      </Panel>
    </div>
  );
}
