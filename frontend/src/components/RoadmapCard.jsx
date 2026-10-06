import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Calendar, ArrowRight } from 'lucide-react';

export default function RoadmapCard({ roadmap }) {
  const { id, dream_job, current_skills, readiness_score, created_at, progress_items } = roadmap;

  // Calculate completion percentage if progress items are attached
  const completedWeeks = progress_items ? progress_items.filter(item => item.completed).length : 0;
  const completionPercentage = progress_items ? Math.round((completedWeeks / 8) * 100) : 0;

  const dateFormatted = new Date(created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between">
      <div>
        {/* Job Title Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-500 dark:text-sky-400">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-sky-500 transition-colors duration-200">
                {dream_job}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                <Calendar className="h-3 w-3" />
                <span>{dateFormatted}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400">
              {readiness_score}%
            </span>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Match
            </span>
          </div>
        </div>

        {/* Input Skills chips */}
        <div className="mt-4">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Input Skills:</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {current_skills.split(',').slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/20"
              >
                {skill.trim()}
              </span>
            ))}
            {current_skills.split(',').length > 3 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold self-center ml-1">
                +{current_skills.split(',').length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress slider bar & Detailed link */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        {progress_items && (
          <div className="mb-4 space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Learning Progress</span>
              <span className="text-slate-800 dark:text-slate-200">{completionPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
              <div
                style={{ width: `${completionPercentage}%` }}
                className="h-full bg-sky-500 dark:bg-sky-400 rounded-full transition-all duration-500"
              ></div>
            </div>
          </div>
        )}

        <Link
          to={`/roadmap/${id}`}
          className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-slate-50 hover:bg-sky-50 dark:bg-slate-900/40 dark:hover:bg-sky-950/20 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 dark:hover:text-sky-400 hover:text-sky-600 border border-slate-200/30 dark:border-slate-800/30 transition-all duration-200"
        >
          <span>View Detailed Roadmap</span>
          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
