import Image from "next/image";
import type { AuctionItem } from "../types";

type ActiveItemPanelProps = {
  activeItem: AuctionItem | null;
  queue: AuctionItem[];
};

export function ActiveItemPanel({ activeItem, queue }: ActiveItemPanelProps) {
  const item = activeItem ?? queue[0] ?? null;

  if (!item) {
    return (
      <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="text-xl font-semibold">Drop details are being prepared</h2>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
        <Image alt="" className="object-contain p-10" fill priority src={item.imageUrl} sizes="(min-width: 1024px) 36vw, 100vw" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--color-brand)]">
          Item {item.position} {item.status === "ACTIVE" ? "is live" : "in queue"}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">{item.title}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {item.size} · {item.condition}
        </p>
        <p className="mt-3 leading-7 text-[var(--color-text-muted)]">{item.story}</p>
      </div>
    </section>
  );
}
