import type { AuctionSnapshot } from "./types";

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export async function getAuctionSnapshot(eventId: string): Promise<AuctionSnapshot> {
  const response = await fetch(`${apiBaseUrl}/api/events/${eventId}/snapshot`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("snapshot failed");
  }
  return (await response.json()) as AuctionSnapshot;
}

export function fallbackSnapshot(eventId: string): AuctionSnapshot {
  return {
    eventId,
    title: "Auction state unavailable",
    eventStatus: "SCHEDULED",
    runtimeEnabled: false,
    eventVersion: 0,
    startsAt: "2026-05-01T13:00:00Z",
    serverTime: new Date().toISOString(),
    syncState: "failed",
    activeItem: null,
    queue: [],
    bidderState: "ANONYMOUS",
    recentChat: [],
  };
}
