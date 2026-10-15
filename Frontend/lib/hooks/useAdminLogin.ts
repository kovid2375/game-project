"use client";

import { useState, useCallback } from "react";
import { adminApi, AdminLoginResponse } from "../api/admin.api";
import { ApiError, setAccessToken } from "../api/client";

export function useAdminLogin(onSuccess?: (data: AdminLoginResponse) => void) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setError(null);

      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        setError("Please provide your email address.");
        return;
      }
      if (!password) {
        setError("Please enter your password.");
        return;
      }

      setIsLoading(true);

      try {
        const response = await adminApi.login({
          email: trimmedEmail,
          password,
        });

        if (response.accessToken) {
          setAccessToken(response.accessToken);
          // Store admin user info for the dashboard header
          localStorage.setItem(
            "casefile_admin_user",
            JSON.stringify(response.user),
          );
        }

        onSuccess?.(response);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setError(err.message || "Invalid email or password");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Login failed. Please check your credentials.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, onSuccess],
  );

  const reset = useCallback(() => {
    setEmail("");
    setPassword("");
    setError(null);
    setIsLoading(false);
    setShowPassword(false);
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    setError,
    submit,
    reset,
  };
}
