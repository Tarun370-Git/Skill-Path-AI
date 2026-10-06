import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import SkillGapChart from '../components/SkillGapChart';
import { ArrowLeft, Download, CheckCircle2, ChevronRight, BookOpen, Laptop, Trophy, HelpCircle, ExternalLink, Calendar } from 'lucide-react';

export default function RoadmapDetails() {
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [progress, setProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRoadmapDetails() {
      try {
        setIsLoading(true);
        setError('');
        const data = await api.fetchRoadmapDetails(id);
        setRoadmap(data);
      
      let parsed = null;
      if (typeof data.roadmap_json === 'string') {
        try {
          parsed = JSON.parse(data.roadmap_json);
        } catch (e) {
          console.error("Failed to parse roadmap_json string:", e);
        }
      } else {
        parsed = data.roadmap_json;
      }
      
      if (parsed) {
        parsed = {
          readiness_score: parsed.readiness_score ?? data.readiness_score ?? 50,
          existing_skills: parsed.existing_skills || parsed.skills || [],
          missing_skills: parsed.missing_skills || parsed.gaps || [],
          priority_skills: parsed.priority_skills || parsed.focus_skills || [],
          roadmap: parsed.roadmap || parsed.weeks || [],
          portfolio_projects: parsed.portfolio_projects || parsed.projects || [],
          interview_topics: parsed.interview_topics || parsed.interview_questions || [],
          certifications: parsed.certifications || []
        };
      }
      
        setParsedData(parsed);
        setProgress(data.progress_items || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load roadmap details. Please verify database connection.');
      } finally {
        setIsLoading(false);
      }
    }
    loadRoadmapDetails();
  }, [id]);

  const getResourceUrlAndTitle = (res, topic = '') => {
    if (!res) return { title: 'Resource', url: '#' };
    
    // Case 1: Direct HTTP/HTTPS link
    const httpMatch = res.match(/https?:\/\/[^\s)]+/i);
    if (httpMatch) {
      const url = httpMatch[0];
      const title = res.replace(url, '').replace(/[()]/g, '').trim() || 'Tutorial Link';
      return { title, url };
    }

    // Case 2: Parentheses pattern Title (domain/platform)
    const domainMatch = res.match(/(.*?)\(([^)]+)\)/);
    if (domainMatch) {
      const title = domainMatch[1].trim();
      const domainOrPlatform = domainMatch[2].trim();
      
      if (domainOrPlatform.includes('.') && !domainOrPlatform.includes(' ')) {
        return { title, url: `https://${domainOrPlatform}` };
      }
      
      const query = `${title} ${topic} tutorial`.trim();
      if (/youtube/i.test(domainOrPlatform)) {
        return { title, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` };
      }
      
      return { title, url: `https://www.google.com/search?q=${encodeURIComponent(`${title} ${domainOrPlatform} ${topic}`.trim())}` };
    }

    // Case 3: Text string fallback to Google search query
    const cleanTitle = res.trim();
    const searchQuery = `${cleanTitle} ${topic}`.trim();
    return {
      title: cleanTitle,
      url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
    };
  };

  const handleToggleWeek = async (weekNumber, currentCompletedState) => {
    try {
      const updatedItem = await api.updateRoadmapProgress(id, weekNumber, !currentCompletedState);
      
      // Update local state
      setProgress((prev) =>
        prev.map((item) => (item.week_number === weekNumber ? { ...item, completed: updatedItem.completed } : item))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update progress. Please check connection.');
    }
  };

  const handleDownloadPdf = async () => {
    if (isPdfDownloading) return;
    setIsPdfDownloading(true);
    try {
      await api.downloadPdfBlob(id, roadmap.dream_job);
    } catch (err) {
      console.error(err);
      alert('PDF generation failed. Please try again later.');
    } finally {
      setIsPdfDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 min-h-[70vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="flex-grow max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Roadmap Not Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-450">{error || 'The requested roadmap could not be loaded.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold px-5 py-2.5 text-sm transition-colors shadow"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Calculate learning metrics
  const completedWeeks = progress.filter((w) => w.completed).length;
  const learningPercentage = Math.round((completedWeeks / 8) * 100);

  const dateFormatted = new Date(roadmap.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-500 dark:text-sky-450 dark:hover:text-sky-400 uppercase tracking-wider mb-2.5"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {roadmap.dream_job} Blueprint
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-450 dark:text-slate-500 mt-1">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{dateFormatted}</span>
            <span>•</span>
            <span className="bg-sky-50 dark:bg-sky-950/30 px-2 py-0.5 rounded-md text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/35">
              Experience Level: {parsedData?.roadmap?.[0] ? 'Tailored Action Plan' : 'Custom Plan'}
            </span>
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isPdfDownloading}
          className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:scale-[1.01] text-white px-5 py-3 text-sm font-bold shadow-md transition-all self-start sm:self-center disabled:opacity-50 disabled:pointer-events-none"
        >
          <Download className="h-4.5 w-4.5" />
          <span>{isPdfDownloading ? 'Downloading PDF...' : 'Download Roadmap PDF'}</span>
        </button>
      </div>

      {/* 2. Score & Skill Gap Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Circular Ring Score (1/3 wide) */}
        <div className="md:col-span-1">
          <SkillGapChart score={roadmap.readiness_score} />
        </div>

        {/* Right Skill Gap Categories lists (2/3 wide) */}
        <div className="md:col-span-2 glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Skill Gap Analysis</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Existing Skills */}
            <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900/30 p-4 rounded-xl">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Existing Core
              </span>
              <ul className="space-y-1.5">
                {parsedData?.existing_skills?.map((skill, index) => (
                  <li key={index} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    <span>{skill}</span>
                  </li>
                )) || <span className="text-xs text-slate-400">None specified</span>}
              </ul>
            </div>

            {/* Missing Skills */}
            <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900/30 p-4 rounded-xl">
              <span className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider block">
                Identified Gaps
              </span>
              <ul className="space-y-1.5">
                {parsedData?.missing_skills?.map((skill, index) => (
                  <li key={index} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                    <span>{skill}</span>
                  </li>
                )) || <span className="text-xs text-slate-400">None identified</span>}
              </ul>
            </div>

            {/* High Priority Skills */}
            <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900/30 p-4 rounded-xl">
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">
                High Priority
              </span>
              <ul className="space-y-1.5">
                {parsedData?.priority_skills?.map((skill, index) => (
                  <li key={index} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <span>{skill}</span>
                  </li>
                )) || <span className="text-xs text-slate-400">None identified</span>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Learning Timeline Checklist Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            8-Week Interactive Study Timeline
          </h3>
          {/* Timeline overall progress metrics */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Checklist Progress:
            </span>
            <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 px-2.5 py-0.5 rounded-full border border-sky-100 dark:border-sky-900/20">
              {completedWeeks} / 8 Weeks ({learningPercentage}%)
            </span>
          </div>
        </div>

        {/* 8 Week Timeline Deck */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {parsedData?.roadmap?.map((week) => {
            const progressItem = progress.find((p) => p.week_number === week.week_number);
            const isCompleted = progressItem ? progressItem.completed : false;

            return (
              <div
                key={week.week_number}
                className={`glass-card rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-500/25 bg-emerald-50/5 dark:bg-emerald-950/5 shadow-md shadow-emerald-500/5'
                    : 'border-slate-200/50 dark:border-slate-800/40'
                }`}
              >
                <div>
                  {/* Top toolbar */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-widest block">
                        Week {week.week_number}
                      </span>
                      <h4 className="font-bold text-slate-800 dark:text-white leading-snug">
                        {week.topic}
                      </h4>
                    </div>

                    {/* Interactive Completion Circle */}
                    <button
                      onClick={() => handleToggleWeek(week.week_number, isCompleted)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all border outline-none ${
                        isCompleted
                          ? 'bg-emerald-50 border-emerald-250 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-500'
                          : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 hover:border-sky-300 dark:hover:border-sky-900 hover:text-sky-500'
                      }`}
                      title="Mark week as completed"
                    >
                      <CheckCircle2 className="h-5.5 w-5.5" />
                    </button>
                  </div>

                  {/* Tasks List */}
                  <div className="mt-5 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Learning Modules / Tasks
                    </span>
                    <ul className="space-y-2">
                      {week.tasks?.map((task, idx) => (
                        <li key={idx} className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-sky-500/70 flex-shrink-0 mt-0.5" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mini Project block */}
                  {week.mini_project && (
                    <div className="mt-5 p-3 rounded-2xl bg-sky-500/5 dark:bg-sky-400/5 border border-sky-500/10 dark:border-sky-400/10">
                      <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-0.5">
                        Weekly Challenge Project
                      </span>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed">
                        {week.mini_project}
                      </p>
                    </div>
                  )}
                </div>

                {/* Free resources */}
                {week.resources && week.resources.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                      Free Learning Materials & Video Tutorials
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {week.resources.map((res, idx) => {
                        const { title, url } = getResourceUrlAndTitle(res, week.topic);
                        
                        return (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-sky-600 dark:text-slate-450 dark:hover:text-sky-400 bg-slate-50 hover:bg-sky-50 dark:bg-slate-900 dark:hover:bg-sky-950/20 border border-slate-200/40 dark:border-slate-800/45 rounded-lg transition-colors duration-200"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{title}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Prep Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Portfolio Projects */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/40 space-y-4">
          <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400">
            <Laptop className="h-5.5 w-5.5" />
            <h4 className="font-bold text-slate-800 dark:text-white">Portfolio Builders</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Construct these major projects to showcase on your Github and resume.
          </p>
          <ul className="space-y-3 pt-2">
            {parsedData?.portfolio_projects?.map((proj, idx) => (
              <li key={idx} className="p-3 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/30 rounded-xl">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{proj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interview Prep */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/40 space-y-4">
          <div className="flex items-center gap-2 text-sky-500 dark:text-sky-400">
            <HelpCircle className="h-5.5 w-5.5" />
            <h4 className="font-bold text-slate-800 dark:text-white">Interview Questions</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Revise these concepts thoroughly before starting technical interviews.
          </p>
          <ul className="space-y-3 pt-2">
            {parsedData?.interview_topics?.map((topic, idx) => (
              <li key={idx} className="p-3 bg-sky-50/30 dark:bg-sky-950/10 border border-sky-100/50 dark:border-sky-950/30 rounded-xl">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed">{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Certifications */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/40 space-y-4">
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
            <Trophy className="h-5.5 w-5.5" />
            <h4 className="font-bold text-slate-800 dark:text-white font-sans">Industry Certifications</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Gain massive credibility by pursuing these recognized credentials.
          </p>
          <ul className="space-y-3 pt-2">
            {parsedData?.certifications?.map((cert, idx) => (
              <li key={idx} className="p-3 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-950/30 rounded-xl">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{cert}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
