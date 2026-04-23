import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Home', end: true },
  { to: '/workout', label: 'Workout' },
  { to: '/progress', label: 'Progress' },
  { to: '/mobility', label: 'Mobility' },
  { to: '/settings', label: 'Settings' },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-20 -mx-4 border-b border-white/5 bg-ink-950/80 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full bg-coral shadow-[0_0_12px_rgba(255,107,107,0.7)]"
          />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/70">
            Workouts
          </span>
        </div>
        <ul className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-coral text-ink-950'
                      : 'text-muted hover:text-white'
                  }`
                }
              >
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
