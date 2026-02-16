/**
 * Register Page
 * User registration with ECC key pair generation
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, Eye, EyeOff, Shield, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, setUser } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Clear error when input changes
  useEffect(() => {
    if (error) setError('');
  }, [username, email, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({ email, username, password });
      
      if (result.success && result.user) {
        setUser(result.user);
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#86862d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12 pt-20 sm:pt-24">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#86862d]/20 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
            <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-[#86862d]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Create Account</h1>
          <p className="text-neutral-400 text-sm sm:text-base">Join Inventa to protect your documents</p>
        </div>

        {/* Security Notice */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[#86862d]/10 border border-[#86862d]/30 rounded-lg sm:rounded-xl">
          <div className="flex items-start gap-2 sm:gap-3">
            <Key className="w-4 h-4 sm:w-5 sm:h-5 text-[#86862d] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm text-[#86862d] font-medium">Secure Key Generation</p>
              <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5 sm:mt-1">
                An ECC P-256 key pair will be generated for signing your documents.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-neutral-900/50 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 text-red-400">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4 sm:space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  required
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#86862d] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#86862d] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#86862d] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              <p className="mt-1 text-[10px] sm:text-xs text-neutral-500">Minimum 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#86862d] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 sm:mt-8 py-2.5 sm:py-3 px-4 sm:px-6 bg-[#86862d] hover:bg-[#9a9a34] text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="hidden sm:inline">Creating Account...</span>
                <span className="sm:hidden">Creating...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Account
              </>
            )}
          </button>

          {/* Login Link */}
          <p className="mt-4 sm:mt-6 text-center text-neutral-400 text-sm sm:text-base">
            Already have an account?{' '}
            <Link to="/login" className="text-[#86862d] hover:text-[#9a9a34] font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
