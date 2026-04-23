import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  crosshair?: boolean;
  ambient?: boolean;
  id?: string;
}

export function Card({ children, className = '', crosshair = false, ambient = false, id }: CardProps) {
  return (
    <div
      id={id}
      className={`card card-lift p-5 ${ambient ? 'ambient' : ''} ${crosshair ? 'crosshair' : ''} ${className}`}
    >
      {children}
      {crosshair && (
        <>
          <span className="cross-bl" />
          <span className="cross-br" />
        </>
      )}
    </div>
  );
}

interface StatProps {
  value: string | number;
  label: string;
  sub?: string;
}

export function Stat({ value, label, sub }: StatProps) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="stat-num text-3xl leading-none text-white sm:text-4xl">{value}</span>
      <span className="mono-eyebrow mt-2">{label}</span>
      {sub && <span className="mt-1 truncate text-xs text-muted-light">{sub}</span>}
    </div>
  );
}
