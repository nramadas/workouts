import { useEffect, useRef, useState } from 'react';

interface Props {
  seconds: number;
  onDone?: () => void;
  label?: string;
}

export function RestTimer({ seconds, onDone, label }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = Math.max(0, seconds - elapsed);
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        onDone?.();
      }
    };
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [running, seconds, onDone]);

  const mins = Math.floor(remaining / 60);
  const secs = Math.ceil(remaining - mins * 60);
  const pct = Math.max(0, Math.min(100, (remaining / seconds) * 100));

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <span className="mono-eyebrow">{label ?? 'Rest'}</span>
          <span className="stat-num text-xl text-white">
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-coral transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setRunning(false);
          setRemaining(0);
        }}
        className="btn-ghost !px-3 !py-1 !text-xs"
      >
        Skip
      </button>
    </div>
  );
}
