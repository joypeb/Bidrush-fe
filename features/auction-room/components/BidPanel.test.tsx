import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BidPanel } from "./BidPanel";
import type { AuctionItem, BidState } from "../types";

const activeItem: AuctionItem = {
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
  status: "ACTIVE",
  endsAt: "2026-05-01T13:03:00Z",
  extensionCount: 0,
};

describe("BidPanel", () => {
  it("asks anonymous bidders to verify before bidding", () => {
    renderPanel({ kind: "loginRequired" });

    expect(screen.getByRole("link", { name: "Verify to bid" })).toHaveAttribute(
      "href",
      "/events/night-vintage-drop/verify",
    );
    expect(screen.getByRole("button", { name: "Bid" })).toBeDisabled();
  });

  it("disables bidding while offline", () => {
    renderPanel({ kind: "offline" });

    expect(screen.getByText("Connection lost. Reconnect before bidding.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Bid" })).toBeDisabled();
  });

  it("shows the server-confirmed next bid amount", () => {
    renderPanel({ kind: "idle" });

    expect(screen.getByLabelText("Bid amount")).toHaveValue(125000);
    expect(screen.getByText("Minimum next bid is ₩125,000")).toBeVisible();
  });
});

function renderPanel(bidState: BidState) {
  render(
    <BidPanel
      eventId="night-vintage-drop"
      activeItem={activeItem}
      bidState={bidState}
      pendingBid={null}
      onSubmit={vi.fn()}
    />,
  );
}
