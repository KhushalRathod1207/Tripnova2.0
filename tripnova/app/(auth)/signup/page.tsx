'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Mail, User, UserPlus, Check, X } from 'lucide-react';
import { toast } from 'sonner';

import { signupSchema, type SignupInput } from '@/lib/validations/auth';
import { signUpAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  // Password strength checks
  const [strength, setStrength] = useState({
    score: 0,
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  useEffect(() => {
    const hasLength = passwordValue.length >= 8;
    const hasUpper = /[A-Z]/.test(passwordValue);
    const hasLower = /[a-z]/.test(passwordValue);
    const hasNumber = /[0-9]/.test(passwordValue);
    const hasSpecial = /[^A-Za-z0-9]/.test(passwordValue);

    let score = 0;
    if (passwordValue.length > 0) {
      if (hasLength) score += 1;
      if (hasUpper) score += 1;
      if (hasLower) score += 1;
      if (hasNumber) score += 1;
      if (hasSpecial) score += 1;
    }

    setStrength({
      score,
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
    });
  }, [passwordValue]);

  const getStrengthLabel = () => {
    if (strength.score === 0) return { label: 'Empty', color: 'bg-zinc-800' };
    if (strength.score <= 2) return { label: 'Weak', color: 'bg-rose-500' };
    if (strength.score <= 4) return { label: 'Moderate', color: 'bg-amber-500' };
    return { label: 'Strong', color: 'bg-emerald-500' };
  };

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setServerError(null);

    const result = await signUpAction(data);

    if (result.error) {
      if (typeof result.error === 'string') {
        setServerError(result.error);
        toast.error(result.error);
      } else {
        setServerError('Please fix errors in the form.');
      }
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      toast.success(result.success || 'Signed up successfully!');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-4rem)] relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-violet-600/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-cyan-600/10 blur-[90px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
              <Compass className="h-6 w-6" />
            </span>
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent font-extrabold">
              TripNova
            </span>
          </Link>
        </div>

        <Card variant="glass" className="border-white/5 bg-zinc-950/40 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="text-2xl font-bold tracking-tight text-white">Create an account</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm">
                    Enter your details below to build your TripNova profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {serverError && <Alert variant="error" message={serverError} />}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                      {...register('name')}
                      label="Full Name"
                      placeholder="John Doe"
                      type="text"
                      leftIcon={<User className="h-4.5 w-4.5" />}
                      error={errors.name?.message}
                      disabled={isLoading}
                    />

                    <Input
                      {...register('email')}
                      label="Email Address"
                      placeholder="name@example.com"
                      type="email"
                      leftIcon={<Mail className="h-4.5 w-4.5" />}
                      error={errors.email?.message}
                      disabled={isLoading}
                    />

                    <div className="space-y-2">
                      <PasswordInput
                        {...register('password')}
                        label="Password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        disabled={isLoading}
                      />

                      {/* Password Strength Indicator */}
                      {passwordValue.length > 0 && (
                        <div className="space-y-2 p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400">Password Strength:</span>
                            <span
                              className={`font-semibold ${
                                strength.score <= 2
                                  ? 'text-rose-400'
                                  : strength.score <= 4
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {getStrengthLabel().label}
                            </span>
                          </div>

                          {/* Bars */}
                          <div className="grid grid-cols-5 gap-1 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  i < strength.score
                                    ? getStrengthLabel().color
                                    : 'bg-zinc-800'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Rules Checkbox list */}
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1">
                            <div className="flex items-center gap-1.5 text-[10px]">
                              {strength.hasLength ? (
                                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                              ) : (
                                <X className="h-3 w-3 text-zinc-600 shrink-0" />
                              )}
                              <span className={strength.hasLength ? 'text-zinc-300' : 'text-zinc-500'}>
                                Min 8 characters
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              {strength.hasUpper ? (
                                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                              ) : (
                                <X className="h-3 w-3 text-zinc-600 shrink-0" />
                              )}
                              <span className={strength.hasUpper ? 'text-zinc-300' : 'text-zinc-500'}>
                                One uppercase
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              {strength.hasLower ? (
                                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                              ) : (
                                <X className="h-3 w-3 text-zinc-600 shrink-0" />
                              )}
                              <span className={strength.hasLower ? 'text-zinc-300' : 'text-zinc-500'}>
                                One lowercase
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              {strength.hasNumber ? (
                                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                              ) : (
                                <X className="h-3 w-3 text-zinc-600 shrink-0" />
                              )}
                              <span className={strength.hasNumber ? 'text-zinc-300' : 'text-zinc-500'}>
                                One number
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] col-span-2">
                              {strength.hasSpecial ? (
                                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                              ) : (
                                <X className="h-3 w-3 text-zinc-600 shrink-0" />
                              )}
                              <span className={strength.hasSpecial ? 'text-zinc-300' : 'text-zinc-500'}>
                                One special character (!@#$ etc.)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <PasswordInput
                      {...register('confirmPassword')}
                      label="Confirm Password"
                      placeholder="••••••••"
                      error={errors.confirmPassword?.message}
                      disabled={isLoading}
                    />

                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="w-full h-11 text-base font-semibold mt-6"
                      rightIcon={<UserPlus className="h-4 w-4" />}
                    >
                      Create Account
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-zinc-900/50 pt-4 bg-zinc-900/10">
                  <p className="text-sm text-zinc-400">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </motion.div>
            ) : (
              <motion.div
                key="signup-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 text-center space-y-4"
              >
                <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <Check className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">Check your email</CardTitle>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
                  We have sent a verification link to your email. Please click the link inside the email to activate your account and start planning.
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="outline" className="w-full border-zinc-800 text-zinc-300 hover:text-white">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
