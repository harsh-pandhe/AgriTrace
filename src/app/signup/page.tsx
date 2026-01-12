'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, AlertCircle, Eye, EyeOff, ArrowRight, ArrowLeft, ChevronRight, Sparkles, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

const testimonials = [
  {
    quote: "Joining AgriTrace was the best decision for my farm. The onboarding was seamless and I started tracking waste within minutes.",
    author: "Suresh Reddy",
    role: "Farmer, Telangana",
    avatar: "SR"
  },
  {
    quote: "The platform helped us connect with recyclers directly. No more middlemen, just transparent transactions.",
    author: "Kavitha Devi",
    role: "Organic Farmer, Karnataka",
    avatar: "KD"
  },
  {
    quote: "As a new agent, the training was minimal. The app is so intuitive that I was collecting waste on day one.",
    author: "Mohammed Ismail",
    role: "Collection Agent, Tamil Nadu",
    avatar: "MI"
  }
];

const features = [
  { icon: Sparkles, text: "AI-Powered Tracking" },
  { icon: Shield, text: "Secure & Reliable" },
  { icon: Zap, text: "Real-time Updates" }
];

const benefits = [
  "Track waste from farm to recycler",
  "Get paid for your agricultural waste",
  "Reduce environmental impact",
  "Join 10,000+ verified farmers"
];

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const { signup, user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push('/role-selection');
    }
  }, [user, loading, router]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoadingLocal(true);

    try {
      await signup(email, password);
      toast({ title: 'Account created!', description: 'Welcome to AgriTrace.' });
      router.push('/role-selection');
    } catch (err: any) {
      setError(err.message || 'Could not create account');
      toast({ variant: 'destructive', title: 'Signup Failed', description: err.message });
    } finally {
      setLoadingLocal(false);
    }
  };

  const changeTestimonial = useCallback((direction: 'next' | 'prev') => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTestimonial((prev) => 
        direction === 'next' 
          ? (prev + 1) % testimonials.length 
          : (prev - 1 + testimonials.length) % testimonials.length
      );
      setIsAnimating(false);
    }, 300);
  }, []);

  return (
    <div className="min-h-screen bg-[#050a05] flex flex-col lg:flex-row overflow-hidden">
      {/* Fixed Logo - Top Left */}
      <Link 
        href="/" 
        className={`fixed top-6 left-6 sm:top-8 sm:left-8 z-50 flex items-center gap-3 group transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      >
        <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
          <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">AgriTrace</span>
      </Link>

      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.06)_0%,transparent_50%)]" />
      </div>

      {/* Left Panel - Signup Form */}
      <div 
        className={`w-full lg:w-[45%] min-h-screen flex flex-col items-center justify-center px-6 sm:px-10 md:px-16 lg:px-12 xl:px-20 py-24 sm:py-16 relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
      >
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        {/* Form Container - Centered */}
        <div className="w-full max-w-[440px] relative z-10">
          {/* Welcome Text */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white mb-3 leading-tight">Create account</h1>
            <p className="text-slate-400 text-base sm:text-lg">Join the AgriTrace community today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Email */}
            <div className="space-y-2.5">
              <label className="block text-sm font-medium text-slate-300 tracking-wide">Email address</label>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loadingLocal}
                  className="w-full h-14 px-5 py-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-base placeholder:text-slate-500 focus:outline-none focus:bg-white/[0.06] focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300 disabled:opacity-50 hover:border-white/20 hover:bg-white/[0.05]"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2.5">
              <label className="block text-sm font-medium text-slate-300 tracking-wide">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loadingLocal}
                  className="w-full h-14 px-5 py-4 pr-14 rounded-xl bg-white/[0.04] border border-white/10 text-white text-base placeholder:text-slate-500 focus:outline-none focus:bg-white/[0.06] focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300 disabled:opacity-50 hover:border-white/20 hover:bg-white/[0.05]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2.5">
              <label className="block text-sm font-medium text-slate-300 tracking-wide">Confirm password</label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loadingLocal}
                  className="w-full h-14 px-5 py-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-base placeholder:text-slate-500 focus:outline-none focus:bg-white/[0.06] focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300 disabled:opacity-50 hover:border-white/20 hover:bg-white/[0.05]"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              </div>
              <p className="text-xs text-slate-500">Must be at least 6 characters</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-base animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loadingLocal}
              className="w-full h-14 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-base font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loadingLocal ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-10 sm:mt-12 text-center">
            <p className="text-slate-500 text-sm mb-4">Already have an account?</p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 w-full h-14 px-6 rounded-xl bg-white/[0.04] border border-white/10 text-white text-base font-semibold hover:bg-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <span>Sign in to your Account</span>
              <ArrowRight className="h-5 w-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Bottom Features - Mobile Only */}
        <div className="lg:hidden flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10 sm:mt-12 pt-8 border-t border-white/5">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-500">
              <feature.icon className="h-4 w-4 text-emerald-500/70" />
              <span className="text-sm">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Testimonials */}
      <div className={`hidden lg:flex lg:w-[55%] relative overflow-hidden transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-[#071a0f] to-teal-950/60" />
        
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-emerald-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />

        {/* Decorative leaf watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]">
          <Leaf className="h-[500px] w-[500px] text-emerald-400" strokeWidth={0.3} />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 12}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between px-12 xl:px-16 2xl:px-20 py-12 w-full">
          {/* Top features bar */}
          <div className="flex items-center gap-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <feature.icon className="h-4 w-4 text-emerald-400" />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial Section */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white leading-tight mb-12">
              Why Join<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">AgriTrace?</span>
            </h2>

            {/* Benefits list */}
            <div className="space-y-4 mb-12">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-base">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Quote icon */}
            <div className="text-6xl text-emerald-500/20 font-serif leading-none mb-4">"</div>

            {/* Testimonial content with animation */}
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <p className="text-slate-300 text-lg xl:text-xl leading-relaxed mb-8 max-w-lg">
                {testimonials[currentTestimonial].quote}
              </p>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">{testimonials[currentTestimonial].author}</p>
                  <p className="text-slate-400 text-sm">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </div>

            {/* Navigation & Dots */}
            <div className="flex items-center gap-6 mt-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeTestimonial('prev')}
                  className="h-11 w-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => changeTestimonial('next')}
                  className="h-11 w-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-105"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Dots indicator */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setCurrentTestimonial(i);
                        setIsAnimating(false);
                      }, 300);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentTestimonial 
                        ? 'w-8 bg-emerald-400' 
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="mt-auto">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 max-w-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-[1.02]">
              {/* Decorative shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {/* Decorative elements */}
              <div className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-xl font-light">+</span>
              </div>
              <div className="absolute bottom-4 right-4 flex -space-x-2">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 border-2 border-emerald-500 shadow-lg" />
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 border-2 border-emerald-500 shadow-lg" />
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 border-2 border-emerald-500 shadow-lg" />
              </div>

              <h3 className="text-white font-bold text-xl mb-2 pr-12">
                10,000+ farmers already onboard
              </h3>
              <p className="text-emerald-100/80 text-sm mb-5 max-w-[240px]">
                Start your sustainable farming journey with AgriTrace today.
              </p>
              <div className="inline-flex items-center gap-2 text-white font-semibold text-sm">
                <span>Free to join</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-40px) translateX(-10px); opacity: 0.3; }
          75% { transform: translateY(-20px) translateX(5px); opacity: 0.5; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
