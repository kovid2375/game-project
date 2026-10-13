import { apiClient } from './client';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface RegisterResponse {
  message: string;
  user: UserResponse;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  tokenType: string;
  expiresIn: string | number;
  user: UserResponse;
}

export interface OtpLoginRequestPayload {
  email: string;
}

export interface OtpLoginRequestResponse {
  message: string;
}

export interface OtpLoginVerifyPayload {
  email: string;
  code: string;
}

export interface OtpLoginVerifyResponse {
  message: string;
  accessToken: string;
  tokenType: string;
  expiresIn: string | number;
  user: UserResponse;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetRequestResponse {
  message: string;
}

export interface PasswordResetConfirmPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface PasswordResetConfirmResponse {
  message: string;
}

export const authApi = {
  register(payload: RegisterPayload): Promise<RegisterResponse> {
    return apiClient<RegisterResponse>('/auth/register', {
      method: 'POST',
      data: payload,
    });
  },

  verifyEmail(payload: VerifyEmailPayload): Promise<VerifyEmailResponse> {
    return apiClient<VerifyEmailResponse>('/auth/verify-email', {
      method: 'POST',
      data: payload,
    });
  },

  login(payload: LoginPayload): Promise<LoginResponse> {
    return apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      data: payload,
      credentials: 'include',
    });
  },

  requestOtpLogin(payload: OtpLoginRequestPayload): Promise<OtpLoginRequestResponse> {
    return apiClient<OtpLoginRequestResponse>('/auth/otp-login/request', {
      method: 'POST',
      data: payload,
    });
  },

  verifyOtpLogin(payload: OtpLoginVerifyPayload): Promise<OtpLoginVerifyResponse> {
    return apiClient<OtpLoginVerifyResponse>('/auth/otp-login/verify', {
      method: 'POST',
      data: payload,
      credentials: 'include',
    });
  },

  requestPasswordReset(payload: PasswordResetRequestPayload): Promise<PasswordResetRequestResponse> {
    return apiClient<PasswordResetRequestResponse>('/auth/password-reset/request', {
      method: 'POST',
      data: payload,
    });
  },

  confirmPasswordReset(payload: PasswordResetConfirmPayload): Promise<PasswordResetConfirmResponse> {
    return apiClient<PasswordResetConfirmResponse>('/auth/password-reset/confirm', {
      method: 'POST',
      data: payload,
    });
  },

  getMe(): Promise<UserResponse> {
    return apiClient<UserResponse>('/auth/me', {
      method: 'GET',
    });
  },

  logout(): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  },
};
