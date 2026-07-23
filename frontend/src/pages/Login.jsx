import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { Mail, Lock, Eye, EyeOff, Activity, ShieldAlert, KeyRound, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAUserId, setTwoFAUserId] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);

  const { login, verify2FALogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const selectedRole = queryParams.get('role') || localStorage.getItem('selectedRole');

  useEffect(() => {
    if (!selectedRole) {
      navigate('/role-selection');
      return;
    }

    const savedEmail = localStorage.getItem(`savedEmail_${selectedRole}`);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    } else {
      if (selectedRole === 'Admin') setEmail('admin@hospital.com');
      else if (selectedRole === 'Patient') setEmail('patient@hospital.com');
      else if (selectedRole === 'Doctor') setEmail('sarah.jenkins@hospital.com');
    }
  }, [selectedRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLocal(true);
    try {
      const response = await login(email, password);
      
      if (response && response.requires2FA) {
        setTwoFAUserId(response.userId);
        setShow2FAModal(true);
        setLoadingLocal(false);
        return;
      }

      if (response.role !== selectedRole) {
        addToast(`Invalid credentials for role ${selectedRole}`, 'error');
        setLoadingLocal(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem(`savedEmail_${selectedRole}`, email);
      } else {
        localStorage.removeItem(`savedEmail_${selectedRole}`);
      }

      if (response.role === 'Patient') navigate('/patient');
      else if (response.role === 'Doctor') navigate('/doctor');
      else if (response.role === 'Admin') navigate('/admin');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLocal(false);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    setTwoFALoading(true);
    try {
      const loggedUser = await verify2FALogin(twoFAUserId, twoFACode);
      if (loggedUser) {
        if (rememberMe) {
          localStorage.setItem(`savedEmail_${selectedRole}`, email);
        }
        setShow2FAModal(false);
        if (loggedUser.role === 'Patient') navigate('/patient');
        else if (loggedUser.role === 'Doctor') navigate('/doctor');
        else if (loggedUser.role === 'Admin') navigate('/admin');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data.success) {
        addToast('Reset code generated successfully!', 'success');
        setResetToken(res.data.resetToken);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error generating reset token', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const res = await API.post('/auth/reset-password', {
        token: resetToken,
        newPassword
      });
      if (res.data.success) {
        addToast('Password reset successfully! Please sign in.', 'success');
        setShowForgotModal(false);
        setResetToken('');
        setNewPassword('');
        setForgotEmail('');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-brand-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/20 px-6 py-12 relative overflow-hidden">
      {}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl relative z-10 border border-white/40 dark:border-slate-800/60"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-500/25">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {selectedRole} Portal Sign In
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access your secure {selectedRole} account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                placeholder={`${selectedRole?.toLowerCase()}@hospital.com`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-bold text-brand-500 hover:text-brand-600 transition-all"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {}
          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded accent-brand-500"
              />
              <span>Remember Me</span>
            </label>
            <Link
              to="/role-selection"
              className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600"
            >
              Change Role
            </Link>
          </div>

          <button
            type="submit"
            disabled={loadingLocal}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 flex items-center justify-center gap-2 mt-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loadingLocal ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {selectedRole === 'Patient' && (
          <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            New patient?{' '}
            <Link
              to="/register"
              className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
            >
              Create an Account
            </Link>
          </div>
        )}
        {selectedRole === 'Doctor' && (
          <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            New doctor?{' '}
            <Link
              to="/register-doctor"
              className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
            >
              Create an Account
            </Link>
          </div>
        )}
      </motion.div>

      {}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-md flex flex-col gap-5 border border-white/20 p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <KeyRound className="w-5 h-5 text-indigo-500" /> Reset Password
              </h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setResetToken('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {!resetToken ? (
              
              <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-655 dark:text-slate-400">
                <p className="text-[11px] text-slate-450 leading-relaxed font-normal">
                  Enter your email address below, and we will generate a secure reset link token.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@hospital.com"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md mt-2"
                >
                  {forgotLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    'Generate Reset Token'
                  )}
                </button>
              </form>
            ) : (
              
              <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-655 dark:text-slate-400">
                <p className="text-[11px] text-emerald-500 font-bold leading-relaxed">
                  Reset code generated successfully! Enter the new password below.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label>Reset Token</label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label>New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md mt-2"
                >
                  {resetLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </GlassCard>
        </div>
      )}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-md flex flex-col gap-5 border border-white/20 p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <KeyRound className="w-5 h-5 text-indigo-500" /> Two-Factor Verification
              </h3>
              <button
                onClick={() => setShow2FAModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handle2FAVerify} className="flex flex-col gap-4 text-xs font-semibold text-slate-655 dark:text-slate-400">
              <p className="text-[11px] text-slate-450 leading-relaxed font-normal">
                Please enter the 6-digit verification code from your authenticator app.
              </p>
              <div className="flex flex-col gap-1.5">
                <label>Verification Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                  placeholder="000 000"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white text-center font-mono text-lg tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={twoFALoading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md mt-2"
              >
                {twoFALoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  'Verify Code'
                )}
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Login;
