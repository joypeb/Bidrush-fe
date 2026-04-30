import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { NightVintageDropLobby } from "./NightVintageDropLobby";

describe("NightVintageDropLobby", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("renders the single-event poster facts and honest item readiness", () => {
    render(<NightVintageDropLobby />);

    expect(screen.getByRole("heading", { level: 1, name: "Night Vintage Drop" })).toBeInTheDocument();
    expect(screen.getByText("Tonight at 10 PM")).toBeInTheDocument();
    expect(screen.getByText("30 minutes")).toBeInTheDocument();
    expect(screen.getByText("10 vintage outerwear/sweatshirt pieces")).toBeInTheDocument();
    expect(screen.getByText("Live bids and chat")).toBeInTheDocument();
    expect(screen.getByText("Item teasers are being finalized")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get reminder" })).toBeInTheDocument();
  });

  test("submits a reminder yes and shows masked confirmation", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          eventId: "night-vintage-drop",
          status: "CREATED",
          maskedContact: "b***r@example.com",
          reminderChannel: "EMAIL",
        }),
        { status: 201, headers: { "content-type": "application/json" } },
      ),
    );

    render(<NightVintageDropLobby />);

    await userEvent.type(screen.getByLabelText("Email or phone"), "buyer@example.com");
    await userEvent.click(screen.getByLabelText("Email"));
    await userEvent.click(screen.getByLabelText(/I agree to receive one reminder/));
    await userEvent.click(screen.getByRole("button", { name: "Get reminder" }));

    await waitFor(() => {
      expect(screen.getByText("Reminder set for this drop")).toBeInTheDocument();
    });
    expect(screen.getByText("b***r@example.com via EMAIL")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/events/night-vintage-drop/rsvps",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("shows duplicate RSVP as confirmation instead of failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          title: "Reminder already set",
          detail: "You're already on the reminder list for this drop.",
          maskedContact: "+8210****5678",
        }),
        { status: 409, headers: { "content-type": "application/problem+json" } },
      ),
    );

    render(<NightVintageDropLobby />);

    await userEvent.type(screen.getByLabelText("Email or phone"), "010-1234-5678");
    await userEvent.click(screen.getByLabelText("SMS"));
    await userEvent.click(screen.getByLabelText(/I agree to receive one reminder/));
    await userEvent.click(screen.getByRole("button", { name: "Get reminder" }));

    await waitFor(() => {
      expect(screen.getByText("You're already on the reminder list")).toBeInTheDocument();
    });
    expect(screen.queryByText("We could not save the reminder yet. Please try again.")).not.toBeInTheDocument();
  });

  test("keeps entered values after validation errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 400 }));

    render(<NightVintageDropLobby />);

    const contactInput = screen.getByLabelText("Email or phone");
    await userEvent.type(contactInput, "not-an-email");
    await userEvent.click(screen.getByLabelText("Email"));
    await userEvent.click(screen.getByLabelText(/I agree to receive one reminder/));
    await userEvent.click(screen.getByRole("button", { name: "Get reminder" }));

    await waitFor(() => {
      expect(screen.getByText("Check the contact, reminder channel, and consent fields.")).toBeInTheDocument();
    });
    expect(contactInput).toHaveValue("not-an-email");
  });
});
