import { useState } from 'react';
import { authApi, LoginResponse } from '../api/auth.api';
import { ApiError, setAccessToken } from '../api/client';

export function useLogin(onSuccess?: (data: LoginResponse) => void) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please provide your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: trimmedEmail,
        password,
      });

      if (response.accessToken) {
        setAccessToken(response.accessToken);
      }

      if (rememberMe) {
        localStorage.setItem('casefile_saved_email', trimmedEmail);
      } else {
        localStorage.removeItem('casefile_saved_email');
      }

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid email or password');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setIsLoading(false);
    setShowPassword(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    setError,
    submit,
    reset,
  };
}
