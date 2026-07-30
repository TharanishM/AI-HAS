import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';
import { BACKEND_URL } from '../services/api';
import { getRoleTheme } from '../config/roles';
import { getRoleNavigation } from '../config/navigation';

const MobileDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!user) return null;

  const roleTheme = getRoleTheme(user.role);
  const currentLinks = getRoleNavigation(user.role);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 cursor-default bg-slate-950/80 backdrop-blur-sm md:hidden"
            aria-label="Close navigation menu"
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${user.role} navigation menu`}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col gap-6 overflow-hidden border-r border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950 md:hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white shadow-md shadow-brand-500/20">
                  H
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  HAS<span className="text-brand-500">.</span>
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70">
              {user.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}${user.avatar}`}
                  alt=""
                  className="h-10 w-10 rounded-full border-2 border-brand-500/20 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {user.name?.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</span>
                <span className={`text-xs font-semibold ${roleTheme.navAccent}`}>{user.role}</span>
              </div>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1" aria-label="Primary">
              {currentLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                        isActive
                          ? roleTheme.navActive
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Logout
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
