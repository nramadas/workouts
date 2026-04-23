import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { db } from '../db/dexie';
import { Card } from '../components/Card';
import { allExercises, workouts } from '../lib/seed';
import type { WorkoutLog } from '../lib/types';

export default function Progress() {
  const logs = useLiveQuery(
    () => db.logs.orderBy('timestamp').toArray(),
    [],
    [] as WorkoutLog[],
  );

  const exercises = useMemo(
    () =>
      allExercises().filter(
        (e) => e.section === 'working' || e.section === 'core',
      ),
    [],
  );

  const exerciseWithData = useMemo(() => {
    const ids = new Set<string>();
    for (const l of logs) {
      if (l.status !== 'completed') continue;
      for (const e of l.exerciseLogs) if (!e.skipped && e.sets.some((s) => s.weight != null)) ids.add(e.exerciseId);
    }
    return new Set(ids);
  }, [logs]);

  const defaultEx = exercises.find((e) => exerciseWithData.has(e.id)) ?? exercises[0];
  const [selected, setSelected] = useState<string>(defaultEx.id);
  const ex = exercises.find((e) => e.id === selected) ?? defaultEx;

  const series = useMemo(() => {
    const points: Array<{ session: number; weight: number; reps: number }> = [];
    let sessionIdx = 0;
    for (const l of logs) {
      if (l.status !== 'completed' || l.dayId !== ex.dayId) continue;
      sessionIdx += 1;
      const entry = l.exerciseLogs.find((e) => e.exerciseId === ex.id && !e.skipped);
      if (!entry || entry.sets.length === 0) continue;
      const top = entry.sets.reduce<{ weight: number; reps: number } | null>((best, s) => {
        if (s.weight === undefined) return best;
        if (!best || s.weight > best.weight) return { weight: s.weight, reps: s.reps };
        return best;
      }, null);
      if (top) points.push({ session: sessionIdx, weight: top.weight, reps: top.reps });
    }
    return points;
  }, [logs, ex.id, ex.dayId]);

  const prs = useMemo(() => computePRs(logs), [logs]);

  const [windowN, setWindowN] = useState(4);
  const volume = useMemo(() => computeVolumeByMuscle(logs, windowN), [logs, windowN]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="mono-eyebrow">Trends</div>
        <h1 className="display-serif mt-2 text-4xl">
          Your <em>progress</em>
        </h1>
      </header>

      <Card ambient crosshair>
        <label className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="mono-eyebrow">Exercise</span>
            <span className="font-mono text-[11px] text-muted-light">
              {series.length} session{series.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-full border border-white/10 bg-ink-900 py-2 pl-3 pr-9 text-sm focus:outline-none"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {workouts.days.map((d) => (
                <optgroup key={d.id} label={d.display}>
                  {d.exercises
                    .filter((x) => x.section === 'working' || x.section === 'core')
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                        {exerciseWithData.has(x.id) ? ' ·' : ''}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            <svg
              aria-hidden
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </label>

        <div className="mt-5 h-56">
          {series.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No data yet. Log a session to start the line.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="coralFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff0a" vertical={false} />
                <XAxis
                  dataKey="session"
                  tickLine={false}
                  axisLine={false}
                  stroke="#8a8a8a"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#8a8a8a"
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: '#171717',
                    border: '1px solid #ffffff1a',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(v) => `Session #${v}`}
                  formatter={(v: number, _k, p) => [
                    `${v} lb × ${p.payload.reps}`,
                    'Top set',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#ff6b6b"
                  strokeWidth={2}
                  fill="url(#coralFill)"
                  dot={{ r: 3, fill: '#ff6b6b', stroke: '#0a0a0a', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <section>
        <h2 className="mono-eyebrow mb-3">Personal records</h2>
        {prs.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-light">No PRs yet.</p>
          </Card>
        ) : (
          <Card className="!p-0">
            <ul className="divide-y divide-white/5">
              {prs.map((pr) => (
                <li key={pr.exerciseId} className="flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm font-medium">{pr.name}</div>
                    <div className="font-mono text-[11px] text-muted">
                      session #{pr.sessionIndex ?? '—'}
                    </div>
                  </div>
                  <div className="stat-num text-xl">
                    {pr.weight}
                    <span className="ml-1 text-xs text-muted-light">lb × {pr.reps}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="mono-eyebrow">Volume · by muscle</h2>
          <label className="inline-flex items-center gap-2 text-xs text-muted">
            window
            <input
              type="number"
              min={1}
              max={20}
              value={windowN}
              onChange={(e) => setWindowN(Math.max(1, Number(e.target.value) || 1))}
              className="w-14 rounded-md border border-white/10 bg-ink-900 px-2 py-1 text-right font-mono text-xs focus:outline-none"
            />
            sessions
          </label>
        </div>
        <Card className="!p-0">
          <ul className="divide-y divide-white/5">
            {volume.map((row) => (
              <li key={row.group} className="flex items-center gap-3 p-3">
                <span className="flex-1 text-sm">{row.group}</span>
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full bg-coral"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="stat-num w-20 text-right text-sm">
                  {row.volume.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

function computePRs(logs: WorkoutLog[]) {
  const byEx: Record<
    string,
    { exerciseId: string; name: string; weight: number; reps: number; sessionIndex: number | null }
  > = {};
  const nameIndex = Object.fromEntries(allExercises().map((e) => [e.id, e.name]));
  for (const l of [...logs].sort((a, b) => a.timestamp - b.timestamp)) {
    if (l.status !== 'completed') continue;
    for (const entry of l.exerciseLogs) {
      if (entry.skipped) continue;
      for (const s of entry.sets) {
        if (s.weight === undefined) continue;
        const prev = byEx[entry.exerciseId];
        if (!prev || s.weight > prev.weight) {
          byEx[entry.exerciseId] = {
            exerciseId: entry.exerciseId,
            name: nameIndex[entry.exerciseId] ?? entry.exerciseId,
            weight: s.weight,
            reps: s.reps,
            sessionIndex: l.sessionIndex,
          };
        }
      }
    }
  }
  return Object.values(byEx).sort((a, b) => b.weight - a.weight);
}

function computeVolumeByMuscle(logs: WorkoutLog[], windowN: number) {
  const groups: Record<string, number> = {};
  const exIndex = Object.fromEntries(allExercises().map((e) => [e.id, e]));
  // Group by dayId, then take last windowN completed sessions per day type
  const byDay: Record<string, WorkoutLog[]> = {};
  for (const l of logs) {
    if (l.status !== 'completed') continue;
    (byDay[l.dayId] ||= []).push(l);
  }
  for (const [, list] of Object.entries(byDay)) {
    const recent = list.slice(-windowN);
    for (const l of recent) {
      for (const entry of l.exerciseLogs) {
        if (entry.skipped) continue;
        const ex = exIndex[entry.exerciseId];
        if (!ex) continue;
        const volume = entry.sets.reduce((sum, s) => sum + (s.weight ?? 0) * s.reps, 0);
        for (const g of ex.muscleGroups ?? []) {
          groups[g] = (groups[g] ?? 0) + volume;
        }
      }
    }
  }
  const rows = Object.entries(groups)
    .map(([group, volume]) => ({ group, volume }))
    .sort((a, b) => b.volume - a.volume);
  const max = rows[0]?.volume ?? 1;
  return rows.map((r) => ({ ...r, pct: (r.volume / max) * 100 }));
}
