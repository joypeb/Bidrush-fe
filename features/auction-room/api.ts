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
  const queue = Array.from({ length: 10 }, (_, index) => ({
    id: index === 0 ? "night-jacket-01" : `night-item-${String(index + 1).padStart(2, "0")}`,
    position: index + 1,
    title: index === 0 ? "Faded Olive Field Jacket" : `Night vintage piece ${index + 1}`,
    size: index % 2 === 0 ? "M" : "L",
    condition: "Prepared for live review",
    imageUrl: ["/window.svg", "/globe.svg", "/file.svg", "/next.svg"][index % 4],
    story: "Seeded queue item for the Night Vintage Drop rehearsal.",
    startingPrice: 50000 + index * 7000,
    bidIncrement: index % 3 === 0 ? 5000 : 3000,
    currentPrice: 50000 + index * 7000,
    bidCount: 0,
    highestBidderId: null,
    status: index === 0 ? ("WAITING" as const) : ("WAITING" as const),
    endsAt: null,
    extensionCount: 0,
  }));

  return {
    eventId,
    title: "Night Vintage Drop",
    eventStatus: "SCHEDULED",
    runtimeEnabled: false,
    eventVersion: 0,
    startsAt: "2026-05-01T13:00:00Z",
    serverTime: new Date().toISOString(),
    activeItem: null,
    queue,
    bidderState: "ANONYMOUS",
    recentChat: [],
  };
}
