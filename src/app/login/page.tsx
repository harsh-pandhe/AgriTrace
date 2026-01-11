'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Leaf, AlertCircle, Eye, EyeOff, ShieldCheck, Sparkles, Trees, LogIn } from 'lucide-react';
import { getUnreadCount, getUserNotifications } from '@/lib/notification-service';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { login, user, loading } = useAuth();
  const { toast } = useToast();

  // ✅ Redirect ONLY when user is available
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const [loadingLocal, setLoadingLocal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoadingLocal(true);

    try {
      await login(email, password);

      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });

      // Show notification summary after successful login
      const uid = auth.currentUser?.uid;
      if (uid) {
        try {
          const unread = await getUnreadCount(uid);
          if (unread > 0) {
            toast({
              title: 'You have notifications',
              description: `${unread} unread ${unread === 1 ? 'item' : 'items'}. Check the bell at the top right.`,
            });

            // Show the latest unread notification as a preview toast
            const latestUnread = await getUserNotifications(uid, true, 1);
            if (latestUnread && latestUnread.length > 0) {
              const n = latestUnread[0] as any;
              toast({
                title: n.title || 'New update',
                description: n.message || 'You have a new notification.',
              });
            }
          }
        } catch (notifErr) {
          // Non-blocking: just log
          console.warn('Notification fetch failed:', notifErr);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');

      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: err.message || 'Invalid credentials',
      });
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Background Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-30 blur-[120px] transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${typeof window !== 'undefined' ? window.innerWidth / 2 : 0}px ${typeof window !== 'undefined' ? window.innerHeight / 2 : 0}px, rgba(16, 185, 129, 0.15), transparent 80%)`
        }}
      />

      {/* --- Navigation --- */}
      <nav className="fixed top-0 z-[100] w-full bg-white/70 backdrop-blur-2xl py-3 border-b border-slate-100 transition-all duration-500">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xl shadow-emerald-500/20">
              <Leaf className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-[1000] tracking-tighter uppercase italic">
              Agri<span className="text-emerald-500 not-italic">Trace</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/signup" className="text-sm font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20 pb-12">
        <div className="mx-auto max-w-3xl px-6 text-center relative z-10 w-full">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-emerald-100 bg-emerald-50/50 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-sm text-emerald-800">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Secure Authentication
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-[1000] leading-[0.95] tracking-tighter text-slate-900 sm:text-5xl lg:text-6xl mb-4">
            Welcome to <span className="text-emerald-600">AgriTrace</span>
          </h1>

          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
            Sign in to access your role-based dashboard and manage waste tracking across the entire supply chain.
          </p>

          {/* Form Container */}
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-2xl">
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loadingLocal}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loadingLocal}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loadingLocal}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-60"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-semibold">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loadingLocal}
                  className="w-full h-12 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-emerald-600 transition-all hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loadingLocal ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <LogIn className="h-5 w-5" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold text-slate-400 uppercase">New to agritrace?</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Signup Link */}
              <Link href="/signup" className="block text-center py-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all font-bold text-emerald-700">
                Create an account
              </Link>

              {/* Security Info */}
              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-bold">Encrypted • Multi-factor ready</span>
              </div>
            </div>
          </div>

          {/* Features at bottom */}
          <div className="mt-16 grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
            {[
              { icon: Sparkles, title: 'Fast Access', desc: 'Instant dashboard load' },
              { icon: Trees, title: 'Live Updates', desc: 'Real-time notifications' },
              { icon: ShieldCheck, title: 'Enterprise Security', desc: 'Role-based controls' }
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-emerald-100">
                <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-emerald-100 p-3 text-emerald-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <div className="relative z-10 border-t border-slate-200 bg-white/50 backdrop-blur py-4">
        <div className="mx-auto max-w-3xl px-6 flex flex-wrap justify-center gap-4 text-xs text-slate-600 font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-emerald-100">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            99.9% uptime
          </span>
          <span className="flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-emerald-100">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Role-based security
          </span>
          <span className="flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-emerald-100">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Audit-ready
          </span>
        </div>
      </div>
    </div>
  );
}
