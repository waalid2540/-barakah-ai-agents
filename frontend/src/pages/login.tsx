// Barakah AI Agents - Login Page
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { signIn, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const result = await signIn(data.email, data.password);

      if (result.success) {
        toast.success(result.message || 'Signed in successfully!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Sign in failed');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In - Barakah AI Agents</title>
        <meta name="description" content="Sign in to your Barakah AI Agents account" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Barakah AI Agents</span>
              </Link>

              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-300">Sign in to manage your AI agents</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full pl-10 pr-10 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-300">
                Don't have an account?{' '}
                <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Features Preview */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-center text-gray-400 text-sm mb-4">What you'll get:</p>
              <div className="space-y-2">
                {[
                  '6 Intelligent AI Agents',
                  'Complete workflow automation',
                  'Real-time execution monitoring',
                  'Enterprise integrations'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

// Disable SSG for this page since it uses auth context
export async function getServerSideProps() {
  return {
    props: {}
  };
}