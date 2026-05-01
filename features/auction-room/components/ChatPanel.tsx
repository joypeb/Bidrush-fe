"use client";

import { FormEvent, useState } from "react";
import type { ChatMessage } from "../types";

type ChatPanelProps = {
  messages: ChatMessage[];
  disabled: boolean;
  onSend: (message: string) => void;
};

export function ChatPanel({ messages, disabled, onSend }: ChatPanelProps) {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || disabled) {
      return;
    }
    onSend(message.trim());
    setMessage("");
  }

  return (
    <section className="flex min-h-[360px] flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] p-4">
        <h2 className="text-base font-semibold">Live chat</h2>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">Chat opens with the live item.</p>
        ) : (
          messages.map((chat) => (
            <article key={chat.id} className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] p-3">
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">{chat.bidderDisplayName}</p>
              <p className="mt-1 text-sm">{chat.message}</p>
            </article>
          ))
        )}
      </div>
      <form className="grid grid-cols-[1fr_auto] gap-2 border-t border-[var(--color-border)] p-3" onSubmit={submit}>
        <label className="sr-only" htmlFor="auction-chat-message">
          Chat message
        </label>
        <input
          id="auction-chat-message"
          className="h-10 min-w-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-soft)]"
          disabled={disabled}
          maxLength={500}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button
          className="h-10 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-4 text-sm font-semibold text-[var(--color-text-inverse)] disabled:cursor-not-allowed disabled:bg-[var(--color-border-strong)]"
          disabled={disabled}
          type="submit"
        >
          Send
        </button>
      </form>
    </section>
  );
}
