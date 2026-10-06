import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { User, Mail, Compass, Award, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.fetchRoadmaps();
        setRoadmaps(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate statistics
  const totalRoadmaps = roadmaps.length;
  let totalWeeksCompleted = 0;
  
  roadmaps.forEach(r => {
    if (r.progress_items) {
      totalWeeksCompleted += r.progress_items.filter(item => item.completed).length;
    }
  });

  return (
    <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
        <User className="h-7 w-7 text-sky-500" />
        <span>Your Profile & Progress Tracker</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left User card (1/3) */}
        <div className="md:col-span-1 glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/40 text-center flex flex-col items-center justify-between">
          <div className="space-y-4 w-full">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h3>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <Mail className="h-3.5 w-3.5" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-8 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 border border-red-200/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right Stats panels (2/3) */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Stat 1 */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40 flex items-center gap-4">
              <div className="rounded-xl bg-sky-50 dark:bg-sky-950/30 p-3 text-sky-500 dark:text-sky-400">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-800 dark:text-white block leading-none">
                  {loading ? '...' : totalRoadmaps}
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-1">
                  Roadmaps Generated
                </span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40 flex items-center gap-4">
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 text-emerald-500 dark:text-emerald-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-800 dark:text-white block leading-none">
                  {loading ? '...' : totalWeeksCompleted}
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-1">
                  Weekly Modules Completed
                </span>
              </div>
            </div>
          </div>

          {/* Action List details */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4">Portfolio Statistics Overview</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <span className="text-slate-500">Database Engine</span>
                <span className="text-slate-800 dark:text-white">SQLite 3</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <span className="text-slate-500">Auth Token Protocol</span>
                <span className="text-slate-800 dark:text-white">JWT (HS256)</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold pb-1">
                <span className="text-slate-500">AI LLM Model</span>
                <span className="text-slate-800 dark:text-white">Google Gemini API</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
