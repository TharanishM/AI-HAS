import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setProfile(res.data.profile);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.requires2FA) {
        return { requires2FA: true, userId: res.data.userId };
      }
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile);
        addToast(`Welcome back, ${res.data.user.name}!`, 'success');
        return res.data.user;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      addToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verify2FALogin = async (userId, token) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/2fa/verify-login', { userId, token });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile);
        addToast(`Welcome back, ${res.data.user.name}!`, 'success');
        return res.data.user;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid 2FA code';
      addToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (patientData) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', patientData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setProfile(res.data.patient);
        addToast('Registration successful! Welcome to the portal.', 'success');
        return res.data.user;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      addToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const res = await API.put('/auth/profile', updatedData);
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        addToast('Profile updated successfully!', 'success');
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed';
      addToast(msg, 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    addToast('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        verify2FALogin,
        register,
        logout,
        updateProfile,
        setUser,
        setProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
