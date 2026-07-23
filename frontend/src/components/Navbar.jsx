import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { Bell, Sun, Moon, LogOut, User as UserIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      const res = await API.put('/notifications/read-all');
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        addToast('All notifications marked as read', 'info');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markSingleRead = async (id) => {
    try {
      const res = await API.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="glass-panel sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between border-b">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
          H
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">H</span>
          <span className="text-xl font-bold text-brand-500">AS</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {}
        <button
          onClick={toggleTheme}
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-all"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 glass-panel border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-4 overflow-hidden pointer-events-auto"
                >
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="font-semibold text-slate-800 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-6">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => !notif.isRead && markSingleRead(notif._id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            notif.isRead
                              ? 'bg-transparent border-slate-50 dark:border-slate-900 text-slate-500'
                              : 'bg-brand-50/50 dark:bg-brand-950/20 border-brand-100 dark:border-brand-900 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold mb-0.5">
                            <span>{notif.title}</span>
                            {!notif.isRead && <span className="w-2 h-2 bg-brand-500 rounded-full"></span>}
                          </div>
                          <p>{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {}
        {user && (
          <div className="flex items-center gap-3 border-l pl-4 dark:border-slate-800">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-slate-800 dark:text-white">{user.name}</span>
              <span className="text-xs text-brand-500 font-medium">{user.role}</span>
            </div>
            {user.avatar ? (
              <img
                src={`http://localhost:5000${user.avatar}`}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-brand-500/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
            )}
            <button
              onClick={logout}
              className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
