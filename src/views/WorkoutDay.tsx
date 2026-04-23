import { Link, useParams } from 'react-router-dom';
import { getDay } from '../lib/seed';
import { Card } from '../components/Card';
import type { DayId, Exercise } from '../lib/types';

const SECTION_TITLES: Record<string, string> = {
  warmup: 'Warmup',
  working: 'Working Sets',
  core: 'Core Finisher',
  cardio: 'Cardio',
};

export default function WorkoutDay() {
  const { dayId } = useParams<{ dayId: string }>();
  const day = dayId ? getDay(dayId as DayId) : undefined;

  if (!day) {
    return (
      <div className="mt-10 text-center text-muted">
        Unknown day.{' '}
        <Link className="underline" to="/workout">
          Back
        </Link>
      </div>
    );
  }

  const sections = groupBySection(day.exercises);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mono-eyebrow">{day.abbr}</div>
          <h1 className="display-serif mt-2 text-4xl">
            <em>{day.display}</em>
          </h1>
        </div>
        <div className="flex gap-2">
          <Link to="/workout" className="btn-ghost">
            Back
          </Link>
          <Link to={`/workout/${day.id}/log`} className="btn-primary">
            Start session
          </Link>
        </div>
      </header>

      {(['warmup', 'working', 'core', 'cardio'] as const).map((sec) => {
        const list = sections[sec];
        if (!list || list.length === 0) return null;
        return (
          <section key={sec}>
            <h2 className="mono-eyebrow mb-3">{SECTION_TITLES[sec]}</h2>
            <Card crosshair className="!p-0">
              <ul className="divide-y divide-white/5">
                {list.map((ex) => (
                  <li key={ex.id} className="flex flex-col gap-1 p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">{ex.name}</span>
                      <span className="font-mono text-xs text-muted">
                        {ex.setsReps ?? ex.prescription}
                        {ex.rest ? ` · rest ${ex.rest}` : ''}
                      </span>
                    </div>
                    {ex.notes && <p className="text-xs text-muted-light">{ex.notes}</p>}
                    {ex.startingWeight != null && (
                      <p className="mt-0.5 font-mono text-[11px] text-coral">
                        Starting weight · {ex.startingWeight} lb
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        );
      })}
    </div>
  );
}

function groupBySection(exs: Exercise[]) {
  const out: Record<string, Exercise[]> = {};
  for (const e of exs) {
    (out[e.section] ||= []).push(e);
  }
  return out;
}
