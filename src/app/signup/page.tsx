'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Leaf, AlertCircle, Eye, EyeOff, Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();

  const [loadingLocal, setLoadingLocal] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoadingLocal(true);
    try {
      await signup(email, password);
      toast({
        title: 'Signup Successful',
        description: 'Welcome to AgriTrace!',
      });
      router.push('/role-selection');
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: err.message || 'Could not create account',
      });
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#fafafa] font-sans text-slate-900 selection:bg-emerald-500 selection:text-white p-6">
      {/* Animated gradient background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 blur-[120px]" style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.15), transparent 80%)` }} />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-40 right-32 w-3 h-3 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-32 left-40 w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }} />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-2xl shadow-emerald-500/50">
            <Leaf size={32} />
          </div>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-[3rem] bg-white shadow-2xl border border-slate-100">
          <div className="absolute -top-20 -right-20 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-emerald-400/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 p-10 sm:p-12">
            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-[1000] tracking-tighter text-slate-900 mb-2 flex items-center justify-center gap-3">
                CREATE <span className="text-emerald-500 italic">ACCOUNT</span>
              </h1>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <Sparkles size={14} /> Join AgriTrace today
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Email field */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 text-sm font-bold placeholder:text-slate-400 transition-all focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 pr-12 text-sm font-bold placeholder:text-slate-400 transition-all focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-3 rounded-2xl bg-red-50 border-2 border-red-100 p-4 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-bold">{error}</span>
                </div>
              )}

              {/* Signup button */}
              <Button
                type="submit"
                disabled={loadingLocal}
                className="w-full h-14 text-base font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                {loadingLocal ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <UserPlus size={20} className="mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Login link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500 font-bold">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-700 transition-colors font-black underline underline-offset-2"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
          Sustainable Agriculture Platform
        </p>
      </div>
    </div>
  );
}
