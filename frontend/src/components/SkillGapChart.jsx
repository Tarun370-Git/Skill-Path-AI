import React, { useEffect, useState } from 'react';

export default function SkillGapChart({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score from 0 to target score on load
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 150);
    return () => clearTimeout(timer);
  }, [score]);

  // SVG parameters
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Determine color theme based on score value
  const getScoreTheme = (val) => {
    if (val < 40) return {
      text: 'text-red-500 dark:text-red-400',
      stroke: 'url(#redGradient)',
      bg: 'stroke-red-100 dark:stroke-red-950/20',
      label: 'Needs Effort',
      badge: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/50'
    };
    if (val < 70) return {
      text: 'text-amber-500 dark:text-amber-400',
      stroke: 'url(#amberGradient)',
      bg: 'stroke-amber-100 dark:stroke-amber-950/20',
      label: 'Intermediate',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50'
    };
    return {
      text: 'text-emerald-500 dark:text-emerald-400',
      stroke: 'url(#emeraldGradient)',
      bg: 'stroke-emerald-100 dark:stroke-emerald-950/20',
      label: 'Career Ready',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50'
    };
  };

  const theme = getScoreTheme(score);

  return (
    <div className="flex flex-col items-center p-6 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-md">
      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
        Overall Readiness
      </h4>

      {/* 1. Circular Chart */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            {/* Define color gradients for the gauge */}
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            className={`transition-colors duration-300 ${theme.bg}`}
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Progress circle */}
          <circle
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Core details inside circle */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold tracking-tight ${theme.text}`}>
            {animatedScore}%
          </span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            score
          </span>
        </div>
      </div>

      {/* Badge label */}
      <span className={`mt-5 px-3 py-1 text-xs font-bold rounded-full border ${theme.badge}`}>
        {theme.label}
      </span>

      {/* 2. Linear Progress Bar */}
      <div className="w-full mt-6 space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-500 dark:text-slate-400">Match score</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold">{animatedScore} / 100</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${animatedScore}%` }}
            className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
              score < 40 
                ? 'from-red-400 to-red-500 shadow-md shadow-red-500/20' 
                : score < 70 
                  ? 'from-amber-400 to-amber-500 shadow-md shadow-amber-500/20' 
                  : 'from-emerald-400 to-emerald-500 shadow-md shadow-emerald-500/20'
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
}
