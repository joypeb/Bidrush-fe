import type { ConnectionState } from "../types";

type ConnectionStatusProps = {
  state: ConnectionState;
};

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  const label =
    state === "connected" ? "Connected" : state === "reconnecting" ? "Reconnecting snapshot" : "Offline";
  const className =
    state === "connected"
      ? "border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success)]"
      : state === "reconnecting"
        ? "border-[var(--color-bid)] bg-[var(--color-bid-soft)] text-[var(--color-text)]"
        : "border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]";

  return (
    <span className={`rounded-[var(--radius-sm)] border px-3 py-1 text-sm font-medium ${className}`}>{label}</span>
  );
}
