import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('gmx_user');
      return raw && raw !== 'undefined' ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      localStorage.removeItem('gmx_user');
      return null;
    }
  });

  async function login(email, password, rememberMe = false) {
    try {
      const { data } = await api.post('/auth/login', { email, password, rememberMe });
      localStorage.setItem('gmx_token', data.token);
      localStorage.setItem('gmx_refresh_token', data.refresh_token);
      localStorage.setItem('gmx_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        throw new Error(err.response.data.message || 'Login failed');
      }
      throw new Error('An unexpected error occurred during login.');
    }
  }

  async function forgotPassword(email) {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to initiate forgot password');
    }
  }

  async function verifyForgotPasswordOtp(email, otp) {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Invalid or expired OTP');
    }
  }

  async function resetPassword(email, otp, new_password) {
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, new_password });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to reset password');
    }
  }

  async function loginWithGoogle(credential) {
    try {
      const { data } = await api.post('/auth/google', { token: credential });
      localStorage.setItem('gmx_token', data.token);
      if (data.refresh_token) {
        localStorage.setItem('gmx_refresh_token', data.refresh_token);
      }
      localStorage.setItem('gmx_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("Google login failed", err);
      throw new Error(err.response?.data?.message || 'Google login failed');
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('gmx_token');
      localStorage.removeItem('gmx_refresh_token');
      localStorage.removeItem('gmx_user');
      setUser(null);
    }
  }

  function hasPermission(permissionName) {
    return user?.permissions?.includes(permissionName) || false;
  }

  const value = useMemo(() => ({ 
    user, 
    login, 
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword,
    loginWithGoogle, 
    logout,
    hasPermission
  }), [user]);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
