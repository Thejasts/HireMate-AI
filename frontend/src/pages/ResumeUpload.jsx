import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Target,
  GraduationCap,
  Briefcase,
  ChevronRight,
  Video,
  Loader2,
  UserRound,
  Cpu,
  FileSearch,
  ScanLine
} from 'lucide-react';

const API = 'http://localhost:5000/api';

function ResumeAiScene({ file, loading, result, onFileChange }) {
  const statusText = loading
    ? 'AI is scanning your resume'
    : result
      ? 'Resume analysis complete'
      : file
        ? 'Resume ready for AI analysis'
        : 'Candidate walking to the AI system';
  const SceneTag = 'label';

  return (
    <SceneTag
      htmlFor="resumeUpload"
      className={`relative mx-auto mb-8 block h-64 max-w-3xl overflow-hidden rounded-xl border bg-gradient-to-br from-white via-blue-50 to-slate-50 shadow-sm transition ${
        loading
          ? 'cursor-wait border-blue-200'
          : 'cursor-pointer border-blue-100 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md hover:shadow-blue-100'
      }`}
    >
      <input
        type="file"
        id="resumeUpload"
        className="hidden"
        accept=".pdf"
        onChange={onFileChange}
        disabled={loading}
      />
      <div className="absolute inset-x-8 bottom-12 h-2 rounded-full bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/90 to-transparent" />

      <motion.div
        className="absolute bottom-[56px] left-7 flex flex-col items-center"
        initial={{ x: 0 }}
        animate={{ x: ['0%', '36vw', '36vw'] }}
        transition={{ duration: 4.6, times: [0, 0.88, 1], ease: 'easeInOut' }}
      >
        <motion.div
          className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-md"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
        >
          <UserRound size={26} />
        </motion.div>
        <motion.div
          className="h-16 w-12 rounded-t-full border border-blue-200 bg-gradient-to-b from-blue-400 to-primary-700 shadow-lg shadow-blue-100"
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="mt-[-5px] flex gap-2">
          <motion.div
            className="h-11 w-4 rounded-full bg-slate-500"
            animate={{ rotate: [10, -12, 10], y: [0, 2, 0] }}
            transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="h-11 w-4 rounded-full bg-slate-600"
            animate={{ rotate: [-12, 10, -12], y: [2, 0, 2] }}
            transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      <div className="absolute bottom-10 right-8 w-52 rounded-xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100 sm:right-14 sm:w-64">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Cpu size={18} />
            HireMate AI
          </div>
          <motion.div
            className={`h-3 w-3 rounded-full ${loading ? 'bg-green-500' : result ? 'bg-blue-500' : 'bg-slate-300'}`}
            animate={loading ? { scale: [1, 1.45, 1], opacity: [0.6, 1, 0.6] } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, repeat: loading ? Infinity : 0 }}
          />
        </div>

        <div className="relative h-28 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mx-auto h-full w-20 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
            <FileSearch size={24} className="mx-auto mb-2 text-slate-400" />
            <div className="space-y-1.5">
              <div className="h-1.5 rounded-full bg-slate-200" />
              <div className="h-1.5 rounded-full bg-slate-200" />
              <div className="h-1.5 w-2/3 rounded-full bg-slate-200" />
            </div>
          </div>

          <AnimatePresence>
            {loading && (
              <motion.div
                className="absolute left-3 right-3 top-2 flex items-center gap-2 rounded-md bg-blue-500/15 px-2 py-1 text-blue-700"
                initial={{ y: -22, opacity: 0 }}
                animate={{ y: [0, 78, 0], opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.55, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ScanLine size={16} />
                <span className="h-1.5 flex-1 rounded-full bg-blue-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-3 text-center text-sm font-medium text-slate-600">{statusText}</p>
      </div>
      <div className="absolute left-4 top-4 rounded-md border border-blue-100 bg-white/85 px-3 py-2 text-left text-sm shadow-sm backdrop-blur sm:left-6 sm:top-6">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          {file ? <CheckCircle size={17} className="text-green-500" /> : <UploadCloud size={17} className="text-primary-600" />}
          {file ? file.name : 'Click this AI station to select PDF'}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {file ? 'Ready to upload and analyze' : 'PDF resume up to 5MB'}
        </div>
      </div>
    </SceneTag>
  );
}

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [jobRoles, setJobRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(1);

  useEffect(() => {
    axios.get(`${API}/dashboard/1`)
      .then(res => {
        if (res.data.jobRoles) {
          setJobRoles(res.data.jobRoles);
          if (res.data.jobRoles.length > 0) {
            setSelectedRole(res.data.jobRoles[0].id);
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('user_id', 1);
    formData.append('job_role_id', selectedRole);

    try {
      const res = await axios.post(`${API}/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Error: ${err.response.data.error}`);
      } else {
        alert('Failed to upload resume. Ensure backend is running and Gemini API key is set.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-8 sm:p-10 text-center">
          <div className="inline-block relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 blur-lg opacity-30 rounded-xl"></div>
            <h2 className="relative px-6 py-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] rounded-xl text-3xl font-display font-bold bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Resume & Skill Gap Analysis
            </h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Upload your PDF resume to instantly extract your skills, education, and projects, and compare them against your target job role.
          </p>

          <ResumeAiScene file={file} loading={loading} result={result} onFileChange={handleFileChange} />
          
          <form onSubmit={handleUpload} className="max-w-xl mx-auto">
            <div className="text-left mb-6">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Job Role
              </label>
              <select 
                id="role"
                className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm transition-colors"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={loading}
              >
                {jobRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.title}</option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              disabled={!file || loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Analyzing with AI...
                </>
              ) : 'Upload & Analyze Resume'}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 flex items-center">
                <div className="flex-shrink-0 mr-4 p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Match Score</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {100 - result.gapPercentage}%
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 flex items-center">
                <div className="flex-shrink-0 mr-4 p-3 rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Skill Gap</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {result.gapPercentage}% <span className="text-sm font-normal text-gray-500">({result.totalMissing} missing skills)</span>
                  </p>
                </div>
              </div>
            </div>


            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Extracted Profile</h3>
              </div>
              <div className="px-6 py-5 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                    <GraduationCap size={18} className="text-primary-500" /> Education
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-6 whitespace-pre-wrap">
                    {result.education || 'No education data found.'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                    <Briefcase size={18} className="text-primary-500" /> Projects
                  </h4>
                  {result.projects && result.projects.length > 0 ? (
                    <ul className="list-disc list-outside text-sm text-gray-600 dark:text-gray-400 ml-10 space-y-1">
                      {result.projects.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">No projects found.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <CheckCircle size={18} className="text-green-500" /> Detected Skills
                  </h4>
                  <div className="flex flex-wrap gap-2 ml-6">
                    {result.extractedSkills.map((s, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            {result.missingSkills && result.missingSkills.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border-2 border-dashed border-red-200 dark:border-red-800/50 shadow-sm overflow-hidden">
                <div className="px-6 py-5">
                  <h3 className="text-lg leading-6 font-medium text-red-800 dark:text-red-400 flex items-center gap-2 mb-4">
                    <AlertTriangle size={20} /> Missing Skills & Learning Roadmap
                  </h3>
                  
                  <div className="mb-6">
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      These skills are required for your target role but were not found in your resume:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((s, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60 shadow-sm">
                          {s.skill_name} <span className="opacity-60 ml-1 font-normal">({s.importance})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {result.roadmap && result.roadmap.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-800/30">
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-400 flex items-center gap-2 mb-4">
                        <BookOpen size={18} /> Recommended Resources
                      </h4>
                      <div className="bg-white dark:bg-slate-800 rounded-lg border border-red-100 dark:border-red-900/30 overflow-hidden">
                        <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                          {result.roadmap.map((item, idx) => (
                            <li key={idx} className="p-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                <div className="flex-1">
                                  <h5 className="text-sm font-bold text-gray-900 dark:text-white">{item.skill}</h5>
                                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1">
                                    <ChevronRight size={16} className="text-gray-400 mt-0.5 flex-shrink-0" /> 
                                    <span>{item.resources}</span>
                                  </p>
                                  {item.video_link && (
                                    <a href={item.video_link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">
                                      <Video size={14} /> Watch Video Tutorial
                                    </a>
                                  )}
                                </div>
                                <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end flex-shrink-0 mt-2 sm:mt-0">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300">
                                    {item.timeframe}
                                  </span>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.priority === 'High' 
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  }`}>
                                    {item.priority} Priority
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
