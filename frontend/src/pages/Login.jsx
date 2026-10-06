import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Compass } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, token, error: authError, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (token) {
      navigate('/dashboard');
    }
    // Clean auth error when mounting
    setError(null);
  }, [token, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      // Errors are already handled in Context API
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sky-400 to-indigo-500 opacity-10"></div>
      </div>

      <div className="max-w-md w-full space-y-6 animate-fade-in relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-450 font-medium">
            Sign in to continue tracking your progress
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/40">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {(localError || authError) && (
              <div className="rounded-xl bg-red-50 border border-red-200/30 p-4 text-red-800 dark:bg-red-950/20 dark:text-red-400 flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">{localError || authError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-11 w-full text-slate-950 dark:text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-11 w-full text-slate-950 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-glow w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 shadow-md shadow-sky-500/10 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Seed User Info Helper */}
          <div className="mt-6 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 p-4 text-center">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider block mb-1">
              Demo Sandbox Credentials
            </span>
            <code className="text-xs font-semibold text-slate-650 text-slate-700 dark:text-slate-300">
              test@example.com / password123
            </code>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
          New here?{' '}
          <Link to="/register" className="font-bold text-sky-600 dark:text-sky-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
