import { describe, expect, it } from "vitest";
import { auctionRoomReducer, createAuctionRoomState } from "./auction-room-reducer";
import type { AuctionSnapshot, AuctionRealtimeEvent } from "./types";

const snapshot: AuctionSnapshot = {
  eventId: "night-vintage-drop",
  title: "Night Vintage Drop",
  eventStatus: "LIVE",
  runtimeEnabled: true,
  eventVersion: 2,
  startsAt: "2026-05-01T13:00:00Z",
  serverTime: "2026-05-01T12:58:00Z",
  activeItem: {
    id: "night-jacket-01",
    position: 1,
    title: "Faded Olive Field Jacket",
    size: "M",
    condition: "Good vintage wear",
    imageUrl: "/window.svg",
    story: "Sun-faded cotton shell with clean hardware.",
    startingPrice: 120000,
    bidIncrement: 5000,
    currentPrice: 120000,
    bidCount: 0,
    highestBidderId: null,
    status: "ACTIVE",
    endsAt: "2026-05-01T13:03:00Z",
    extensionCount: 0,
  },
  queue: [],
  bidderState: "READY",
  recentChat: [],
};

describe("auctionRoomReducer", () => {
  it("accepted bid updates server-confirmed price and clears pending state", () => {
    const state = auctionRoomReducer(createAuctionRoomState(snapshot, "bidder-1"), {
      type: "bid.submitted",
      amount: 125000,
      idempotencyKey: "bid-1",
    });

    const next = auctionRoomReducer(state, {
      type: "realtime.event",
      event: event("evt-1", 3, "auction.bid.accepted", {
        auctionItemId: "night-jacket-01",
        currentPrice: 125000,
        bidCount: 1,
        highestBidderId: "bidder-1",
        endsAt: "2026-05-01T13:03:00Z",
        extensionCount: 0,
      }),
    });

    expect(next.activeItem?.currentPrice).toBe(125000);
    expect(next.activeItem?.bidCount).toBe(1);
    expect(next.bidState.kind).toBe("accepted");
    expect(next.pendingBid).toBeNull();
  });

  it("rejected bid clears pending and keeps server-confirmed price separate", () => {
    const state = auctionRoomReducer(createAuctionRoomState(snapshot, "bidder-1"), {
      type: "bid.submitted",
      amount: 121000,
      idempotencyKey: "bid-low",
    });

    const next = auctionRoomReducer(state, {
      type: "realtime.event",
      event: event("evt-reject", 3, "auction.bid.rejected", {
        reason: "TOO_LOW",
        currentPrice: 120000,
        minimumNextBid: 125000,
      }),
    });

    expect(next.activeItem?.currentPrice).toBe(120000);
    expect(next.bidState).toEqual({ kind: "rejected", reason: "TOO_LOW", minimumNextBid: 125000 });
    expect(next.pendingBid).toBeNull();
  });

  it("marks my bidder state as outbid when another bidder wins", () => {
    const winning = createAuctionRoomState(
      {
        ...snapshot,
        bidderState: "WINNING",
        activeItem: snapshot.activeItem && { ...snapshot.activeItem, highestBidderId: "bidder-1" },
      },
      "bidder-1",
    );

    const next = auctionRoomReducer(winning, {
      type: "realtime.event",
      event: event("evt-outbid", 3, "auction.bid.accepted", {
        auctionItemId: "night-jacket-01",
        currentPrice: 130000,
        bidCount: 2,
        highestBidderId: "bidder-2",
        endsAt: "2026-05-01T13:03:00Z",
        extensionCount: 0,
      }),
    });

    expect(next.bidderState).toBe("OUTBID");
    expect(next.bidState.kind).toBe("outbid");
  });

  it("ignores duplicate and stale realtime events", () => {
    const base = createAuctionRoomState(snapshot, "bidder-1");
    const accepted = event("evt-dup", 3, "auction.bid.accepted", {
      auctionItemId: "night-jacket-01",
      currentPrice: 125000,
      bidCount: 1,
      highestBidderId: "bidder-2",
      endsAt: "2026-05-01T13:03:00Z",
      extensionCount: 0,
    });

    const once = auctionRoomReducer(base, { type: "realtime.event", event: accepted });
    const duplicate = auctionRoomReducer(once, { type: "realtime.event", event: accepted });
    const stale = auctionRoomReducer(once, {
      type: "realtime.event",
      event: event("evt-stale", 2, "auction.bid.accepted", {
        auctionItemId: "night-jacket-01",
        currentPrice: 999999,
        bidCount: 99,
        highestBidderId: "bidder-3",
        endsAt: "2026-05-01T13:03:00Z",
        extensionCount: 0,
      }),
    });

    expect(duplicate.activeItem?.bidCount).toBe(1);
    expect(stale.activeItem?.currentPrice).toBe(125000);
  });

  it("snapshot replaces realtime state after reconnect", () => {
    const base = auctionRoomReducer(createAuctionRoomState(snapshot, "bidder-1"), {
      type: "connection.offline",
    });

    const next = auctionRoomReducer(base, {
      type: "snapshot.received",
      snapshot: {
        ...snapshot,
        eventVersion: 9,
        bidderState: "WINNING",
        activeItem: snapshot.activeItem && { ...snapshot.activeItem, currentPrice: 145000, bidCount: 4 },
      },
    });

    expect(next.connectionState).toBe("connected");
    expect(next.eventVersion).toBe(9);
    expect(next.activeItem?.currentPrice).toBe(145000);
    expect(next.bidderState).toBe("WINNING");
  });
});

function event(
  eventId: string,
  eventVersion: number,
  eventType: AuctionRealtimeEvent["eventType"],
  payload: AuctionRealtimeEvent["payload"],
): AuctionRealtimeEvent {
  return {
    eventId,
    eventType,
    eventVersion,
    auctionId: "night-vintage-drop",
    occurredAt: "2026-05-01T12:59:00Z",
    payload,
  } as AuctionRealtimeEvent;
}
