import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { ROLE_ORDER, ROLE_THEMES, getRoleTheme } from '../config/roles';

const Login = () => {
  const [activeRole, setActiveRole] = useState('Patient');
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
  const roleTabRefs = useRef({});

  const { login, verify2FALogin, user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const theme = getRoleTheme(activeRole);
  const ActiveIcon = theme.icon;

  const handleRoleKeyDown = (event) => {
    const currentIndex = ROLE_ORDER.indexOf(activeRole);
    const nextIndex = event.key === 'ArrowRight'
      ? (currentIndex + 1) % ROLE_ORDER.length
      : event.key === 'ArrowLeft'
        ? (currentIndex - 1 + ROLE_ORDER.length) % ROLE_ORDER.length
        : -1;

    if (nextIndex >= 0) {
      event.preventDefault();
      const nextRole = ROLE_ORDER[nextIndex];
      setActiveRole(nextRole);
      requestAnimationFrame(() => roleTabRefs.current[nextRole]?.focus());
    }
  };

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const savedEmail = localStorage.getItem(`savedEmail_${activeRole}`);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    } else {
      setEmail('');
      setRememberMe(false);
    }
    setPassword('');
  }, [activeRole]);

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

      if (response.role !== activeRole) {
        addToast(`Invalid credentials for role ${activeRole}`, 'error');
        logout();
        setLoadingLocal(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem(`savedEmail_${activeRole}`, email);
      } else {
        localStorage.removeItem(`savedEmail_${activeRole}`);
      }

      navigate('/dashboard');
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
        if (loggedUser.role !== activeRole) {
          addToast(`Invalid credentials for role ${activeRole}`, 'error');
          logout();
          setShow2FAModal(false);
          return;
        }

        if (rememberMe) {
          localStorage.setItem(`savedEmail_${activeRole}`, email);
        }
        setShow2FAModal(false);
        navigate('/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 sm:px-6 py-12 relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs with dynamic colors */}
      <div className={`absolute top-[-10%] left-[-10%] w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-30 transition-all duration-700 ${theme.glow}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20 transition-all duration-700 ${theme.glow}`} aria-hidden="true" />

      <motion.main
        layout
        aria-labelledby="login-title"
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative z-10 w-full max-w-xl rounded-3xl border border-white/50 bg-white/75 p-5 shadow-xl shadow-slate-300/20 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/75 dark:shadow-none sm:p-8"
      >
        <div className="mb-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-500/20">H</div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">HAS<span className="text-brand-500">.</span></p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Care, connected</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-500 sm:inline-flex dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">Secure access</span>
        </div>
        {/* Animated Card Header */}
        <div className="text-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg ${theme.primaryBg} ${theme.shadow}`}
            >
              <ActiveIcon className="w-7 h-7" />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeRole}-title`}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 id="login-title" className="text-2xl font-bold text-slate-900 dark:text-white">
                {theme.title}
              </h1>
              <p className="mt-2 px-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:px-4">
                {theme.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Role Tabs */}
        <div role="tablist" aria-label="Choose your portal" onKeyDown={handleRoleKeyDown} className="mb-7 grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5 dark:border-slate-700/70 dark:bg-slate-800/60">
          {ROLE_ORDER.map((role) => {
            const roleConf = ROLE_THEMES[role];
            const RoleIcon = roleConf.icon;
            const isSelected = activeRole === role;
            return (
              <button
                key={role}
                id={`login-tab-${role.toLowerCase()}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls="login-panel"
                tabIndex={isSelected ? 0 : -1}
                ref={(element) => {
                  roleTabRefs.current[role] = element;
                }}
                onClick={() => setActiveRole(role)}
                className={`relative flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-bold transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:gap-2 sm:text-sm ${isSelected ? roleConf.primaryText : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'}`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="activeTabGlow"
                    className="absolute inset-0 rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    aria-hidden="true"
                  />
                )}
                <RoleIcon className="relative z-10 h-4 w-4" aria-hidden="true" />
                <span className="relative z-10">{role}</span>
              </button>
            );
          })}
        </div>

        <div id="login-panel" role="tabpanel" aria-labelledby={`login-tab-${activeRole.toLowerCase()}`}>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="pl-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                <Mail className="w-5 h-5" />
              </span>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all duration-300 ${theme.focusRing}`}
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between pl-1">
              <label htmlFor="login-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className={`min-h-11 px-1 text-xs font-bold transition-colors ${theme.primaryText}`}
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-11 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all duration-300 ${theme.focusRing}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex min-h-11 min-w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between pl-1">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`rounded border-slate-300 dark:border-slate-700 accent-brand-500`}
              />
              <span>Remember Me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loadingLocal}
            className={`mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${theme.primaryBg} ${theme.shadow}`}
          >
            {loadingLocal ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              theme.buttonText
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 border-t border-slate-200/80 pt-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {activeRole === 'Patient' && (
            <div>
              New patient?{' '}
              <Link
                to="/register"
                className={`font-semibold transition-colors ${theme.primaryText}`}
              >
                Create an Account
              </Link>
            </div>
          )}
          {activeRole === 'Doctor' && (
            <div>
              Doctor?{' '}
              <Link
                to="/register-doctor"
                className={`font-semibold transition-colors ${theme.primaryText}`}
              >
                Apply to Join Staff
              </Link>
            </div>
          )}
        </div>
        </div>
      </motion.main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation">
          <GlassCard className="flex w-full max-w-md flex-col gap-5 border border-white/20 p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="reset-password-title">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h2 id="reset-password-title" className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <KeyRound className="h-5 w-5 text-indigo-500" aria-hidden="true" /> Reset Password
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetToken('');
                }}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close reset password dialog"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            {!resetToken ? (
              <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <p className="text-sm font-normal leading-relaxed text-slate-500 dark:text-slate-400">
                  Enter your email address below, and we will generate a secure reset link token.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="forgot-email">Email Address</label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@hospital.com"
                  className="glass-input w-full text-slate-800 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="mt-2 flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-500 py-3 font-bold text-white shadow-md transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {forgotLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    'Generate Reset Token'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <p className="text-sm font-bold leading-relaxed text-emerald-600 dark:text-emerald-400">
                  Reset code generated successfully! Enter the new password below.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reset-token">Reset Token</label>
                  <input
                    id="reset-token"
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reset-new-password">New Password</label>
                  <input
                    id="reset-new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
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

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation">
          <GlassCard className="flex w-full max-w-md flex-col gap-5 border border-white/20 p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="two-factor-title">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h2 id="two-factor-title" className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <KeyRound className="h-5 w-5 text-indigo-500" aria-hidden="true" /> Two-Factor Verification
              </h2>
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close two-factor verification dialog"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <form onSubmit={handle2FAVerify} className="flex flex-col gap-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <p className="text-sm font-normal leading-relaxed text-slate-500 dark:text-slate-400">
                Please enter the 6-digit verification code from your authenticator app.
              </p>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="two-factor-code">Verification Code</label>
                <input
                  id="two-factor-code"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                  placeholder="000 000"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white text-center font-mono text-lg tracking-widest"
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
