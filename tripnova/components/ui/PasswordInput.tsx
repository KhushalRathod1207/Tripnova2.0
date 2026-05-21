'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from './Input';

interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, 'type'> {
  showStrength?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, label, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <Input
        label={label}
        type={showPassword ? 'text' : 'password'}
        ref={ref}
        leftIcon={<Lock className="h-4.5 w-4.5" />}
        rightIcon={
          <button
            type="button"
            onClick={togglePassword}
            className="focus:outline-none hover:text-zinc-700 dark:hover:text-zinc-300"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4.5 w-4.5" />
            ) : (
              <Eye className="h-4.5 w-4.5" />
            )}
          </button>
        }
        error={error}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
