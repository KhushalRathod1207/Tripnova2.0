'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Mail, KeyRound, Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth';
import { forgotPasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setServerError(null);

    const result = await forgotPasswordAction(data);

    if (result.error) {
      if (typeof result.error === 'string') {
        setServerError(result.error);
        toast.error(result.error);
      } else {
        setServerError('Please fix the errors in the form.');
      }
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      toast.success(result.success || 'Reset link sent!');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-4rem)] relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]">
      {/* Background lights */}
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
                key="forgot-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="text-2xl font-bold tracking-tight text-white font-sans">Forgot Password</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm">
                    Enter your registered email and we will send you a password recovery link
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {serverError && <Alert variant="error" message={serverError} />}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                      {...register('email')}
                      label="Email Address"
                      placeholder="name@example.com"
                      type="email"
                      leftIcon={<Mail className="h-4.5 w-4.5" />}
                      error={errors.email?.message}
                      disabled={isLoading}
                    />

                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="w-full h-11 text-base font-semibold mt-4"
                      rightIcon={<KeyRound className="h-4 w-4" />}
                    >
                      Send Reset Link
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-zinc-900/50 pt-4 bg-zinc-900/10">
                  <Link href="/login" className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Sign In</span>
                  </Link>
                </CardFooter>
              </motion.div>
            ) : (
              <motion.div
                key="forgot-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 text-center space-y-4"
              >
                <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <Check className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">Reset Link Sent</CardTitle>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
                  We have sent an email with a secure link to reset your password. Please check your inbox and click the link to configure a new password.
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
