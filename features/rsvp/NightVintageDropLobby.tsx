"use client";

import { FormEvent, useId, useState } from "react";

import { mapRsvpProblem, type RsvpProblem } from "./rsvp-problem";

const eventId = "night-vintage-drop";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type ReminderChannel = "EMAIL" | "SMS";
type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; maskedContact: string; channel: ReminderChannel }
  | { kind: "duplicate"; maskedContact?: string }
  | { kind: "error"; problem: RsvpProblem };

type RsvpResponse = {
  maskedContact: string;
  reminderChannel: ReminderChannel;
};

export function NightVintageDropLobby() {
  const contactId = useId();
  const emailChannelId = useId();
  const smsChannelId = useId();
  const consentId = useId();
  const [contact, setContact] = useState("");
  const [channel, setChannel] = useState<ReminderChannel>("EMAIL");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });

  async function submitReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consentAccepted) {
      setSubmitState({
        kind: "error",
        problem: {
          kind: "validation",
          message: "Check the contact, reminder channel, and consent fields.",
        },
      });
      return;
    }

    setSubmitState({ kind: "submitting" });

    const response = await fetch(`${apiBaseUrl}/api/events/${eventId}/rsvps`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        contactType: channel === "EMAIL" ? "EMAIL" : "PHONE",
        contact,
        reminderChannel: channel,
        reminderIntent: true,
        consentAccepted,
        source: "lobby",
      }),
    });

    if (response.ok) {
      const body = (await response.json()) as RsvpResponse;
      setSubmitState({ kind: "success", maskedContact: body.maskedContact, channel: body.reminderChannel });
      return;
    }

    const problem = await mapRsvpProblem(response);
    if (problem.kind === "duplicate") {
      setSubmitState({ kind: "duplicate", maskedContact: problem.maskedContact });
      return;
    }
    setSubmitState({ kind: "error", problem });
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <span className="text-base font-semibold tracking-normal">BidRush</span>
        <span className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-text-muted)]">
          Thu 10 PM drop
        </span>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_1.05fr_0.9fr] lg:px-8">
        <section className="flex flex-col justify-center gap-5 py-4 lg:min-h-[620px]" aria-labelledby="event-title">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase text-[var(--color-brand)]">Single-event live auction</p>
            <h1 id="event-title" className="max-w-xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
              Night Vintage Drop
            </h1>
            <p className="max-w-lg text-lg leading-7 text-[var(--color-text-muted)]">
              10 vintage outerwear/sweatshirt pieces, 30 minutes, live bids and chat.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:max-w-lg">
            <PosterFact label="Starts" value="Tonight at 10 PM" />
            <PosterFact label="Duration" value="30 minutes" />
            <PosterFact label="Drop" value="10 vintage outerwear/sweatshirt pieces" />
            <PosterFact label="Format" value="Live bids and chat" />
          </dl>
        </section>

        <section className="flex flex-col justify-center gap-4" aria-labelledby="item-readiness-title">
          <div className="aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex h-full flex-col justify-between p-5">
              <div>
                <h2 id="item-readiness-title" className="text-xl font-semibold">
                  Item teasers are being finalized
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Seller intake requires usable photos, size, condition, starting price, bid increment, story, and
                  fulfillment terms before the drop is seeded.
                </p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text-muted)]">
                Prepared item photos will appear here once intake rows are complete. No fake 10-item rail is shown.
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">0 of 10 intake rows ready for seeding</p>
        </section>

        <section className="self-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Get reminder</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              We will use this once for this exact drop. Demand gate needs 15 consented reminders before auction runtime
              work continues.
            </p>
          </div>

          <form className="space-y-4" onSubmit={submitReminder}>
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor={contactId}>
                Email or phone
              </label>
              <input
                id={contactId}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-base outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-soft)]"
                inputMode={channel === "SMS" ? "tel" : "email"}
                value={contact}
                onChange={(event) => setContact(event.target.value)}
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Reminder channel</legend>
              <div className="grid grid-cols-2 gap-2">
                <ChannelOption
                  checked={channel === "EMAIL"}
                  id={emailChannelId}
                  label="Email"
                  value="EMAIL"
                  onChange={setChannel}
                />
                <ChannelOption
                  checked={channel === "SMS"}
                  id={smsChannelId}
                  label="SMS"
                  value="SMS"
                  onChange={setChannel}
                />
              </div>
            </fieldset>

            <label className="flex gap-3 text-sm leading-6 text-[var(--color-text-muted)]" htmlFor={consentId}>
              <input
                id={consentId}
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-[var(--color-border)]"
                checked={consentAccepted}
                onChange={(event) => setConsentAccepted(event.target.checked)}
              />
              <span>I agree to receive one reminder for the Night Vintage Drop.</span>
            </label>

            <button
              className="h-11 w-full rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-4 text-base font-semibold text-[var(--color-text-inverse)] transition hover:bg-[var(--color-brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={submitState.kind === "submitting"}
              type="submit"
            >
              {submitState.kind === "submitting" ? "Saving reminder" : "Get reminder"}
            </button>
          </form>

          <ReminderStatus state={submitState} />

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[var(--color-border)] pt-4 text-center text-xs text-[var(--color-text-muted)]">
            <span>Verified bidders</span>
            <span>Server-confirmed bids</span>
            <span>Manual settlement</span>
          </div>
        </section>
      </section>
    </main>
  );
}

function PosterFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <dt className="text-xs font-medium uppercase text-[var(--color-text-subtle)]">{label}</dt>
      <dd className="mt-1 text-base font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function ChannelOption({
  checked,
  id,
  label,
  value,
  onChange,
}: {
  checked: boolean;
  id: string;
  label: string;
  value: ReminderChannel;
  onChange: (value: ReminderChannel) => void;
}) {
  return (
    <label
      className="flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] has-[:checked]:border-[var(--color-brand)] has-[:checked]:bg-[var(--color-brand-soft)]"
      htmlFor={id}
    >
      <input
        checked={checked}
        className="sr-only"
        id={id}
        name="reminder-channel"
        onChange={() => onChange(value)}
        type="radio"
        value={value}
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

function ReminderStatus({ state }: { state: SubmitState }) {
  return (
    <div aria-live="polite" className="mt-4 min-h-12">
      {state.kind === "idle" && (
        <p className="rounded-[var(--radius-sm)] bg-[var(--color-brand-soft)] p-3 text-sm text-[var(--color-brand-strong)]">
          Be one of the first 15 reminders.
        </p>
      )}
      {state.kind === "success" && (
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-success-soft)] p-3 text-sm text-[var(--color-success)]">
          <p className="font-semibold">Reminder set for this drop</p>
          <p className="mt-1">{state.maskedContact} via {state.channel}</p>
        </div>
      )}
      {state.kind === "duplicate" && (
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-info-soft)] p-3 text-sm text-[var(--color-info)]">
          <p className="font-semibold">{"You're already on the reminder list"}</p>
          {state.maskedContact && <p className="mt-1">{state.maskedContact}</p>}
        </div>
      )}
      {state.kind === "error" && (
        <p className="rounded-[var(--radius-sm)] bg-[var(--color-danger-soft)] p-3 text-sm text-[var(--color-danger)]">
          {state.problem.message}
        </p>
      )}
    </div>
  );
}
