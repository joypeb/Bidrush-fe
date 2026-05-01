import { formatWon } from "../format";

type CurrentPriceProps = {
  currentPrice: number;
  bidCount: number;
};

export function CurrentPrice({ currentPrice, bidCount }: CurrentPriceProps) {
  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-sm font-medium text-[var(--color-text-muted)]">Current price</p>
      <p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--color-brand-strong)]">
        {formatWon(currentPrice)}
      </p>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{bidCount} server-confirmed bids</p>
    </section>
  );
}
