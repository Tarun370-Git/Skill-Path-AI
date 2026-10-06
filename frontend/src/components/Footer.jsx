import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/40 bg-white/40 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/40 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} SkillPath AI. Created for BCA Final Year Project.
        </p>
        <div className="flex gap-6 text-sm text-slate-400 dark:text-slate-500">
          <span>AI-Powered Career Mentor</span>
          <span>•</span>
          <span>Skill Gap Analyzer</span>
        </div>
      </div>
    </footer>
  );
}
