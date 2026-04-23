import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db } from '../db/dexie';
import { workouts } from '../lib/seed';
import { Card } from '../components/Card';
import type { WorkoutLog } from '../lib/types';
import { dayIdForToday } from '../lib/day';

export default function Workout() {
  const logs = useLiveQuery(
    () => db.logs.orderBy('timestamp').toArray(),
    [],
    [] as WorkoutLog[],
  );
  const todayId = dayIdForToday();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="mono-eyebrow">Program</div>
        <h1 className="display-serif mt-2 text-4xl">
          Your <em>workout</em>
        </h1>
        <p className="mt-2 text-sm text-muted-light">
          Six day-types. Sessions are numbered as you complete them — the book keeps writing.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {workouts.days.map((day) => {
          const dayLogs = logs
            .filter((l) => l.dayId === day.id)
            .sort((a, b) => b.timestamp - a.timestamp);
          const completedCount = dayLogs.filter((l) => l.status === 'completed').length;
          const isToday = todayId === day.id;

          return (
            <Card key={day.id} crosshair className={isToday ? 'border-coral/40' : ''}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mono-eyebrow">
                    {day.abbr} · {completedCount} session{completedCount === 1 ? '' : 's'}
                  </div>
                  <h2 className="display-serif mt-1 text-2xl">{day.display}</h2>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Link to={`/workout/${day.id}`} className="btn-ghost">
                    Plan
                  </Link>
                  <Link to={`/workout/${day.id}/log`} className="btn-primary">
                    {isToday ? 'Start' : 'Log'}
                  </Link>
                </div>
              </div>

              {dayLogs.length > 0 && (
                <ul className="mt-4 divide-y divide-white/5 border-t border-white/5">
                  {dayLogs.slice(0, 6).map((log) => (
                    <li key={log.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      {log.status === 'skipped' ? (
                        <span className="text-muted">↷ skipped</span>
                      ) : (
                        <>
                          <span>
                            <span className="stat-num text-base">#{log.sessionIndex}</span>
                            <span className="ml-2 text-muted-light">
                              {summarise(log)}
                            </span>
                          </span>
                          <Link
                            to={`/workout/${day.id}/session/${log.id}`}
                            className="text-xs text-coral hover:underline"
                          >
                            Detail
                          </Link>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function summarise(log: WorkoutLog) {
  let heaviest = 0;
  let sets = 0;
  for (const e of log.exerciseLogs) {
    if (e.skipped) continue;
    sets += e.sets.length;
    for (const s of e.sets) if ((s.weight ?? 0) > heaviest) heaviest = s.weight!;
  }
  if (heaviest > 0) return `${sets} sets · top ${heaviest} lb`;
  if (sets > 0) return `${sets} sets`;
  return 'logged';
}
