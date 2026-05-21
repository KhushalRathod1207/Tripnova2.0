'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, CheckCircle2, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth';
import { resetPasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    setServerError(null);

    const result = await resetPasswordAction(data);

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
      toast.success(result.success || 'Password reset successfully!');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-4rem)] relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]">
      {/* Background ambient lights */}
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
                key="reset-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="text-2xl font-bold tracking-tight text-white">Reset Password</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm">
                    Enter your new secure password details below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {serverError && <Alert variant="error" message={serverError} />}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <PasswordInput
                      {...register('password')}
                      label="New Password"
                      placeholder="••••••••"
                      error={errors.password?.message}
                      disabled={isLoading}
                    />

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
                      className="w-full h-11 text-base font-semibold mt-4"
                      rightIcon={<ShieldCheck className="h-4.5 w-4.5" />}
                    >
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            ) : (
              <motion.div
                key="reset-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 text-center space-y-4"
              >
                <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <Check className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white font-sans">Password Updated</CardTitle>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
                  Your password has been changed successfully. You can now log in using your new credentials.
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="primary" className="w-full">
                      Proceed to Login
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
