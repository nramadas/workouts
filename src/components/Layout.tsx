import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Nav } from './Nav';

export function Layout() {
  const [updateReady, setUpdateReady] = useState(false);
  useEffect(() => {
    const handler = () => setUpdateReady(true);
    window.addEventListener('pwa:update-ready', handler);
    return () => window.removeEventListener('pwa:update-ready', handler);
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <div className="mx-auto max-w-3xl px-4">
        <Nav />
        {updateReady && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-card border border-coral/30 bg-coral/10 px-4 py-3 text-sm">
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
        <main className="mt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
