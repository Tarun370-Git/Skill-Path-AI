import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

const LOADING_STAGES = [
  "Analyzing target role and job descriptions...",
  "Evaluating your current skills profile...",
  "Identifying crucial missing skills gaps...",
  "Structuring 8-week actionable curriculum...",
  "Curating high-quality free learning materials...",
  "Formulating portfolio projects and interview guides...",
  "Compiling results and generating PDF blueprint..."
];

export default function SkeletonLoader() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-2xl mx-auto text-center">
      {/* Animated Glowing Logo */}
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-xl shadow-sky-500/30">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 blur-xl opacity-50 animate-pulse"></div>
        <Compass className="h-12 w-12 text-white animate-spin [animation-duration:8s] relative z-10" />
      </div>

      {/* Stage Tracker */}
      <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white transition-colors duration-300">
        Generating Your SkillPath Blueprint
      </h3>
      <p className="mt-2 text-sm font-medium text-sky-600 dark:text-sky-400 h-6">
        {LOADING_STAGES[stageIndex]}
      </p>

      {/* Skeleton Cards */}
      <div className="w-full mt-10 space-y-4">
        {/* Score Card Skeleton */}
        <div className="glass-card rounded-2xl p-6 animate-pulse flex flex-col md:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0"></div>
          <div className="space-y-3 w-full">
            <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
        </div>

        {/* Timeline Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0"></div>
              <div className="space-y-2 w-full">
                <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
