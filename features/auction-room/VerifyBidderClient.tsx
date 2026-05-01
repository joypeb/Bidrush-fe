"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiBaseUrl } from "./api";

type VerifyBidderClientProps = {
  eventId: string;
};

type Step =
  | { kind: "contact" }
  | { kind: "code"; verificationId: string; maskedContact: string; devCode: string }
  | { kind: "verified"; maskedContact: string };

export function VerifyBidderClient({ eventId }: VerifyBidderClientProps) {
  const [contactType, setContactType] = useState<"EMAIL" | "PHONE">("EMAIL");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>({ kind: "contact" });
  const [error, setError] = useState("");

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const response = await fetch(`${apiBaseUrl}/api/bidder-verifications`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contactType, contact }),
    });
    if (!response.ok) {
      setError("Check the contact and try again.");
      return;
    }
    const body = (await response.json()) as { verificationId: string; maskedContact: string; devCode: string };
    setCode(body.devCode);
    setStep({ kind: "code", ...body });
  }

  async function confirmCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "code") {
      return;
    }
    setError("");
    const response = await fetch(`${apiBaseUrl}/api/bidder-verifications/${step.verificationId}/confirm`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      setError("The code did not verify. Request a new code if needed.");
      return;
    }
    const body = (await response.json()) as { maskedContact: string };
    setStep({ kind: "verified", maskedContact: body.maskedContact });
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-6 text-[var(--color-text)]">
      <section className="mx-auto max-w-md rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-sm font-semibold text-[var(--color-brand)]">BidRush verification</p>
        <h1 className="mt-2 text-3xl font-semibold">Verify to bid</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          Verification is tied to this event. Bidder session is stored in an HttpOnly cookie.
        </p>

        {step.kind === "contact" && (
          <form className="mt-5 space-y-4" onSubmit={requestCode}>
            <fieldset className="grid grid-cols-2 gap-2">
              <legend className="sr-only">Contact type</legend>
              {(["EMAIL", "PHONE"] as const).map((type) => (
                <label
                  className={`flex h-11 items-center justify-center rounded-[var(--radius-sm)] border text-sm font-semibold ${
                    contactType === type
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]"
                      : "border-[var(--color-border)]"
                  }`}
                  key={type}
                >
                  <input
                    className="sr-only"
                    checked={contactType === type}
                    name="contactType"
                    type="radio"
                    onChange={() => setContactType(type)}
                  />
                  {type === "EMAIL" ? "Email" : "Phone"}
                </label>
              ))}
            </fieldset>
            <label className="block text-sm font-medium" htmlFor="bidder-contact">
              Email or phone
            </label>
            <input
              id="bidder-contact"
              className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
            <button className="h-11 w-full rounded-[var(--radius-sm)] bg-[var(--color-brand)] font-semibold text-[var(--color-text-inverse)]" type="submit">
              Send code
            </button>
          </form>
        )}

        {step.kind === "code" && (
          <form className="mt-5 space-y-4" onSubmit={confirmCode}>
            <p className="text-sm text-[var(--color-text-muted)]">Code sent to {step.maskedContact}</p>
            <label className="block text-sm font-medium" htmlFor="bidder-code">
              Verification code
            </label>
            <input
              id="bidder-code"
              className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 tabular-nums"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <button className="h-11 w-full rounded-[var(--radius-sm)] bg-[var(--color-brand)] font-semibold text-[var(--color-text-inverse)]" type="submit">
              Confirm
            </button>
          </form>
        )}

        {step.kind === "verified" && (
          <div className="mt-5 rounded-[var(--radius-sm)] border border-[var(--color-success)] bg-[var(--color-success-soft)] p-4">
            <p className="font-semibold text-[var(--color-success)]">Verified as {step.maskedContact}</p>
            <Link className="mt-3 inline-flex h-10 items-center rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-4 text-sm font-semibold text-[var(--color-text-inverse)]" href={`/events/${eventId}`}>
              Return to event
            </Link>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-[var(--radius-sm)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-3 text-sm text-[var(--color-danger)]" aria-live="polite">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
