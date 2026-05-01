"use client";

import { useEffect, useReducer, useState } from "react";
import { AdminControls } from "./components/AdminControls";
import { ActiveItemPanel } from "./components/ActiveItemPanel";
import { BidPanel } from "./components/BidPanel";
import { ChatPanel } from "./components/ChatPanel";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { Countdown } from "./components/Countdown";
import { CurrentPrice } from "./components/CurrentPrice";
import { apiBaseUrl, getAuctionSnapshot } from "./api";
import { auctionRoomReducer, createAuctionRoomState } from "./auction-room-reducer";
import { connectAuctionRealtime } from "./realtime";
import type { AuctionSnapshot } from "./types";

type AuctionRoomClientProps = {
  initialSnapshot: AuctionSnapshot;
};

export function AuctionRoomClient({ initialSnapshot }: AuctionRoomClientProps) {
  const [state, dispatch] = useReducer(
    auctionRoomReducer,
    initialSnapshot,
    (snapshot) => createAuctionRoomState(snapshot, null),
  );
  const [notice, setNotice] = useState("");
  const adminEnabled = process.env.NEXT_PUBLIC_ENABLE_ADMIN_CONTROLS === "true";

  useEffect(() => {
    let mounted = true;

    async function refreshSnapshot() {
      try {
        const snapshot = await getAuctionSnapshot(initialSnapshot.eventId);
        if (mounted) {
          dispatch({ type: "snapshot.received", snapshot });
        }
      } catch {
        if (mounted) {
          dispatch({ type: "connection.offline" });
        }
      }
    }

    void refreshSnapshot();
    const client = connectAuctionRealtime({
      eventId: initialSnapshot.eventId,
      apiBaseUrl,
      onEvent: (event) => dispatch({ type: "realtime.event", event }),
      onDisconnect: () => dispatch({ type: "connection.offline" }),
      onReconnect: () => {
        dispatch({ type: "connection.reconnecting" });
        void refreshSnapshot();
      },
    });

    return () => {
      mounted = false;
      client.disconnect();
    };
  }, [initialSnapshot.eventId]);

  async function submitBid(amount: number) {
    const idempotencyKey = crypto.randomUUID();
    dispatch({ type: "bid.submitted", amount, idempotencyKey });
    const response = await fetch(`${apiBaseUrl}/api/events/${state.eventId}/bids`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        "idempotency-key": idempotencyKey,
      },
      body: JSON.stringify({ auctionItemId: state.activeItem?.id, amount }),
    });
    if (response.ok) {
      dispatch({ type: "snapshot.received", snapshot: await getAuctionSnapshot(state.eventId) });
      return;
    }
    if (response.status === 401) {
      setNotice("Verify before bidding.");
      return;
    }
    const problem = (await response.json().catch(() => null)) as { reason?: string; minimumNextBid?: number } | null;
    dispatch({
      type: "realtime.event",
      event: {
        eventId: `local-rejected-${idempotencyKey}`,
        eventType: "auction.bid.rejected",
        eventVersion: state.eventVersion + 1,
        auctionId: state.eventId,
        occurredAt: new Date().toISOString(),
        payload: {
          reason: problem?.reason ?? "REJECTED",
          currentPrice: state.activeItem?.currentPrice ?? 0,
          minimumNextBid: problem?.minimumNextBid,
        },
      },
    });
  }

  async function sendChat(message: string) {
    if (!state.activeItem) {
      return;
    }
    const response = await fetch(`${apiBaseUrl}/api/events/${state.eventId}/chat-messages`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ auctionItemId: state.activeItem.id, message }),
    });
    if (!response.ok) {
      setNotice(response.status === 429 ? "Chat cooldown is active." : "Chat could not be sent.");
    }
  }

  async function runAdmin(path: string) {
    const adminKey = window.prompt("Admin key");
    if (!adminKey) {
      return;
    }
    const response = await fetch(`${apiBaseUrl}/api/admin/events/${state.eventId}/${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-bidrush-admin-key": adminKey,
        "idempotency-key": crypto.randomUUID(),
      },
      body: JSON.stringify({ expectedActiveItemId: state.activeItem?.id ?? null, expectedEventVersion: state.eventVersion }),
    });
    if (response.ok) {
      dispatch({ type: "snapshot.received", snapshot: (await response.json()) as AuctionSnapshot });
    } else {
      setNotice("Admin command was rejected. Refresh snapshot before retrying.");
    }
  }

  const visibleItem = state.activeItem ?? state.queue[0] ?? null;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">BidRush</p>
          <p className="font-semibold">{state.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm">
            {state.eventStatus}
          </span>
          <ConnectionStatus state={state.connectionState} />
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-20 sm:px-6 lg:grid-cols-[0.95fr_0.9fr_0.8fr] lg:px-8">
        <div className="space-y-5">
          <ActiveItemPanel activeItem={state.activeItem} queue={state.queue} />
          <AdminControls
            enabled={adminEnabled}
            onCloseEvent={() => void runAdmin("close-event")}
            onStartEvent={() => void runAdmin("start-event")}
            onStartNext={() => void runAdmin("start-next-item")}
          />
        </div>

        <div className="space-y-4">
          <CurrentPrice currentPrice={visibleItem?.currentPrice ?? 0} bidCount={visibleItem?.bidCount ?? 0} />
          <Countdown
            endsAt={state.activeItem?.endsAt ?? null}
            key={`${state.activeItem?.endsAt ?? "waiting"}-${state.serverTime}`}
            serverTime={state.serverTime}
          />
          <BidPanel
            activeItem={state.activeItem}
            bidState={state.bidState}
            eventId={state.eventId}
            pendingBid={state.pendingBid}
            onSubmit={submitBid}
          />
          {notice && (
            <p className="rounded-[var(--radius-sm)] border border-[var(--color-bid)] bg-[var(--color-bid-soft)] p-3 text-sm" aria-live="polite">
              {notice}
            </p>
          )}
        </div>

        <ChatPanel
          disabled={!state.activeItem || state.connectionState === "offline" || state.bidState.kind === "loginRequired"}
          messages={state.recentChat}
          onSend={sendChat}
        />
      </section>
    </main>
  );
}
