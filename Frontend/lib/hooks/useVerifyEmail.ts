import { useState, useRef, useEffect } from 'react';
import { authApi, VerifyEmailResponse } from '../api/auth.api';
import { ApiError } from '../api/client';

export function useVerifyEmail(
  email: string,
  onSuccess?: (data: VerifyEmailResponse) => void
) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric inputs
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length === 0) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      setError(null);
      return;
    }

    // Support pasting multiple digits
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

    // Auto-focus next field
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

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError('Registration email is missing. Please register first.');
      return;
    }

    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code sent to your email.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authApi.verifyEmail({
        email: email.trim().toLowerCase(),
        code,
      });

      setSuccessMessage(response.message || 'Email verified successfully!');
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Verification failed. Invalid or expired code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setDigits(['', '', '', '', '', '']);
    setError(null);
    setSuccessMessage(null);
    setIsLoading(false);
  };

  return {
    digits,
    handleDigitChange,
    handleKeyDown,
    inputRefs,
    code,
    isLoading,
    error,
    successMessage,
    submit,
    reset,
  };
}
