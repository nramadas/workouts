import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, wipeAll } from '../db/dexie';
import { exportAll, importAll } from '../db/exportImport';
import { Card } from '../components/Card';

export default function Settings() {
  const logs = useLiveQuery(() => db.logs.toArray(), [], []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workouts-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!confirm('Importing will replace all local data. Continue?')) return;
      const res = await importAll(payload);
      setMessage(`Imported ${res.imported} logs.`);
    } catch (err) {
      setMessage(`Import failed: ${(err as Error).message}`);
    }
  }

  async function handleReset() {
    if (!confirm('Delete all workout data? This cannot be undone.')) return;
    if (!confirm('Really? Absolutely everything.')) return;
    await wipeAll();
    setMessage('All data wiped.');
  }

  const completed = logs.filter((l) => l.status === 'completed').length;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="mono-eyebrow">Settings</div>
        <h1 className="display-serif mt-2 text-4xl">
          <em>Settings</em>
        </h1>
      </header>

      {message && (
        <Card className="!p-3 !border-coral/30 !bg-coral/5 text-sm text-white/90">
          {message}
        </Card>
      )}

      <Card crosshair>
        <h2 className="font-medium">About</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted-light">
          <li>
            Workouts logged: <span className="text-white">{completed}</span>
          </li>
          <li>
            Schema version: <span className="text-white">1</span>
          </li>
          <li>
            Units: <span className="text-white">lbs</span>
          </li>
          <li>
            Source:{' '}
            <a
              href="https://github.com/nramadas/workouts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral hover:underline"
            >
              github.com/nramadas/workouts
            </a>
          </li>
        </ul>
      </Card>

      <Card crosshair>
        <h2 className="font-medium">Data</h2>
        <p className="mt-1 text-sm text-muted-light">
          Local only. IndexedDB. Export before uninstalling the app or clearing storage.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={handleExport}>
            Export JSON
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => inputRef.current?.click()}
          >
            Import JSON
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = '';
            }}
          />
        </div>
      </Card>

      <Card className="border-red-500/30">
        <h2 className="font-medium text-red-300">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-light">
          Reset all workout logs. Seed data is safe — only your history is deleted.
        </p>
        <button
          type="button"
          className="mt-3 inline-flex items-center rounded-full border border-red-400/40 bg-red-400/10 px-4 py-2 text-sm text-red-300 hover:bg-red-400/20"
          onClick={handleReset}
        >
          Reset all data
        </button>
      </Card>
    </div>
  );
}
