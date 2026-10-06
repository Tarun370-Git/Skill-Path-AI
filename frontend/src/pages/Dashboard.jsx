import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import RoadmapCard from '../components/RoadmapCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Sparkles, Brain, Plus, Compass, AlertCircle, Upload, FileText, X } from 'lucide-react';

export default function Dashboard() {
  const [dreamJob, setDreamJob] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [file, setFile] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    try {
      setError('');
      const data = await api.fetchRoadmaps();
      setRoadmaps(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch previous roadmaps. Please verify backend is running.');
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');

    if (!dreamJob.trim()) {
      setError('Please enter your target role / dream job.');
      return;
    }

    if (!currentSkills.trim() && !file) {
      setError('Please provide your current skills OR upload a resume PDF.');
      return;
    }

    setIsLoading(true);
    try {
      const newRoadmap = await api.generateRoadmap(
        dreamJob.trim(),
        currentSkills.trim(),
        experienceLevel,
        file
      );
      // Success! Clear input and redirect
      setDreamJob('');
      setCurrentSkills('');
      setFile(null);
      navigate(`/roadmap/${newRoadmap.id}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Roadmap generation failed. Please check backend log.'
      );
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 min-h-[70vh]">
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Header Hero Panel */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-900 border border-slate-800/40 p-8 sm:p-10 shadow-2xl">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 opacity-30 blur-2xl"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400 border border-sky-500/25">
            <Brain className="h-3.5 w-3.5" />
            <span>Google Gemini AI Integration</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Design Your Next Career Move
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 font-medium">
            Enter your desired role and current skillset. Our AI mentor will perform a thorough skill gap analysis and structure a structured 8-week actionable curriculum.
          </p>
        </div>
      </div>

      {/* 2. Main Work Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Input Form (1/3 wide) */}
        <div className="lg:col-span-1 glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/40">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="h-5 w-5 text-sky-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Generate Roadmap</h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200/30 p-3.5 text-red-800 dark:bg-red-950/20 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            {/* Target Job */}
            <div className="space-y-1.5">
              <label htmlFor="dreamJob" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Dream Job / Target Role
              </label>
              <input
                id="dreamJob"
                type="text"
                value={dreamJob}
                onChange={(e) => setDreamJob(e.target.value)}
                placeholder="e.g. Full Stack Developer, DevOps Engineer"
                required
                className="glass-input w-full text-sm text-slate-900 dark:text-white"
              />
            </div>

            {/* Resume Upload (PDF Option A) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Option A: Upload Resume PDF
              </label>
              {!file ? (
                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors duration-200 cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="h-6 w-6 text-slate-400 dark:text-slate-500 mx-auto group-hover:text-sky-500 transition-colors duration-200" />
                  <span className="mt-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-450 group-hover:text-slate-850 dark:group-hover:text-slate-300">
                    Click or drag PDF resume here
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 bg-sky-500/5 dark:bg-sky-400/5 border border-sky-500/20 dark:border-sky-400/15 rounded-xl">
                  <div className="flex items-center gap-2 text-sky-600 dark:text-sky-450">
                    <FileText className="h-5 w-5" />
                    <span className="text-xs font-bold truncate max-w-[170px]">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-slate-400 hover:text-red-500 dark:text-slate-550 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200/50 dark:border-slate-800/50"></div>
              </div>
              <span className="relative bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                OR
              </span>
            </div>

            {/* Current Skills (Option B) */}
            <div className="space-y-1.5">
              <label htmlFor="currentSkills" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Option B: Enter Skills Manually
              </label>
              <textarea
                id="currentSkills"
                rows={3}
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                placeholder="e.g. HTML, CSS, JavaScript, Basic Python"
                required={!file}
                disabled={!!file}
                className={`glass-input w-full text-sm text-slate-900 dark:text-white resize-none ${
                  file ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-950/20' : ''
                }`}
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <label htmlFor="expLevel" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Target Experience Level
              </label>
              <select
                id="expLevel"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="glass-input w-full text-sm text-slate-900 dark:text-white"
              >
                <option value="Beginner">Beginner (Start with foundations)</option>
                <option value="Intermediate">Intermediate (Advance existing core)</option>
                <option value="Advanced">Advanced (Deep dive into system architectures)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-glow w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 shadow-md hover:scale-[1.01] transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Analyze & Generate</span>
            </button>
          </form>
        </div>

        {/* Right Previous Roadmaps list (2/3 wide) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-sky-500" />
            <span>Generated Roadmap History</span>
          </h3>

          {isPageLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-56 bg-slate-200 dark:bg-slate-900 rounded-3xl"></div>
              ))}
            </div>
          ) : roadmaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roadmaps.map((item) => (
                <RoadmapCard key={item.id} roadmap={item} />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/50 dark:border-slate-800/40 flex flex-col items-center justify-center">
              <Compass className="h-12 w-12 text-slate-350 dark:text-slate-600 mb-4 animate-float" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No Roadmaps Found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                You have not generated any career paths yet. Complete the form on the left to start analyzing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
