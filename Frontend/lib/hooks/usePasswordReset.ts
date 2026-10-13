import { useState, useRef, useEffect } from 'react';
import {
  authApi,
  PasswordResetConfirmResponse,
} from '../api/auth.api';
import { ApiError } from '../api/client';

export function usePasswordReset(
  onSuccess?: (data: PasswordResetConfirmResponse) => void
) {
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'confirm' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const requestResetCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.requestPasswordReset({ email: trimmedEmail });
      setSuccessMessage(res.message);
      setStep('confirm');
      setCountdown(30);
      setCanResend(false);
      setDigits(['', '', '', '', '', '']);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send reset code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendResetCode = async () => {
    if (!canResend) return;
    setError(null);
    setIsLoading(true);

    try {
      await authApi.requestPasswordReset({ email: email.trim().toLowerCase() });
      setCountdown(30);
      setCanResend(false);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to resend code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');

    if (cleanValue.length === 0) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      setError(null);
      return;
    }

    if (cleanValue.length > 1) {
      const pastedDigits = cleanValue.slice(0, 6).split('');
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedDigits[i] || '';
      }
      setDigits(newDigits);
      setError(null);

      const nextFocus = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanValue.slice(-1);
    setDigits(newDigits);
    setError(null);

    if (index < 5 && cleanValue) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const code = digits.join('');

  const validatePassword = (): string | null => {
    if (newPassword.length < 12) {
      return 'Password must be at least 12 characters long.';
    }
    if (!/[a-z]/.test(newPassword)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[A-Z]/.test(newPassword)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[0-9]/.test(newPassword)) {
      return 'Password must contain at least one number.';
    }
    if (newPassword !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const confirmReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.confirmPasswordReset({
        email: email.trim().toLowerCase(),
        code,
        newPassword,
      });

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid or expired code.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setEmail('');
    setDigits(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setStep('request');
    setError(null);
    setSuccessMessage(null);
    setIsLoading(false);
    setCountdown(30);
    setCanResend(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return {
    email,
    setEmail,
    digits,
    step,
    setStep,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleDigitChange,
    handleKeyDown,
    inputRefs,
    code,
    isLoading,
    error,
    setError,
    successMessage,
    countdown,
    canResend,
    requestResetCode,
    resendResetCode,
    confirmReset,
    reset,
  };
}
