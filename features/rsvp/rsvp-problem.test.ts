import { describe, expect, test } from "vitest";

import { mapRsvpProblem } from "./rsvp-problem";

describe("mapRsvpProblem", () => {
  test("treats duplicate RSVP as a calm confirmation", async () => {
    const response = new Response(
      JSON.stringify({
        title: "Reminder already set",
        detail: "You're already on the reminder list for this drop.",
        maskedContact: "b***r@example.com",
      }),
      { status: 409, headers: { "content-type": "application/problem+json" } },
    );

    await expect(mapRsvpProblem(response)).resolves.toEqual({
      kind: "duplicate",
      message: "You're already on the reminder list for this drop.",
      maskedContact: "b***r@example.com",
    });
  });

  test("maps validation and retryable errors without exposing raw payloads", async () => {
    await expect(mapRsvpProblem(new Response("{}", { status: 400 }))).resolves.toMatchObject({
      kind: "validation",
      message: "Check the contact, reminder channel, and consent fields.",
    });
    await expect(mapRsvpProblem(new Response("{}", { status: 429 }))).resolves.toMatchObject({
      kind: "retry",
      message: "Too many attempts. Keep your details here and try again shortly.",
    });
    await expect(mapRsvpProblem(new Response("{}", { status: 500 }))).resolves.toMatchObject({
      kind: "server",
      message: "We could not save the reminder yet. Please try again.",
    });
  });
});
