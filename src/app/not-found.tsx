'use client';

import Link from 'next/link';
import { Leaf, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050a05] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.06)_0%,transparent_50%)]" />
      </div>

      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

      <div className="text-center max-w-md relative z-10">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Leaf size={32} />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-7xl sm:text-8xl font-bold tracking-tighter text-white mb-4">
          4<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">0</span>4
        </h1>
        
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        
        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home size={18} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.04] text-white rounded-xl font-semibold hover:bg-white/[0.08] transition-all border border-white/10 hover:border-white/20"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
