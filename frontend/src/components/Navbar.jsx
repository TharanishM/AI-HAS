import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API, { BACKEND_URL } from '../services/api';
import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getRoleTheme } from '../config/roles';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const roleTheme = getRoleTheme(user?.role);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) setNotifications(res.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications, user]);

  useEffect(() => {
    if (!showNotifications) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowNotifications(false);
    };
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const markAllRead = async () => {
    try {
      const res = await API.put('/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
        addToast('All notifications marked as read', 'info');
      }
    } catch (error) {
      console.error('Unable to mark notifications as read:', error);
    }
  };

  const markSingleRead = async (id) => {
    try {
      const res = await API.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) => prev.map((notification) => (
          notification._id === id ? { ...notification, isRead: true } : notification
        )));
      }
    } catch (error) {
      console.error('Unable to mark notification as read:', error);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <nav className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        {user && (
          <button
            type="button"
            onClick={onMenuClick}
            className="-ml-2 flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-500/20">
          H
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hospital Appointment <span className="text-brand-500">System</span>
          </p>
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 sm:block">
            Connected care operations
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" aria-hidden="true" /> : <Sun className="h-5 w-5" aria-hidden="true" />}
        </button>

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowNotifications((current) => !current)}
              className="relative flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              aria-haspopup="true"
              aria-expanded={showNotifications}
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-0.5 text-[9px] font-bold text-white dark:border-slate-950" aria-hidden="true">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30"
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
                    <span className="font-semibold text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="min-h-11 px-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          type="button"
                          key={notification._id}
                          onClick={() => !notification.isRead && markSingleRead(notification._id)}
                          className={`rounded-xl border p-3 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                            notification.isRead
                              ? 'border-slate-100 bg-transparent text-slate-500 dark:border-slate-800 dark:text-slate-400'
                              : 'border-brand-100 bg-brand-50/60 text-slate-800 dark:border-brand-900 dark:bg-brand-950/30 dark:text-slate-200'
                          }`}
                          aria-label={`${notification.title}: ${notification.message}`}
                        >
                          <div className="mb-1 flex items-center justify-between gap-2 font-semibold">
                            <span>{notification.title}</span>
                            {!notification.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />}
                          </div>
                          <p className="leading-relaxed">{notification.message}</p>
                          <span className="mt-1 block text-xs text-slate-400 dark:text-slate-500">
                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {user && (
          <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-2 dark:border-slate-800 sm:ml-2 sm:gap-3 sm:pl-3">
            <div className="hidden flex-col items-end sm:flex">
              <span className="max-w-40 truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</span>
              <span className={`text-xs font-semibold ${roleTheme.navAccent}`}>{user.role}</span>
            </div>
            {user.avatar ? (
              <img
                src={user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}${user.avatar}`}
                alt=""
                className="h-9 w-9 rounded-full border-2 border-brand-500/20 object-cover sm:h-10 sm:w-10"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300 sm:h-10 sm:w-10">
                {user.name?.charAt(0)}
              </div>
            )}
            <button
              type="button"
              onClick={logout}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-rose-500 transition-colors hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500/40 dark:hover:bg-rose-950/30"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
