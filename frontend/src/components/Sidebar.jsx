import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleTheme } from '../config/roles';
import { getRoleNavigation } from '../config/navigation';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const roleTheme = getRoleTheme(user.role);
  const currentLinks = getRoleNavigation(user.role);

  return (
    <aside
      aria-label={`${user.role} navigation`}
      className="hidden min-h-[calc(100vh-73px)] w-64 shrink-0 flex-col gap-8 border-r border-slate-200/70 bg-white/60 p-5 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/40 md:flex lg:w-72"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Medical Portal
          </span>
          <span className={`h-2 w-2 rounded-full ${roleTheme.navActive.split(' ')[0]}`} aria-hidden="true" />
        </div>
        <nav className="flex flex-col gap-1" aria-label="Primary">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
                    isActive
                      ? roleTheme.navActive
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto rounded-2xl border border-brand-100/70 bg-brand-50/60 p-4 text-center dark:border-brand-900/30 dark:bg-brand-950/20">
        <span className="mb-1 block text-xs font-semibold text-brand-700 dark:text-brand-300">
          Need support?
        </span>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Contact the administrative helpdesk for clinic queries.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
