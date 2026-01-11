'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Leaf, Tractor, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RoleSelectionPage() {
  const [role, setRole] = useState<'FARMER' | 'AGENT'>();
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
    if (user) {
      setLoading(true);
      try {
        await setUserRole(role);
        toast({
          title: 'Role Selected',
          description: `Welcome! You are now registered as a ${role}.`,
        });
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to set user role.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      setError('No user session found. Please log in again.');
      router.push('/login');
    }
  };

  const roles = [
    {
      id: 'FARMER' as const,
      name: 'Farmer',
      icon: Leaf,
      color: 'teal',
      description: 'Report and track your agricultural waste, connect with recycling agents',
      features: [
        'Report waste easily',
        'Track collections',
        'View statistics',
      ],
    },
    {
      id: 'AGENT' as const,
      name: 'Collection Agent',
      icon: Tractor,
      color: 'green',
      description: 'Manage collections, process waste, and connect with farmers',
      features: [
        'View farmer requests',
        'Manage collections',
        'Process waste',
      ],
    },
  ];

  const colorMap = {
    teal: {
      card: 'border-teal-500 bg-teal-50/50 dark:border-teal-400 dark:bg-teal-900/20',
      hover: 'border-teal-300 dark:hover:border-teal-400',
      icon: 'bg-teal-500 text-white',
      button: 'bg-teal-500',
    },
    green: {
      card: 'border-green-500 bg-green-50/50 dark:border-green-400 dark:bg-green-900/20',
      hover: 'border-green-300 dark:hover:border-green-400',
      icon: 'bg-green-500 text-white',
      button: 'bg-green-500',
    },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-teal-500/5 blur-3xl dark:bg-teal-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-green-500/5 blur-3xl dark:bg-green-500/10" />
      </div>

      <div className="relative flex min-h-screen w-full items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-green-600 p-4 shadow-xl">
                <Leaf className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mb-3 text-4xl font-bold text-gray-900 dark:text-white font-headline">
              Choose Your Role
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Select how you'll use AgriTrace to get started
            </p>
          </div>

          {/* Role Selection Cards */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {roles.map((roleOption) => {
                const Icon = roleOption.icon;
                const colors = colorMap[roleOption.color as keyof typeof colorMap];
                const isSelected = role === roleOption.id;

                return (
                  <button
                    key={roleOption.id}
                    type="button"
                    onClick={() => setRole(roleOption.id)}
                    className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${isSelected
                        ? `${colors.card} shadow-xl`
                        : `border-gray-200 bg-white hover:${colors.hover} dark:border-gray-700 dark:bg-gray-800`
                      }`}
                  >
                    <div className="p-6 text-center">
                      {/* Icon */}
                      <div
                        className={`mb-4 flex justify-center transition-all duration-300 ${isSelected ? 'scale-110' : 'scale-100'
                          }`}
                      >
                        <div
                          className={`rounded-xl p-3 transition-all ${isSelected
                              ? colors.icon
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                        {roleOption.name}
                      </h3>

                      {/* Description */}
                      <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
                        {roleOption.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-1 text-left text-xs mb-4">
                        {roleOption.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                          >
                            <CheckCircle2 className="h-3 w-3 flex-shrink-0" style={{ color: `var(--color-${roleOption.color})` }} />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div
                          className={`inline-flex items-center gap-1 rounded-full ${colors.icon} px-3 py-1 text-xs font-semibold`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Selected
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Continue Button */}
            <Button
              type="submit"
              disabled={!role || loading}
              className="w-full py-3 text-lg font-bold text-white bg-gradient-to-r from-teal-500 via-teal-600 to-green-600 hover:from-teal-600 hover:via-teal-700 hover:to-green-700 dark:from-teal-600 dark:to-green-700 rounded-full transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Continuing...</span>
                </div>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
