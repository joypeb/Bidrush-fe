import { describe, expect, it } from "vitest";
import { fallbackSnapshot } from "./api";

describe("fallbackSnapshot", () => {
  it("renders a sync failure state without inventing auction items", () => {
    const snapshot = fallbackSnapshot("night-vintage-drop");

    expect(snapshot.syncState).toBe("failed");
    expect(snapshot.title).toBe("Auction state unavailable");
    expect(snapshot.activeItem).toBeNull();
    expect(snapshot.queue).toEqual([]);
  });
});
