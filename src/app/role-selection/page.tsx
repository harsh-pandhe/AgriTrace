'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Truck, AlertCircle, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function RoleSelectionPage() {
  const [role, setRole] = useState<'FARMER' | 'AGENT' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setUserRole } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Please select a role to continue.');
      return;
    }

    if (!user) {
      setError('No user session found. Please log in again.');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      await setUserRole(role);
      toast({
        title: 'Welcome to AgriTrace!',
        description: `You're now registered as a ${role === 'FARMER' ? 'Farmer' : 'Collection Agent'}.`,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to set user role.' });
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'FARMER' as const,
      name: 'Farmer',
      icon: Leaf,
      description: 'Report waste, track collections, earn rewards',
      features: ['Post waste listings', 'Track pickup status', 'View earnings'],
      gradient: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/25',
    },
    {
      id: 'AGENT' as const,
      name: 'Collection Agent',
      icon: Truck,
      description: 'Collect waste, manage deliveries, process efficiently',
      features: ['Claim pickups', 'Manage routes', 'Track deliveries'],
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/25',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">AgriTrace</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20 border border-emerald-500/30 mb-4">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Choose your role</h1>
            <p className="text-sm text-slate-400">Select how you'll use AgriTrace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role cards */}
            <div className="grid gap-4">
              {roles.map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`relative w-full p-5 sm:p-6 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? `bg-white/10 border-white/20 ${r.glow} shadow-lg`
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className={`h-6 w-6 rounded-full bg-gradient-to-r ${r.gradient} flex items-center justify-center`}>
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${r.gradient} flex items-center justify-center flex-shrink-0`}>
                        <r.icon className="h-6 w-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1">{r.name}</h3>
                        <p className="text-sm text-slate-400 mb-3">{r.description}</p>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                          {r.features.map((feature) => (
                            <span
                              key={feature}
                              className="inline-flex items-center gap-1 text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-lg"
                            >
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!role || loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-500">
            You can change your role later in settings
          </p>
        </div>
      </main>
    </div>
  );
}
