"use client";

type AdminControlsProps = {
  enabled: boolean;
  onStartEvent: () => void;
  onStartNext: () => void;
  onCloseEvent: () => void;
};

export function AdminControls({ enabled, onStartEvent, onStartNext, onCloseEvent }: AdminControlsProps) {
  if (!enabled) {
    return null;
  }

  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 className="text-base font-semibold">Admin</h2>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm" onClick={onStartEvent} type="button">
          Start event
        </button>
        <button className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm" onClick={onStartNext} type="button">
          Start next item
        </button>
        <button className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-danger)] px-3 text-sm text-[var(--color-danger)]" onClick={onCloseEvent} type="button">
          Close event
        </button>
      </div>
    </section>
  );
}
