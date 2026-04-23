import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Nav, TAB_BAR_HEIGHT_PX } from './Nav';

export function Layout() {
  const [updateReady, setUpdateReady] = useState(false);
  useEffect(() => {
    const handler = () => setUpdateReady(true);
    window.addEventListener('pwa:update-ready', handler);
    return () => window.removeEventListener('pwa:update-ready', handler);
  }, []);

  return (
    <div className="min-h-screen">
      <div
        className="mx-auto max-w-3xl pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          paddingBottom: `calc(${TAB_BAR_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px) + 1rem)`,
        }}
      >
        {updateReady && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-card border border-coral/30 bg-coral/10 px-4 py-3 text-sm">
            <span className="text-white/90">A new version is available.</span>
            <button
              type="button"
              className="btn-primary !py-1.5 !text-xs"
              onClick={() => location.reload()}
            >
              Refresh
            </button>
          </div>
        )}
        <main>
          <Outlet />
        </main>
      </div>
      <Nav />
    </div>
  );
}
