import type {
  AuctionItem,
  AuctionRealtimeEvent,
  AuctionRoomAction,
  AuctionRoomState,
  AuctionSnapshot,
  BidState,
  BidderState,
} from "./types";

export function createAuctionRoomState(snapshot: AuctionSnapshot, bidderId: string | null = null): AuctionRoomState {
  return {
    ...snapshot,
    bidderId,
    bidState: bidStateFromSnapshot(snapshot.bidderState, snapshot.eventStatus),
    pendingBid: null,
    connectionState: "connected",
    seenEventIds: [],
  };
}

export function auctionRoomReducer(state: AuctionRoomState, action: AuctionRoomAction): AuctionRoomState {
  switch (action.type) {
    case "snapshot.received":
      return {
        ...createAuctionRoomState(action.snapshot, state.bidderId),
        seenEventIds: state.seenEventIds.slice(-25),
      };
    case "bid.editing":
      return { ...state, bidState: { kind: "editing" } };
    case "bid.submitted":
      return {
        ...state,
        bidState: state.connectionState === "offline" ? { kind: "offline" } : { kind: "submitting" },
        pendingBid: { amount: action.amount, idempotencyKey: action.idempotencyKey },
      };
    case "connection.connected":
      return { ...state, connectionState: "connected" };
    case "connection.reconnecting":
      return { ...state, connectionState: "reconnecting" };
    case "connection.offline":
      return {
        ...state,
        connectionState: "offline",
        bidState: state.bidState.kind === "loginRequired" ? state.bidState : { kind: "offline" },
      };
    case "realtime.event":
      return applyRealtimeEvent(state, action.event);
    default:
      return state;
  }
}

function applyRealtimeEvent(state: AuctionRoomState, event: AuctionRealtimeEvent): AuctionRoomState {
  if (state.seenEventIds.includes(event.eventId) || event.eventVersion <= state.eventVersion) {
    return state;
  }

  const nextBase = {
    ...state,
    eventVersion: event.eventVersion,
    seenEventIds: [...state.seenEventIds.slice(-49), event.eventId],
  };

  switch (event.eventType) {
    case "auction.bid.accepted":
      return applyBidAccepted(nextBase, event);
    case "auction.bid.rejected":
      return {
        ...nextBase,
        pendingBid: null,
        bidState: {
          kind: "rejected",
          reason: event.payload.reason,
          minimumNextBid: event.payload.minimumNextBid,
        },
      };
    case "chat.message.created":
      return {
        ...nextBase,
        recentChat: [...nextBase.recentChat, event.payload].slice(-50),
      };
    case "auction.closed":
      return {
        ...nextBase,
        ...event.payload,
        eventStatus: event.payload.eventStatus ?? "CLOSED",
        runtimeEnabled: event.payload.runtimeEnabled ?? false,
        bidState: { kind: "closed" },
        bidderState: "CLOSED",
        pendingBid: null,
      };
    default:
      return nextBase;
  }
}

function applyBidAccepted(
  state: AuctionRoomState,
  event: Extract<AuctionRealtimeEvent, { eventType: "auction.bid.accepted" }>,
): AuctionRoomState {
  const activeItem = updateAcceptedItem(state.activeItem, event);
  const queue = state.queue.map((item) =>
    item.id === event.payload.auctionItemId ? updateAcceptedQueueItem(item, event) : item,
  );
  const isMine = state.bidderId === event.payload.highestBidderId;
  const wasWinning = state.bidderState === "WINNING";
  const bidderState: BidderState = isMine ? "WINNING" : wasWinning ? "OUTBID" : state.bidderState;
  const bidState: BidState = isMine ? { kind: "accepted" } : wasWinning ? { kind: "outbid" } : state.bidState;

  return {
    ...state,
    activeItem,
    queue,
    bidderState,
    bidState,
    pendingBid: isMine || wasWinning ? null : state.pendingBid,
  };
}

function updateAcceptedQueueItem(
  item: AuctionItem,
  event: Extract<AuctionRealtimeEvent, { eventType: "auction.bid.accepted" }>,
): AuctionItem {
  return {
    ...item,
    currentPrice: event.payload.currentPrice,
    bidCount: event.payload.bidCount,
    highestBidderId: event.payload.highestBidderId,
    endsAt: event.payload.endsAt,
    extensionCount: event.payload.extensionCount,
  };
}

function updateAcceptedItem(
  item: AuctionItem | null,
  event: Extract<AuctionRealtimeEvent, { eventType: "auction.bid.accepted" }>,
): AuctionItem | null {
  if (!item || item.id !== event.payload.auctionItemId) {
    return item;
  }
  return {
    ...item,
    currentPrice: event.payload.currentPrice,
    bidCount: event.payload.bidCount,
    highestBidderId: event.payload.highestBidderId,
    endsAt: event.payload.endsAt,
    extensionCount: event.payload.extensionCount,
  };
}

function bidStateFromSnapshot(bidderState: BidderState, eventStatus: string): BidState {
  if (eventStatus === "CLOSED" || bidderState === "CLOSED") {
    return { kind: "closed" };
  }
  if (bidderState === "ANONYMOUS") {
    return { kind: "loginRequired" };
  }
  if (bidderState === "OUTBID") {
    return { kind: "outbid" };
  }
  if (bidderState === "WINNING") {
    return { kind: "accepted" };
  }
  return { kind: "idle" };
}
