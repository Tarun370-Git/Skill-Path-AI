import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Compass, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/40 bg-white/70 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            SkillPath <span className="text-sky-500 dark:text-sky-400 font-extrabold">AI</span>
          </span>
        </Link>

        {/* Action Controls */}
        <nav className="flex items-center gap-1 sm:gap-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/40'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/40'
                }`}
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white text-sm font-medium px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Divider */}
          <span className="h-6 w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/40 dark:hover:text-white transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Logout if user is authenticated */}
          {user && (
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
