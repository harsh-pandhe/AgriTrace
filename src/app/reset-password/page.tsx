'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Leaf, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const { sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordReset(email);
      toast({ title: 'Password Reset Email Sent', description: 'Check your email for a reset link.' });
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Could not send reset email.');
      toast({ variant: 'destructive', title: 'Reset Failed', description: err.message || 'Could not send reset email.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050a05] p-6">
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.06)_0%,transparent_50%)]" />
      </div>

      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

      {/* Main card */}
      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Back button */}
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">
          <ArrowLeft size={16} />
          Back to login
        </Link>

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
            <Leaf size={32} />
          </div>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10">
          <div className="absolute -top-20 -right-20 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-teal-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 p-8 sm:p-10">
            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-sm text-slate-400">Enter your email to receive a reset link</p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 p-4 border border-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="farmer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 rounded-xl border-white/10 bg-white/[0.04] pl-12 text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-500/15 hover:border-white/20 hover:bg-white/[0.05] transition-all"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-14 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-teal-400 hover:shadow-emerald-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Mail size={18} />
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}