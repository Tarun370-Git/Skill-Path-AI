import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Sparkles, CheckCircle2, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Landing() {
  const { token } = useAuth();

  return (
    <div className="relative isolate overflow-hidden min-h-screen flex flex-col">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sky-400 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
      </div>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 flex-grow">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200/30">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Next-Gen Career Mentorship</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Accelerate Your Journey to Your{' '}
            <span className="bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-600 bg-clip-text text-transparent">
              Dream Job
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-350 max-w-2xl mx-auto font-medium">
            Bridge the gap between where you are and where you want to be. SkillPath AI maps out your customized 8-week learning roadmap with target resources, certification blueprints, and gap analysis.
          </p>

          {/* CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={token ? "/dashboard" : "/register"}
              className="btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:scale-[1.02] transition-transform duration-200"
            >
              <span>{token ? "Go to Dashboard" : "Create Free Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={token ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <span>Demo Login</span>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="mt-24 sm:mt-32">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Why use SkillPath AI?
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-semibold">
              Packed with premium features to accelerate your technical expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-start hover:shadow-xl transition-all duration-300">
              <div className="rounded-xl bg-sky-50 dark:bg-sky-950/30 p-3 text-sky-500 dark:text-sky-400 mb-4">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">AI Roadmap Blueprint</h3>
              <p className="mt-2 text-sm text-slate-505 text-slate-500 dark:text-slate-400 leading-relaxed">
                Receive an actionable week-by-week curriculum with tasks and specific focus skills.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-start hover:shadow-xl transition-all duration-300">
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 text-emerald-500 dark:text-emerald-400 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Skill Gap Analysis</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Compare your current abilities against hiring requirements to isolate missing competencies.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-start hover:shadow-xl transition-all duration-300">
              <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 p-3 text-indigo-500 dark:text-indigo-400 mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Progress Tracking</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Check off weekly modules as you complete topics and projects, visualizing your path to completion.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-start hover:shadow-xl transition-all duration-300">
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 text-amber-500 dark:text-amber-400 mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Exportable PDFs</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Download your personalized study blueprint as a clean, structured PDF report for offline learning.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Decorative Bottom shape */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-sky-300 to-indigo-500 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72rem]"></div>
      </div>
    </div>
  );
}
