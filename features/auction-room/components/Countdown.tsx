"use client";

import { useEffect, useState } from "react";
import { formatRemainingTime } from "../format";

type CountdownProps = {
  endsAt: string | null;
  serverTime: string;
};

export function Countdown({ endsAt, serverTime }: CountdownProps) {
  const [elapsed, setElapsed] = useState(0);
  const remaining = Math.max(0, secondsUntil(endsAt, serverTime) - elapsed);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-sm font-medium text-[var(--color-text-muted)]">Time left</p>
      <p className="mt-1 text-4xl font-semibold tabular-nums">{formatRemainingTime(remaining)}</p>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Server snapshot controls the auction clock.</p>
    </section>
  );
}

function secondsUntil(endsAt: string | null, serverTime: string) {
  if (!endsAt) {
    return 0;
  }
  return Math.max(0, Math.floor((new Date(endsAt).getTime() - new Date(serverTime).getTime()) / 1000));
}
