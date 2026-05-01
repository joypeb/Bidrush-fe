import type { AuctionRealtimeEvent } from "./types";

type AuctionRealtimeClientOptions = {
  eventId: string;
  apiBaseUrl: string;
  onEvent: (event: AuctionRealtimeEvent) => void;
  onDisconnect: () => void;
  onReconnect: () => void;
};

type AuctionRealtimeClient = {
  disconnect: () => void;
};

export function connectAuctionRealtime(options: AuctionRealtimeClientOptions): AuctionRealtimeClient {
  const url = new URL("/ws", options.apiBaseUrl.replace(/^http/, "ws"));
  const socket = new WebSocket(url);
  let subscriptionReady = false;

  socket.addEventListener("open", () => {
    socket.send("CONNECT\naccept-version:1.2\nheart-beat:0,0\n\n\u0000");
  });

  socket.addEventListener("message", (message) => {
    for (const frame of String(message.data).split("\u0000")) {
      if (!frame.trim()) {
        continue;
      }
      if (frame.startsWith("CONNECTED") && !subscriptionReady) {
        socket.send(`SUBSCRIBE\nid:events-${options.eventId}\ndestination:/topic/events/${options.eventId}\n\n\u0000`);
        subscriptionReady = true;
        options.onReconnect();
        continue;
      }
      if (frame.startsWith("MESSAGE")) {
        const body = frame.slice(frame.indexOf("\n\n") + 2).trim();
        const parsed = JSON.parse(body) as { eventType: AuctionRealtimeEvent["eventType"]; payload: Record<string, unknown> };
        const eventVersion = typeof parsed.payload.eventVersion === "number" ? parsed.payload.eventVersion : Date.now();
        options.onEvent({
          eventId: `${parsed.eventType}:${eventVersion}`,
          eventType: parsed.eventType,
          eventVersion,
          auctionId: options.eventId,
          occurredAt: new Date().toISOString(),
          payload: parsed.payload,
        } as AuctionRealtimeEvent);
      }
    }
  });

  socket.addEventListener("close", options.onDisconnect);
  socket.addEventListener("error", options.onDisconnect);

  return {
    disconnect: () => socket.close(),
  };
}
