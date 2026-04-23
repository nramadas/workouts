import { useState } from 'react';
import { Card } from '../components/Card';
import { mobility } from '../lib/seed';
import { currentDayOfWeek, weekdayName } from '../lib/day';

const INTENSITY_STYLE: Record<string, string> = {
  gentle: 'bg-emerald-400',
  moderate: 'bg-amber-400',
  hard: 'bg-coral',
};

export default function Mobility() {
  const weekday = currentDayOfWeek();
  const todayName = weekdayName(weekday);
  const todaySession = mobility.sessions.find((s) => s.day === todayName);
  const libIndex = Object.fromEntries(mobility.library.map((i) => [i.id, i]));

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header>
        <div className="mono-eyebrow">Evening protocol</div>
        <h1 className="display-serif mt-2 text-4xl">
          Evening <em>Mobility</em>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-light">
          A seven-day stretching plan sequenced around morning lifts. Harder work on days away from
          squats and deadlifts; gentle recovery the evening before.
        </p>
      </header>

      {todaySession && (
        <Card ambient crosshair className="border-coral/30">
          <div className="mono-eyebrow text-coral">Tonight · {todayName}</div>
          <div className="display-serif mt-2 text-2xl">{todaySession.title}</div>
          <div className="mt-1 text-sm text-muted-light">{todaySession.meta}</div>
        </Card>
      )}

      <section>
        <h2 className="display-serif mb-3 text-2xl">
          The <em>weekly</em> rhythm
        </h2>
        <div className="grid grid-cols-7 gap-1 text-center sm:gap-1.5">
          {mobility.weeklyGrid.map((cell) => (
            <div
              key={cell.abbr}
              className={`min-w-0 overflow-hidden rounded-lg border px-1 py-1.5 sm:p-2 ${
                cell.day === todayName
                  ? 'border-coral bg-coral/5'
                  : 'border-white/5 bg-ink-800'
              }`}
            >
              <div className="font-mono text-[9px] uppercase tracking-[0.05em] text-muted sm:text-[10px] sm:tracking-[0.1em]">
                {cell.abbr}
              </div>
              <div
                className={`mx-auto my-1.5 h-1 w-3/5 rounded sm:my-2 ${INTENSITY_STYLE[cell.intensity]}`}
              />
              <div className="break-words text-[9px] leading-tight text-muted-light sm:text-[11px]">
                {cell.focus}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-4 font-mono text-[11px] text-muted">
          <span>
            <i className="mr-1.5 inline-block h-[3px] w-2.5 rounded bg-emerald-400 align-middle" />
            Gentle · ~10 min
          </span>
          <span>
            <i className="mr-1.5 inline-block h-[3px] w-2.5 rounded bg-amber-400 align-middle" />
            Moderate · ~15 min
          </span>
          <span>
            <i className="mr-1.5 inline-block h-[3px] w-2.5 rounded bg-coral align-middle" />
            Full · 20–30 min
          </span>
        </div>
      </section>

      <section>
        <h2 className="display-serif mb-3 text-2xl">
          The <em>schedule</em>
        </h2>
        <div className="flex flex-col gap-2">
          {mobility.sessions.map((s) => (
            <SessionItem key={s.day} session={s} today={s.day === todayName} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="display-serif mb-3 text-2xl">
          Exercise <em>library</em>
        </h2>
        <div className="flex flex-col gap-2">
          {mobility.library
            .slice()
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((item) => (
              <LibraryItem key={item.id} item={item} />
            ))}
        </div>
      </section>

      <section>
        <h2 className="display-serif mb-3 text-2xl">
          Progression <em>rules</em>
        </h2>
        <div className="flex flex-col gap-2">
          {mobility.progressionRules.map((r) => (
            <Card key={r.num} className="!p-4">
              <div className="flex items-baseline gap-3">
                <span className="stat-num text-2xl text-coral">{r.num}</span>
                <span className="font-medium">{r.title}</span>
              </div>
              <p
                className="mt-2 text-sm text-muted-light"
                dangerouslySetInnerHTML={{ __html: inlineTags(r.text) }}
              />
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="display-serif mb-3 text-2xl">
          Monthly <em>benchmarks</em>
        </h2>
        <p className="mb-4 text-sm text-muted-light">
          Reference only — the mobility plan does not log or track these here.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {mobility.benchmarks.map((b) => (
            <Card key={b.metric} className="!p-4">
              <div className="font-medium">{b.metric}</div>
              <p className="mt-1 text-xs text-muted-light">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card crosshair className="border-emerald-400/20">
        <div className="mono-eyebrow text-emerald-300">Ankle protocol note</div>
        <h3 className="display-serif mt-2 text-xl">{mobility.ankleNote.title}</h3>
        {mobility.ankleNote.paragraphs.map((p, i) => (
          <p key={i} className="mt-2 text-sm text-muted-light">
            {p}
          </p>
        ))}
        <ul className="mt-3 space-y-2">
          {mobility.ankleNote.items.map((it, i) => (
            <li
              key={i}
              className="border-l-2 border-emerald-400/60 pl-3 text-sm text-muted-light"
              dangerouslySetInnerHTML={{ __html: inlineTags(it) }}
            />
          ))}
        </ul>
      </Card>

      <footer className="mt-6 text-center font-mono text-[11px] text-muted">
        v1 · built for evenings · adjust as your body feeds back
      </footer>

      {/* used by dangerouslySetInnerHTML for library cross-links */}
      <span hidden data-lib-index={Object.keys(libIndex).length} />
    </div>
  );
}

function SessionItem({
  session,
  today,
}: {
  session: (typeof mobility)['sessions'][number];
  today: boolean;
}) {
  const [open, setOpen] = useState(today);
  return (
    <Card className={`!p-0 ${today ? 'border-coral/40' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-1 p-4 text-left"
        aria-expanded={open}
      >
        <span className="mt-[3px] font-mono text-xs uppercase tracking-[0.15em] text-muted">
          {session.day.slice(0, 3)}
        </span>
        <span className="min-w-0 break-words font-medium">{session.title}</span>
        <span className="mt-[3px] text-muted">{open ? '▾' : '▸'}</span>
        <span className="col-start-2 font-mono text-[11px] uppercase tracking-wider text-muted">
          {session.meta}
        </span>
      </button>
      {open && (
        <div className="border-t border-white/5 p-4">
          <p className="italic text-sm text-muted-light">{session.note}</p>
          <ul className="mt-3 divide-y divide-white/5">
            {session.exercises.map((ex, i) => (
              <li
                key={i}
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2 text-sm"
              >
                <span className="min-w-0 break-words">
                  {ex.ref ? (
                    <a
                      href={`#${ex.ref}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(ex.ref!);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        // open the library item if it's a <details> or our own state
                        const libBtn = document.querySelector<HTMLButtonElement>(
                          `[data-lib="${ex.ref}"]`,
                        );
                        if (libBtn && libBtn.getAttribute('aria-expanded') !== 'true') {
                          libBtn.click();
                        }
                      }}
                      className="hover:text-coral"
                    >
                      {ex.name}
                    </a>
                  ) : (
                    ex.name
                  )}
                </span>
                <span className="font-mono text-[11px] text-muted">{ex.dose}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function LibraryItem({ item }: { item: (typeof mobility)['library'][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <Card id={item.id} className="!p-0">
      <button
        type="button"
        data-lib={item.id}
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1 p-4 text-left"
        aria-expanded={open}
      >
        <span className="min-w-0 break-words font-medium">{item.title}</span>
        <span className="mt-[3px] text-muted">{open ? '▾' : '▸'}</span>
        {item.dose && (
          <span className="col-start-1 font-mono text-[11px] text-muted">{item.dose}</span>
        )}
      </button>
      {open && (
        <div className="border-t border-white/5 p-4 text-sm text-muted-light">
          <div className="mb-3 flex flex-wrap gap-4 font-mono text-[11px]">
            {item.target && (
              <span>
                <strong className="mr-2 text-white/90">Target</strong>
                {item.target}
              </span>
            )}
            {item.dose && (
              <span>
                <strong className="mr-2 text-white/90">Dose</strong>
                {item.dose}
              </span>
            )}
          </div>
          {item.sections.map((sec, i) => (
            <div key={i} className="mb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                {sec.label}
              </div>
              <p
                className="mt-1 text-sm text-white/80"
                dangerouslySetInnerHTML={{ __html: inlineTags(sec.content) }}
              />
            </div>
          ))}
          {item.youtube && (
            <a
              href={item.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-coral hover:underline"
            >
              Watch on YouTube ↗
            </a>
          )}
        </div>
      )}
    </Card>
  );
}

// Only allow <em> and <strong>, strip everything else.
function inlineTags(s: string): string {
  return s
    .replace(/<(?!\/?(em|strong)\b)[^>]+>/gi, '')
    .replace(/&amp;/g, '&');
}
