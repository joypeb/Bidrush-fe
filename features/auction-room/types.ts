export type AuctionEventStatus = "SCHEDULED" | "LIVE" | "CLOSED";
export type AuctionItemStatus = "WAITING" | "ACTIVE" | "CLOSED";
export type BidderState = "ANONYMOUS" | "READY" | "WINNING" | "OUTBID" | "CLOSED";
export type ConnectionState = "connected" | "reconnecting" | "offline";

export type AuctionItem = {
  id: string;
  position: number;
  title: string;
  size: string;
  condition: string;
  imageUrl: string;
  story: string;
  startingPrice: number;
  bidIncrement: number;
  currentPrice: number;
  bidCount: number;
  highestBidderId: string | null;
  status: AuctionItemStatus;
  endsAt: string | null;
  extensionCount: number;
};

export type ChatMessage = {
  id: string;
  auctionItemId: string | null;
  bidderDisplayName: string;
  message: string;
  systemMessage: boolean;
  createdAt: string;
};

export type AuctionSnapshot = {
  eventId: string;
  title: string;
  eventStatus: AuctionEventStatus;
  runtimeEnabled: boolean;
  eventVersion: number;
  startsAt: string;
  serverTime: string;
  activeItem: AuctionItem | null;
  queue: AuctionItem[];
  bidderState: BidderState;
  recentChat: ChatMessage[];
};

export type BidState =
  | { kind: "idle" }
  | { kind: "editing" }
  | { kind: "submitting" }
  | { kind: "accepted" }
  | { kind: "rejected"; reason: string; minimumNextBid?: number }
  | { kind: "outbid" }
  | { kind: "closed" }
  | { kind: "loginRequired" }
  | { kind: "offline" };

export type PendingBid = {
  amount: number;
  idempotencyKey: string;
};

export type AuctionRoomState = AuctionSnapshot & {
  bidderId: string | null;
  bidState: BidState;
  pendingBid: PendingBid | null;
  connectionState: ConnectionState;
  seenEventIds: string[];
};

export type AuctionRealtimeEvent =
  | {
      eventId: string;
      eventType: "auction.bid.accepted";
      eventVersion: number;
      auctionId: string;
      occurredAt: string;
      payload: {
        auctionItemId: string;
        currentPrice: number;
        bidCount: number;
        highestBidderId: string;
        endsAt: string;
        extensionCount: number;
      };
    }
  | {
      eventId: string;
      eventType: "auction.bid.rejected";
      eventVersion: number;
      auctionId: string;
      occurredAt: string;
      payload: {
        reason: string;
        currentPrice: number;
        minimumNextBid?: number;
      };
    }
  | {
      eventId: string;
      eventType: "chat.message.created";
      eventVersion: number;
      auctionId: string;
      occurredAt: string;
      payload: ChatMessage;
    }
  | {
      eventId: string;
      eventType: "auction.closed";
      eventVersion: number;
      auctionId: string;
      occurredAt: string;
      payload: Partial<AuctionSnapshot>;
    };

export type AuctionRoomAction =
  | { type: "snapshot.received"; snapshot: AuctionSnapshot }
  | { type: "bid.editing" }
  | { type: "bid.submitted"; amount: number; idempotencyKey: string }
  | { type: "realtime.event"; event: AuctionRealtimeEvent }
  | { type: "connection.connected" }
  | { type: "connection.reconnecting" }
  | { type: "connection.offline" };
