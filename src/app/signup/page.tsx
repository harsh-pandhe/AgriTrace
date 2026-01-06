'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Leaf, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();

  const [loadingLocal, setLoadingLocal] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoadingLocal(true);
    try {
      await signup(email, password);
      toast({
        title: 'Signup Successful',
        description: 'Verification email sent. Please verify your email before logging in.',
      });
      // After signup, ask the user to verify email — let them choose role after verifying
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 dark:bg-yellow-600 rounded-bl-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-400 dark:bg-red-500 rounded-tr-3xl -z-10" />

      {/* Left Panel - Welcome Section */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700 items-center justify-center p-8 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-40 h-40 border border-white rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 border border-white rounded-full" />
        </div>

        <div className="relative z-10 text-center text-white max-w-sm flex flex-col items-center">
          {/* Logo */}
          <div className="mb-12 flex justify-center">
            <div className="bg-white/25 backdrop-blur-md rounded-2xl p-4 shadow-lg">
              <Leaf className="h-10 w-10 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-6 font-headline leading-tight">Join Us Today!</h1>
          <p className="text-lg text-white/95 mb-12 leading-relaxed font-light">
            Start managing your agricultural waste efficiently and connect with recyclers
          </p>

          <Link href="/login" className="w-full max-w-xs">
            <Button
              className="w-full bg-white/90 hover:bg-white text-green-600 font-bold text-lg py-3 rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              SIGN IN
            </Button>
          </Link>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg p-3">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2 text-center font-headline">
            Create Account
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-sm">
            Enter your information to create an account
          </p>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email field */}
            <div>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:focus:border-green-400"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:focus:border-green-400"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Signup button */}
            <Button
              type="submit"
              disabled={loadingLocal}
              className="w-full py-3 text-lg font-bold text-white bg-gradient-to-r from-green-500 via-green-600 to-teal-600 hover:from-green-600 hover:via-green-700 hover:to-teal-700 dark:from-green-600 dark:to-teal-700 rounded-full transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-lg"
            >
              {loadingLocal ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'CREATE ACCOUNT'
              )}
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors underline underline-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
