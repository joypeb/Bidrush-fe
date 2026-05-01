"use client";

import Link from "next/link";
import { FormEvent, useId } from "react";
import { formatWon } from "../format";
import type { AuctionItem, BidState, PendingBid } from "../types";

type BidPanelProps = {
  eventId: string;
  activeItem: AuctionItem | null;
  bidState: BidState;
  pendingBid: PendingBid | null;
  onSubmit: (amount: number) => void;
};

export function BidPanel({ eventId, activeItem, bidState, pendingBid, onSubmit }: BidPanelProps) {
  const amountId = useId();
  const nextAmount = activeItem ? activeItem.currentPrice + activeItem.bidIncrement : 0;
  const disabled =
    !activeItem ||
    activeItem.status !== "ACTIVE" ||
    bidState.kind === "loginRequired" ||
    bidState.kind === "offline" ||
    bidState.kind === "closed" ||
    bidState.kind === "submitting";

  function submitBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    if (!disabled) {
      onSubmit(amount);
    }
  }

  return (
    <form
      className="sticky bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] lg:static lg:rounded-[var(--radius-md)] lg:border"
      onSubmit={submitBid}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Place bid</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {activeItem ? `Minimum next bid is ${formatWon(nextAmount)}` : "Waiting for the next item."}
          </p>
        </div>
        {bidState.kind === "loginRequired" && (
          <Link
            className="rounded-[var(--radius-sm)] border border-[var(--color-brand)] px-3 py-2 text-sm font-semibold text-[var(--color-brand)]"
            href={`/events/${eventId}/verify`}
          >
            Verify to bid
          </Link>
        )}
      </div>

      <label className="block text-sm font-medium" htmlFor={amountId}>
        Bid amount
      </label>
      <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
        <input
          id={amountId}
          className="h-11 min-w-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-base tabular-nums outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-soft)]"
          inputMode="numeric"
          min={nextAmount}
          name="amount"
          step={activeItem?.bidIncrement ?? 1000}
          type="number"
          defaultValue={nextAmount}
          key={`${activeItem?.id ?? "none"}-${nextAmount}`}
        />
        <button
          className="h-11 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-5 text-sm font-semibold text-[var(--color-text-inverse)] disabled:cursor-not-allowed disabled:bg-[var(--color-border-strong)]"
          disabled={disabled}
          type="submit"
        >
          {bidState.kind === "submitting" ? "Confirming" : "Bid"}
        </button>
      </div>

      <div className="mt-3 min-h-6 text-sm" aria-live="polite">
        {bidState.kind === "offline" && (
          <p className="text-[var(--color-danger)]">Connection lost. Reconnect before bidding.</p>
        )}
        {bidState.kind === "accepted" && <p className="text-[var(--color-success)]">Server confirmed your bid.</p>}
        {bidState.kind === "outbid" && <p className="text-[var(--color-bid)]">You have been outbid.</p>}
        {bidState.kind === "rejected" && (
          <p className="text-[var(--color-danger)]">
            Bid rejected. {bidState.minimumNextBid ? `Try ${formatWon(bidState.minimumNextBid)} or more.` : ""}
          </p>
        )}
        {pendingBid && bidState.kind === "submitting" && (
          <p className="text-[var(--color-text-muted)]">Waiting for server confirmation at {formatWon(pendingBid.amount)}.</p>
        )}
      </div>
    </form>
  );
}
