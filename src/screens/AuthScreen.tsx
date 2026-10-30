import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Dumbbell,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { AppUser } from '../types';
import { CHARACTER_IMAGE } from '../data/exercises';
import { ShareModal } from '../components/ShareModal';

interface AuthScreenProps {
  allUsers: AppUser[];
  onLogin: (user: AppUser) => void;
  onRegister: (newUser: AppUser) => void;
  onContinueAsGuest?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  allUsers,
  onLogin,
  onRegister,
  onContinueAsGuest,
}) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMessage('Please enter a username');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a password');
      return;
    }

    if (isSignUp) {
      // Validate confirm password
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }
      if (password.length < 4) {
        setErrorMessage('Password must be at least 4 characters');
        return;
      }
      // Check existing
      const existing = allUsers.find(
        (u) => u.username.toLowerCase() === cleanUsername
      );
      if (existing) {
        setErrorMessage('Username already taken. Please choose another.');
        return;
      }

      const newUser: AppUser = {
        id: `usr_${Date.now()}`,
        username: cleanUsername,
        password,
        role: 'MEMBER', // All normal signups are normal members
        membershipTier: 'FREE',
        isPaid: false,
        createdAt: new Date().toISOString().split('T')[0],
        workoutCount: 0,
      };

      onRegister(newUser);
    } else {
      // Login
      const user = allUsers.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername && u.password === password
      );
      if (!user) {
        setErrorMessage('Invalid username or password. Please check your credentials.');
        return;
      }
      onLogin(user);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6] p-4 sm:p-6 justify-between overflow-y-auto max-w-md mx-auto w-full">
      {/* Brand Header */}
      <div className="pt-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border-2 border-slate-200 overflow-hidden mx-auto mb-3 shadow-md relative flex items-center justify-center">
          <img
            src={CHARACTER_IMAGE}
            alt="GoldenBar Mannequin"
            className="w-full h-full object-cover object-top"
          />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 font-semibold uppercase tracking-wider">
          <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
          <span>GoldenBar: AI Gym Coach</span>
        </div>
        <h2 className="font-heading font-bold text-2xl text-slate-900 mt-0.5">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          {isSignUp
            ? 'Start your personalized 30-day training journey'
            : 'Sign in to access your workouts, progress & history'}
        </p>

        {/* 1-Tap Guest / Friend Tester Entry */}
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-yellow-400/10 border-2 border-amber-400/50 shadow-xs flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-heading font-bold text-xs text-slate-900">
                Friend & Tester Quick Access
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
              Instant
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            Testing with friends? Tap below to explore 50+ workouts & 3D muscle mannequins without a password:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 font-heading font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Explore as Guest (1-Tap)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-amber-300 text-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Share with Friends"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="my-auto py-4">
        {/* Sign In / Sign Up Segmented Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 mb-5">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              !isSignUp
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              isSignUp
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Username */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Username
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. rahul or admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-2xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-2xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Required in Sign Up) */}
          {isSignUp && (
            <div className="animate-in fade-in duration-200">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-2xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-12 mt-2 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-heading font-semibold text-sm shadow-lg shadow-sky-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>{isSignUp ? 'Register & Continue' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-2">
        <p className="text-[11px] text-slate-400">
          GoldenBar: AI Gym Coach · Offline-First & Future Paid Subscriptions
        </p>
      </div>

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
};
