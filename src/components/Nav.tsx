import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

interface Tab {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const tabs: Tab[] = [
  {
    to: '/',
    end: true,
    label: 'Home',
    icon: (
      <svg {...iconProps} aria-hidden>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10.5V20h4.5v-5.5h5V20H19v-9.5" />
      </svg>
    ),
  },
  {
    to: '/workout',
    label: 'Workout',
    icon: (
      <svg {...iconProps} aria-hidden>
        <path d="M6.5 6.5v11" />
        <path d="M17.5 6.5v11" />
        <path d="M3.5 9.5v5" />
        <path d="M20.5 9.5v5" />
        <path d="M7 12h10" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg {...iconProps} aria-hidden>
        <path d="M3 17.5 9 11l4 4 7.5-8.5" />
        <path d="M15 6.5h5.5V12" />
      </svg>
    ),
  },
  {
    to: '/mobility',
    label: 'Mobility',
    icon: (
      <svg {...iconProps} aria-hidden>
        <circle cx="12" cy="4.5" r="1.6" />
        <path d="M6 10c1.8-1.2 4-1.8 6-1.8s4.2.6 6 1.8" />
        <path d="M12 8.2V14" />
        <path d="M12 14l-3 6" />
        <path d="M12 14l3 6" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg {...iconProps} aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 14.4a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
      </svg>
    ),
  },
];

export const TAB_BAR_HEIGHT_PX = 56;

export function Nav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/90 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Primary"
    >
      <ul
        className="mx-auto flex max-w-3xl items-stretch"
        style={{
          paddingLeft: 'max(0.25rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.25rem, env(safe-area-inset-right))',
        }}
      >
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-wide transition ${
                  isActive ? 'text-coral' : 'text-muted hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 items-center justify-center ${
                      isActive ? 'opacity-100' : 'opacity-90'
                    }`}
                  >
                    {t.icon}
                  </span>
                  <span>{t.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
